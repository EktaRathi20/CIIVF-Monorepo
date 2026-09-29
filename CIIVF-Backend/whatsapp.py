import json
import logging
import os
from pathlib import Path
import re
import sqlite3
import time

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

logger = logging.getLogger(__name__)
PHONE_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")


class WhatsAppNotConfigured(RuntimeError):
    pass


class VerificationRateLimit(RuntimeError):
    pass


class InvalidVerification(RuntimeError):
    pass


def _database_path():
    configured_path = os.getenv("WHATSAPP_DATABASE_PATH")
    if configured_path:
        return Path(configured_path).expanduser()
    return Path(__file__).resolve().parent / ".local" / "whatsapp.sqlite3"


def _connect():
    database_path = _database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(database_path, timeout=10)


def _initialize_database():
    with _connect() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
                phone TEXT PRIMARY KEY,
                verified_at TEXT NOT NULL,
                subscribed_at TEXT NOT NULL
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS whatsapp_verification_limits (
                phone TEXT PRIMARY KEY,
                window_started REAL NOT NULL,
                attempt_count INTEGER NOT NULL,
                last_attempt REAL NOT NULL
            )"""
        )


def _twilio_credentials_ready():
    return all(os.getenv(name) for name in (
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_VERIFY_SERVICE_SID",
    ))


def _delivery_credentials_ready():
    return all(os.getenv(name) for name in (
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_MESSAGING_SERVICE_SID",
        "TWILIO_WHATSAPP_CONTENT_SID",
    ))


def get_configuration_status():
    return {
        "verification_configured": _twilio_credentials_ready(),
        "delivery_configured": _delivery_credentials_ready(),
    }


def _client():
    return Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])


def _validate_phone(phone):
    if not PHONE_PATTERN.fullmatch(phone):
        raise ValueError("Phone number must be in E.164 format, for example +14155552671.")


def _record_verification_attempt(phone):
    _initialize_database()
    now = time.time()
    with _connect() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT window_started, attempt_count, last_attempt "
            "FROM whatsapp_verification_limits WHERE phone = ?",
            (phone,),
        ).fetchone()

        if row is not None and now - row[0] < 60:
            raise VerificationRateLimit("Wait one minute before requesting another WhatsApp code.")
        if row is not None and now - row[0] < 3600 and row[1] >= 3:
            raise VerificationRateLimit("Too many code requests for this number. Try again in an hour.")

        window_started = row[0] if row is not None and now - row[0] < 3600 else now
        attempt_count = row[1] + 1 if row is not None and now - row[0] < 3600 else 1
        connection.execute(
            "INSERT INTO whatsapp_verification_limits "
            "(phone, window_started, attempt_count, last_attempt) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(phone) DO UPDATE SET window_started = excluded.window_started, "
            "attempt_count = excluded.attempt_count, last_attempt = excluded.last_attempt",
            (phone, window_started, attempt_count, now),
        )


def start_verification(phone):
    _validate_phone(phone)
    if not _twilio_credentials_ready():
        raise WhatsAppNotConfigured("Twilio Verify is not configured on the backend.")
    _record_verification_attempt(phone)

    try:
        service_sid = os.environ["TWILIO_VERIFY_SERVICE_SID"]
        _client().verify.v2.services(service_sid).verifications.create(
            to=phone,
            channel="whatsapp",
        )
    except TwilioRestException as error:
        logger.warning("Twilio WhatsApp verification request failed (code %s).", error.code)
        raise RuntimeError("Twilio could not send a verification code. Check the Verify service and recipient configuration.") from error


def check_verification(phone, code, action):
    _validate_phone(phone)
    if not _twilio_credentials_ready():
        raise WhatsAppNotConfigured("Twilio Verify is not configured on the backend.")

    try:
        service_sid = os.environ["TWILIO_VERIFY_SERVICE_SID"]
        check = _client().verify.v2.services(service_sid).verification_checks.create(
            to=phone,
            code=code,
        )
    except TwilioRestException as error:
        logger.warning("Twilio WhatsApp verification check failed (code %s).", error.code)
        raise RuntimeError("Twilio could not validate the code. Request a new code and try again.") from error

    if check.status != "approved":
        raise InvalidVerification("The code is invalid or expired.")

    _initialize_database()
    with _connect() as connection:
        if action == "subscribe":
            from datetime import datetime, timezone

            verified_at = datetime.now(timezone.utc).isoformat()
            connection.execute(
                "INSERT INTO whatsapp_subscribers (phone, verified_at, subscribed_at) VALUES (?, ?, ?) "
                "ON CONFLICT(phone) DO UPDATE SET verified_at = excluded.verified_at, "
                "subscribed_at = excluded.subscribed_at",
                (phone, verified_at, verified_at),
            )
        else:
            connection.execute("DELETE FROM whatsapp_subscribers WHERE phone = ?", (phone,))


def _subscribed_numbers():
    _initialize_database()
    with _connect() as connection:
        return [row[0] for row in connection.execute("SELECT phone FROM whatsapp_subscribers")]


def send_alert_to_subscribers(alert):
    if not _delivery_credentials_ready():
        logger.info("WhatsApp alert delivery skipped; Twilio Messaging is not configured.")
        return

    phones = _subscribed_numbers()
    if not phones:
        return

    client = _client()
    messaging_service_sid = os.environ["TWILIO_MESSAGING_SERVICE_SID"]
    content_sid = os.environ["TWILIO_WHATSAPP_CONTENT_SID"]
    variables = {
        "1": str(alert["title"])[:100],
        "2": str(alert["severity"]).upper(),
        "3": str(alert["location"]["name"])[:100],
        "4": str(alert["description"])[:500],
    }

    sent_count = 0
    for phone in phones:
        try:
            client.messages.create(
                to=f"whatsapp:{phone}",
                messaging_service_sid=messaging_service_sid,
                content_sid=content_sid,
                content_variables=json.dumps(variables),
            )
            sent_count += 1
        except TwilioRestException as error:
            logger.warning("Twilio WhatsApp message failed for a subscriber (code %s).", error.code)

    logger.info("WhatsApp climate alert queued for %s of %s subscribers.", sent_count, len(phones))