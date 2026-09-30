from collections import deque
from datetime import datetime, timezone
import hmac
import ipaddress
import os
from typing import Any, Literal
from uuid import uuid4

from fastapi import BackgroundTasks, FastAPI, Header, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import socketio
import ee
from ingestion_layer.population import fetch_population
from ingestion_layer.places import fetch_critical_infrastructure
from ingestion_layer.weather import fetch_7_day_forecast
from ingestion_layer.weather import fetch_meteorological_telemetry
from ingestion_layer.disaster_history import fetch_historical_disasters
from ingestion_layer.gee import init_gee
from ingestion_layer.constant import REGION_DATA
from ingestion_layer.index import run_ingestion
from whatsapp import (
    InvalidVerification,
    VerificationRateLimit,
    WhatsAppNotConfigured,
    check_verification,
    get_configuration_status,
    send_alert_to_subscribers,
    start_verification,
)
from google import genai
from google.genai import types
import json

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

api_app = FastAPI(
    title="CIIVF Digital Twin API",
    description="Backend API powering the Municipal Resilience & Disaster Digital Twin",
    version="1.0.0"
)

# CORS
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "*"                      
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Earth Engine once at server startup
@api_app.on_event("startup")
def startup_event():
    try:
        init_gee()
        print("Google Earth Engine initialized for API server.")
    except Exception as e:
        print(f"Earth Engine Initialization Warning: {e}")

# 3. Health check route
@api_app.get("/api/health")
def health_check():
    return {"status": "online", "service": "CIIVF Engine"}

# 4. Population API Route
@api_app.get("/api/population")
def get_population(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_population(region_key=region)
        return data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/api/shelter")
def get_shelter(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_critical_infrastructure(region_key=region)
        return data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/api/current-conditions")
def get_current_conditions(region: str = Query("vizag", description="Region key")):
    try:
        return fetch_meteorological_telemetry(region_key=region)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error))

@api_app.get("/api/forecast")
@api_app.get("/api/forcast", include_in_schema=False)
def get_forcast(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_7_day_forecast(region_key=region)
        return data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/api/history")
def get_history(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_historical_disasters(region_key=region)
        return data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/api/region")
def get_region():
    try:
        return REGION_DATA
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AlertLocation(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    region_key: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ClimateAlertInput(BaseModel):
    hazard_type: str = Field(min_length=1, max_length=80)
    severity: Literal["critical", "high", "moderate", "low"]
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    location: AlertLocation
    source: str = Field(min_length=1, max_length=120)
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    measurements: dict[str, Any] = Field(default_factory=dict)


class SimulatorAlertInput(BaseModel):
    region_key: str = Field(min_length=1, max_length=80)
    tier: Literal["YELLOW", "ORANGE", "RED"]
    ward: str = Field(min_length=1, max_length=160)


class WhatsAppVerificationStart(BaseModel):
    phone: str = Field(pattern=r"^\+[1-9]\d{7,14}$")


class WhatsAppVerificationCheck(BaseModel):
    phone: str = Field(pattern=r"^\+[1-9]\d{7,14}$")
    code: str = Field(pattern=r"^\d{4,10}$")
    action: Literal["subscribe", "unsubscribe"]


@api_app.get("/api/whatsapp/configuration")
def whatsapp_configuration():
    return get_configuration_status()


@api_app.post("/api/whatsapp/verification/start", status_code=202)
def start_whatsapp_verification(request: WhatsAppVerificationStart):
    try:
        start_verification(request.phone)
        return {"status": "pending"}
    except VerificationRateLimit as error:
        raise HTTPException(status_code=429, detail=str(error))
    except WhatsAppNotConfigured as error:
        raise HTTPException(status_code=503, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error))


@api_app.post("/api/whatsapp/verification/check")
def check_whatsapp_verification(request: WhatsAppVerificationCheck):
    try:
        check_verification(request.phone, request.code, request.action)
        return {"status": "approved", "action": request.action}
    except InvalidVerification as error:
        raise HTTPException(status_code=400, detail=str(error))
    except WhatsAppNotConfigured as error:
        raise HTTPException(status_code=503, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error))


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
)
alerts: deque[dict[str, Any]] = deque(maxlen=500)


@api_app.get("/api/alerts")
def list_alerts(limit: int = Query(100, ge=1, le=500)):
    return [alert for alert in alerts if not alert.get("is_simulation")][:limit]


@api_app.post("/api/alerts", status_code=201)
async def ingest_alert(
    alert: ClimateAlertInput,
    background_tasks: BackgroundTasks,
    x_alert_ingest_token: str | None = Header(default=None),
):
    expected_token = os.getenv("ALERT_INGEST_TOKEN")
    if not expected_token:
        raise HTTPException(status_code=503, detail="Alert ingestion is not configured")
    if not x_alert_ingest_token or not hmac.compare_digest(x_alert_ingest_token, expected_token):
        raise HTTPException(status_code=401, detail="Invalid alert ingestion token")
    if alert.location.region_key and alert.location.region_key not in REGION_DATA:
        raise HTTPException(status_code=422, detail="Unknown location region_key")

    record = alert.model_dump(mode="json")
    record["id"] = str(uuid4())
    record["received_at"] = datetime.now(timezone.utc).isoformat()
    alerts.appendleft(record)
    await sio.emit("climate_alert", record)
    if get_configuration_status()["delivery_configured"]:
        background_tasks.add_task(send_alert_to_subscribers, record)
    return record


@api_app.post("/api/simulator/alerts", status_code=201)
async def broadcast_simulator_alert(
    request: Request,
    payload: SimulatorAlertInput,
    background_tasks: BackgroundTasks,
):
    client_host = request.client.host if request.client else ""
    try:
        is_loopback = ipaddress.ip_address(client_host).is_loopback
    except ValueError:
        is_loopback = False
    if not is_loopback:
        raise HTTPException(status_code=403, detail="Simulator broadcasts are available only from a local development session.")
    if payload.region_key not in REGION_DATA:
        raise HTTPException(status_code=422, detail="Unknown region_key")

    tier = payload.tier
    region = REGION_DATA[payload.region_key]
    values = {
        "YELLOW": {"severity": "moderate", "wind_speed_kmh": 76, "pressure_hpa": 1001, "storm_surge_meters": 0.8},
        "ORANGE": {"severity": "high", "wind_speed_kmh": 101, "pressure_hpa": 988, "storm_surge_meters": 1.5},
        "RED": {"severity": "critical", "wind_speed_kmh": 145, "pressure_hpa": 970, "storm_surge_meters": 2.8},
    }[tier]
    region_name = region["name"]
    record = {
        "id": str(uuid4()),
        "hazard_type": "simulated_cyclone_risk",
        "severity": values["severity"],
        "title": f"SIMULATION: {tier} zone exercise · {payload.ward}",
        "description": (
            f"Exercise message for {payload.ward}, {region_name}: the {tier} risk scenario is active. "
            f"Simulated wind {values['wind_speed_kmh']} km/h, pressure {values['pressure_hpa']} hPa, "
            f"and surge {values['storm_surge_meters']:.1f} m. This is a test alert, not a live warning."
        ),
        "location": {
            "name": payload.ward,
            "region_key": payload.region_key,
            "latitude": (region["min_lat"] + region["max_lat"]) / 2,
            "longitude": (region["min_lon"] + region["max_lon"]) / 2,
        },
        "source": "simulator",
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "received_at": datetime.now(timezone.utc).isoformat(),
        "measurements": {**values, "tier": tier, "simulated": True},
        "is_simulation": True,
        "simulation_tier": tier,
    }
    alerts.appendleft(record)
    await sio.emit("climate_alert", record)
    delivery_configured = get_configuration_status()["delivery_configured"]
    if delivery_configured:
        background_tasks.add_task(send_alert_to_subscribers, record)
    return {
        "alert": record,
        "channels": {
            "socket_io": "broadcasted",
            "whatsapp": "queued" if delivery_configured else "not_configured",
        },
    }

# @api_app.get("/api/disaster-intelligence/{region}")
# async def get_disaster_intelligence(region: str):
#     try:
#         unified_data = run_ingestion(region)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Data Ingestion Error: {str(e)}")

#     telemetry = unified_data.get("meteorological_telemetry") or unified_data.get("current_condition") or {}
#     metrics = telemetry.get("metrics") if isinstance(telemetry, dict) else {}
#     wind = telemetry.get("wind_speed_kmh")
#     if wind is None and isinstance(metrics, dict):
#         wind = metrics.get("peak_wind_kmh") or 0
#     pressure = telemetry.get("pressure_hpa")
#     if pressure is None and isinstance(metrics, dict):
#         pressure = metrics.get("central_pressure_hpa") or 1013
#     surge_depth_meters = telemetry.get("storm_surge_meters")
#     if surge_depth_meters is None and isinstance(metrics, dict):
#         surge_depth_meters = metrics.get("storm_surge_meters") or 0.5

#     if wind is None:
#         wind = 0
#     if pressure is None:
#         pressure = 1013
#     if surge_depth_meters is None:
#         surge_depth_meters = 0.5

#     surge_depth_meters = float(surge_depth_meters)
#     if surge_depth_meters < 0.4:
#         surge_depth_meters = max(0.4, ((float(wind) - 40) / 100) * 1.8 + (1013 - float(pressure)) * 0.02)
#     parametric_unlocked = surge_depth_meters >= 1.2

#     region_meta = unified_data.get("region_metadata") or {}
#     center_lat = ((region_meta.get("min_lat") or 0) + (region_meta.get("max_lat") or 0)) / 2 if region_meta else 0
#     center_lon = ((region_meta.get("min_lon") or 0) + (region_meta.get("max_lon") or 0)) / 2 if region_meta else 0

#     risk_zones = [
#         {
#             "id": "red-zone",
#             "label": "Red Zone",
#             "color": "red",
#             "lat": center_lat + 0.025,
#             "lon": center_lon + 0.02,
#             "radius_km": 7.5,
#             "description": "Immediate evacuation and shelter activation zone"
#         },
#         {
#             "id": "yellow-zone",
#             "label": "Yellow Zone",
#             "color": "yellow",
#             "lat": center_lat + 0.065,
#             "lon": center_lon + 0.055,
#             "radius_km": 15,
#             "description": "Standby and staging zone for logistics and equipment"
#         }
#     ]

#     top_analogs = unified_data.get("history", {}).get("historical_analogs", []) if isinstance(unified_data.get("history"), dict) else []
#     if not top_analogs and isinstance(unified_data.get("history"), dict):
#         top_analogs = [unified_data["history"]]

#     prompt = f"""
#     You are the intelligence core of ClimaGuard, an expert disaster management digital twin aligned with NDMA guidelines.

#     Current Telemetry:
#     - Region: {region}
#     - Wind Speed: {wind} km/h
#     - Atmospheric Pressure: {pressure} hPa
#     - Predicted Storm Surge: {surge_depth_meters} meters

#     Contextual Data (Shelters, Demographics, Historical Analogs):
#     {json.dumps(unified_data, indent=2)}

#     Based on this data, produce ONLY valid JSON with these exact keys:
#     {
#       "primary_analog": "Name of the closest historical cyclone or event",
#       "risk_zones": [
#         {"id": "red-zone", "label": "Red Zone", "color": "red", "lat": 17.68, "lon": 83.20, "radius_km": 7.5, "description": "Immediate evacuation zone"},
#         {"id": "yellow-zone", "label": "Yellow Zone", "color": "yellow", "lat": 17.73, "lon": 83.28, "radius_km": 15, "description": "Standby zone"}
#       ],
#       "recommended_tasks": [
#         {"department": "Municipal Disaster Cell", "location": "Ward 17 and nearest coastline", "description": "Pre-position pumps and suspend low-lying movement", "sub_team": "Field Response Team 1", "status_text": "Start ->"}
#       ],
#       "insurance_summary": {
#         "trigger_met": true,
#         "trigger_threshold_m": 1.2,
#         "observed_water_depth_m": 1.42,
#         "estimated_payout_cr": 14.5,
#         "headline": "Parametric insurance payout unlocked",
#         "coverage_focus": ["Coastal wards", "low-lying settlements"]
#       }
#     }
#     """

#     try:
#         if client is not None:
#             response = client.models.generate_content(
#                 model="gemini-2.5-flash",
#                 contents=prompt,
#                 config=types.GenerateContentConfig(
#                     response_mime_type="application/json",
#                     temperature=0.1,
#                 ),
#             )
#             tactical_insights = json.loads(response.text)
#         else:
#             raise RuntimeError("GEMINI_API_KEY is not configured")
#     except Exception as e:
#         print(f"Gemini Parsing Error: {e}")
#         tactical_insights = {
#             "primary_analog": top_analogs[0].get("matched_cyclone") if top_analogs and isinstance(top_analogs[0], dict) else "Historical analog unavailable",
#             "risk_zones": risk_zones,
#             "recommended_tasks": [
#                 {
#                     "department": "Municipal Disaster Cell",
#                     "location": "Coastal wetlands and low-lying settlements",
#                     "description": "Pre-position pumps, activate shelters, and restrict low-lying movement.",
#                     "sub_team": "Field Response Team 1",
#                     "status_text": "Start ->"
#                 }
#             ],
#             "insurance_summary": {
#                 "trigger_met": parametric_unlocked,
#                 "trigger_threshold_m": 1.2,
#                 "observed_water_depth_m": round(surge_depth_meters, 2),
#                 "estimated_payout_cr": 14.50 if parametric_unlocked else 0.0,
#                 "headline": "Parametric insurance payout unlocked" if parametric_unlocked else "Trigger not reached",
#                 "coverage_focus": ["Coastal wards", "critical shelters", "low-lying settlements"]
#             }
#         }

#     if isinstance(tactical_insights.get("risk_zones"), list):
#         for idx, zone in enumerate(tactical_insights["risk_zones"][:2]):
#             if isinstance(zone, dict):
#                 zone.setdefault("id", f"zone-{idx + 1}")
#                 zone.setdefault("label", "Risk Zone")
#                 zone.setdefault("color", "red" if idx == 0 else "yellow")
#                 zone.setdefault("lat", center_lat + (0.02 if idx == 0 else 0.07))
#                 zone.setdefault("lon", center_lon + (0.02 if idx == 0 else 0.06))
#                 zone.setdefault("radius_km", 7.5 if idx == 0 else 15)
#                 zone.setdefault("description", "Alert zone")
#     else:
#         tactical_insights["risk_zones"] = risk_zones

#     if not isinstance(tactical_insights.get("insurance_summary"), dict):
#         tactical_insights["insurance_summary"] = {
#             "trigger_met": parametric_unlocked,
#             "trigger_threshold_m": 1.2,
#             "observed_water_depth_m": round(surge_depth_meters, 2),
#             "estimated_payout_cr": 14.50 if parametric_unlocked else 0.0,
#             "headline": "Parametric insurance payout unlocked" if parametric_unlocked else "Trigger not reached",
#             "coverage_focus": ["Coastal wards", "critical shelters", "low-lying settlements"]
#         }

#     return {
#         "status": "success",
#         "region": region,
#         "telemetry": unified_data,
#         "ml_prediction": {
#             "surge_depth_meters": round(surge_depth_meters, 2),
#             "trigger_parametric_relief": parametric_unlocked,
#             "disbursement_amount_cr": 14.50 if parametric_unlocked else 0.0
#         },
#         "tactical_insights": tactical_insights
#     }
# app = socketio.ASGIApp(sio, other_asgi_app=api_app)@api_app.get("/api/disaster-intelligence/{region}")
# async def get_disaster_intelligence(region: str):
#     # 1. RUN INGESTION SCRIPT
#     try:
#         # Calls your existing function to hit GEE, IMD, WorldPop, and NOAA
#         unified_data = run_ingestion(region)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Data Ingestion Error: {str(e)}")

#     # 2. EXTRACT ML FEATURES
#     wind = unified_data["current_condition"].get("wind_speed_kmh", 0)
#     pressure = unified_data["current_condition"].get("pressure_hpa", 1013)

#     # 3. MOCKED SURGE PREDICTION (Replacing Vertex AI)
#     # Realistic empirical surge estimate formula for the hackathon demo
#     surge_depth_meters = round(max(0.4, ((wind - 40) / 100) * 1.8 + (1013 - pressure) * 0.02), 2)

#     # 4. PARAMETRIC RELIEF TRIGGER (Phase 5)
#     parametric_unlocked = surge_depth_meters >= 1.2

#     # 5. GEMINI 2.5 TACTICAL INSIGHTS (Phase 3)
#     top_analogs = unified_data.get('disaster_history', {}).get('historical_analogs', [])[:3]
    
#     prompt = f"""
#     You are the intelligence core of ClimaGuard, an expert disaster management digital twin aligned with NDMA guidelines. 
    
#     Current Telemetry:
#     - Region: {region}
#     - Wind Speed: {wind} km/h
#     - Atmospheric Pressure: {pressure} hPa
#     - Predicted Storm Surge: {surge_depth_meters} meters
    
#     Contextual Data (Shelters, Demographics, Historical Analogs):
#     {json.dumps(unified_data, indent=2)}
    
#     Based on the predicted surge, wind speed, and historical analogs, analyze the vulnerability of the region. Your job is to recommend urgent tactical tasks that need to be assigned to municipal response teams.
    
#     You MUST output ONLY valid JSON without any markdown formatting, backticks, or extra text. The JSON must exactly match this structure:
    
#     {{
#       "primary_analog": "Name of the most similar past cyclone from the data",
#       "risk_zones": {{
#         "red_zone": ["List of 2-3 specific high-risk wards or coastal areas requiring immediate CAP evacuation"],
#         "yellow_zone": ["List of 2-3 specific moderate-risk adjacent areas for standby alerts"]
#       }},
#       "recommended_tasks": [
#         {{
#           "department": "e.g., PWD Water Supply",
#           "location": "e.g., Ward 17 & Topsia",
#           "description": "e.g., Pre-position 22 High-Capacity De-watering Diesel Pumps",
#           "sub_team": "e.g., Pumps Div Team 3",
#           "status_text": "Start ->"
#         }}
#         // Generate 3 to 4 highly specific, realistic municipal tasks based on the telemetry
#       ]
#     }}
#     """
    
#     try:
#         response = client.models.generate_content(
#             model="gemini-3.5-flash-lite",
#             contents=prompt,
#             config=types.GenerateContentConfig(
#                 response_mime_type="application/json",
#                 temperature=0.1,
#             ),
#         )
#         tactical_insights = json.loads(response.text)
#     except Exception as e:
#         print(f"Gemini Parsing Error: {e}")
#         tactical_insights = {
#             "primary_analog": "Data unavailable",
#             "vulnerable_infrastructure": ["Coastal Embankments", "Power Grid Substations"],
#             "recommended_action": "Initiate immediate CAP evacuation and pre-position high-capacity pumps."
#         }

#     # 6. RETURN FINAL PAYLOAD TO FRONTEND
#     return {
#         "status": "success",
#         "region": region,
#         "telemetry": unified_data,
#         "ml_prediction": {
#             "surge_depth_meters": surge_depth_meters,
#             "trigger_parametric_relief": parametric_unlocked,
#             "disbursement_amount_cr": 14.50 if parametric_unlocked else 0.0
#         },
#         "tactical_insights": tactical_insights
#     }

@api_app.get("/api/disaster-intelligence/{region}")
async def get_disaster_intelligence(region: str):
    """
    Unified disaster-intelligence endpoint.

    Architecture:
        Real ingestion
            ↓
        Data normalization
            ↓
        Deterministic risk screening
            ↓
        Gemini contextual interpretation
            ↓
        Final response

    IMPORTANT:
    Gemini does not create measurements, coordinates, historical events,
    insurance payouts, or hazard observations.
    """

    region_key = region.strip().lower()

    # ---------------------------------------------------------
    # 1. RUN REAL DATA INGESTION
    # ---------------------------------------------------------
    ingestion_error = None

    try:
        unified_data = run_ingestion(region_key)

        if not isinstance(unified_data, dict):
            raise RuntimeError(
                "run_ingestion() returned an invalid response."
            )

    except Exception as error:
        ingestion_error = str(error)

        print(
            f"[DISASTER INTELLIGENCE] "
            f"Ingestion failed for '{region_key}': {error}"
        )

        # IMPORTANT:
        # Do NOT manufacture weather values here.
        #
        # We only return metadata and clearly mark the telemetry
        # as unavailable.
        fallback_region = REGION_DATA.get(region_key)

        if not fallback_region:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown region: {region_key}"
            )

        unified_data = {
            "region_metadata": fallback_region,

            "meteorological_telemetry": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "region_target": region_key,
                "system_name": "Live telemetry unavailable",
                "alert_status": "DATA_UNAVAILABLE",
                "metrics": {
                    "wind_speed_kmh": None,
                    "peak_wind_kmh": None,
                    "pressure_hpa": None,
                    "central_pressure_hpa": None,
                    "storm_surge_meters": None,
                },
                "trajectory": None,
            },

            "demography": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "region_target": region_key,
                "total_population": None,
            },

            "places": {
                "hospitals": [],
                "shelters": [],
                "source_errors": {
                    "ingestion": ingestion_error
                },
            },

            "history": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "region_target": region_key,
                "historical_analogs": [],
            },

            "forecast": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "region_target": region_key,
                "forecast": [],
            },
        }

    # ---------------------------------------------------------
    # 2. NORMALIZE TELEMETRY
    # ---------------------------------------------------------

    telemetry = (
        unified_data.get("meteorological_telemetry")
        or unified_data.get("current_condition")
        or {}
    )

    if not isinstance(telemetry, dict):
        telemetry = {}

    metrics = telemetry.get("metrics")

    if not isinstance(metrics, dict):
        metrics = {}

    def first_value(*values):
        """
        Return the first value that is actually present.

        Unlike `or`, this does not accidentally replace valid
        values such as 0.
        """
        for value in values:
            if value is not None:
                return value
        return None

    def safe_float(value):
        try:
            if value is None:
                return None

            return float(value)

        except (TypeError, ValueError):
            return None

    wind = first_value(
        telemetry.get("wind_speed_kmh"),
        metrics.get("wind_speed_kmh"),
        metrics.get("peak_wind_kmh"),
    )

    pressure = first_value(
        telemetry.get("pressure_hpa"),
        metrics.get("pressure_hpa"),
        metrics.get("central_pressure_hpa"),
    )

    storm_surge = first_value(
        telemetry.get("storm_surge_meters"),
        metrics.get("storm_surge_meters"),
    )

    wind = safe_float(wind)
    pressure = safe_float(pressure)
    storm_surge = safe_float(storm_surge)

    # ---------------------------------------------------------
    # 3. DETERMINE DATA PROVENANCE
    # ---------------------------------------------------------

    telemetry_timestamp = (
        telemetry.get("timestamp")
        or telemetry.get("observed_at")
        or telemetry.get("updated_at")
    )

    telemetry_status = (
        telemetry.get("alert_status")
        or telemetry.get("status")
        or "UNKNOWN"
    )

    system_name = telemetry.get(
        "system_name",
        "Meteorological telemetry"
    )

    if ingestion_error:
        telemetry_data_status = "UNAVAILABLE"

    elif wind is not None or pressure is not None or storm_surge is not None:
        telemetry_data_status = "AVAILABLE"

    else:
        telemetry_data_status = "NO_CURRENT_MEASUREMENTS"

    # ---------------------------------------------------------
    # 4. HISTORICAL ANALOGS
    # ---------------------------------------------------------

    history = unified_data.get("history")

    if not isinstance(history, dict):
        history = unified_data.get("disaster_history", {})

    if not isinstance(history, dict):
        history = {}

    historical_analogs = history.get(
        "historical_analogs",
        []
    )

    if not isinstance(historical_analogs, list):
        historical_analogs = []

    # Never invent a historical event.
    #
    # Only accept an analog that actually came from the ingestion
    # layer.
    valid_analogs = []

    for analog in historical_analogs:
        if not isinstance(analog, dict):
            continue

        name = (
            analog.get("matched_cyclone")
            or analog.get("event_name")
            or analog.get("name")
            or analog.get("title")
        )

        if name:
            valid_analogs.append(analog)

    primary_analog = None

    if valid_analogs:
        primary_analog = (
            valid_analogs[0].get("matched_cyclone")
            or valid_analogs[0].get("event_name")
            or valid_analogs[0].get("name")
            or valid_analogs[0].get("title")
        )

    # ---------------------------------------------------------
    # 5. FORECAST
    # ---------------------------------------------------------

    forecast = unified_data.get("forecast")

    if not isinstance(forecast, dict):
        # Backward compatibility with your previous typo.
        forecast = unified_data.get("forcast", {})

    if not isinstance(forecast, dict):
        forecast = {}

    forecast_items = forecast.get("forecast", [])

    if not isinstance(forecast_items, list):
        forecast_items = []

    # ---------------------------------------------------------
    # 6. REGION METADATA
    # ---------------------------------------------------------

    region_meta = unified_data.get(
        "region_metadata"
    ) or REGION_DATA.get(region_key, {})

    if not isinstance(region_meta, dict):
        region_meta = {}

    min_lat = safe_float(region_meta.get("min_lat"))
    max_lat = safe_float(region_meta.get("max_lat"))
    min_lon = safe_float(region_meta.get("min_lon"))
    max_lon = safe_float(region_meta.get("max_lon"))

    center_lat = None
    center_lon = None

    if (
        min_lat is not None
        and max_lat is not None
    ):
        center_lat = (min_lat + max_lat) / 2

    if (
        min_lon is not None
        and max_lon is not None
    ):
        center_lon = (min_lon + max_lon) / 2

    # ---------------------------------------------------------
    # 7. DETERMINISTIC RISK SCREENING
    # ---------------------------------------------------------
    #
    # This is deliberately NOT an official evacuation model.
    #
    # It is a transparent screening layer until we connect
    # authoritative hazard grids / IMD warnings / GEE exposure
    # layers.
    #
    # IMPORTANT:
    # Missing data does NOT become zero.
    # ---------------------------------------------------------

    risk_factors = []
    risk_score = 0

    if wind is not None:

        if wind >= 118:
            risk_score += 45
            risk_factors.append(
                f"Very high wind observation: {wind:.1f} km/h"
            )

        elif wind >= 88:
            risk_score += 35
            risk_factors.append(
                f"High wind observation: {wind:.1f} km/h"
            )

        elif wind >= 62:
            risk_score += 20
            risk_factors.append(
                f"Strong wind observation: {wind:.1f} km/h"
            )

    if pressure is not None:

        if pressure <= 980:
            risk_score += 30
            risk_factors.append(
                f"Very low atmospheric pressure: {pressure:.1f} hPa"
            )

        elif pressure <= 995:
            risk_score += 20
            risk_factors.append(
                f"Low atmospheric pressure: {pressure:.1f} hPa"
            )

    if storm_surge is not None:

        if storm_surge >= 2.0:
            risk_score += 35
            risk_factors.append(
                f"Storm surge estimate: {storm_surge:.2f} m"
            )

        elif storm_surge >= 1.2:
            risk_score += 25
            risk_factors.append(
                f"Storm surge estimate: {storm_surge:.2f} m"
            )

        elif storm_surge >= 0.5:
            risk_score += 10
            risk_factors.append(
                f"Storm surge estimate: {storm_surge:.2f} m"
            )

    # Cap screening score.
    risk_score = min(risk_score, 100)

    # ---------------------------------------------------------
    # 8. RISK LEVEL
    # ---------------------------------------------------------

    if telemetry_data_status != "AVAILABLE":
        risk_level = "UNKNOWN"

    elif risk_score >= 75:
        risk_level = "RED"

    elif risk_score >= 50:
        risk_level = "ORANGE"

    elif risk_score >= 25:
        risk_level = "YELLOW"

    else:
        risk_level = "GREEN"

    # ---------------------------------------------------------
    # 9. RISK ZONES
    # ---------------------------------------------------------
    #
    # These are screening zones around the region center.
    #
    # They are NOT claimed to be official evacuation boundaries.
    #
    # The frontend should display this distinction.
    # ---------------------------------------------------------

    risk_zones = []

    if center_lat is not None and center_lon is not None:

        if risk_level == "RED":

            risk_zones = [
                {
                    "id": "red-zone",
                    "label": "Red Zone",
                    "color": "red",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 7.5,
                    "description": (
                        "High-risk screening zone based on "
                        "current hazard indicators."
                    ),
                    "basis": risk_factors,
                },
                {
                    "id": "orange-zone",
                    "label": "Orange Zone",
                    "color": "orange",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 15,
                    "description": (
                        "Potential impact screening zone."
                    ),
                    "basis": risk_factors,
                },
            ]

        elif risk_level == "ORANGE":

            risk_zones = [
                {
                    "id": "orange-zone",
                    "label": "Orange Zone",
                    "color": "orange",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 10,
                    "description": (
                        "Elevated-risk screening zone."
                    ),
                    "basis": risk_factors,
                },
                {
                    "id": "yellow-zone",
                    "label": "Yellow Zone",
                    "color": "yellow",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 20,
                    "description": (
                        "Potential impact / preparedness zone."
                    ),
                    "basis": risk_factors,
                },
            ]

        elif risk_level == "YELLOW":

            risk_zones = [
                {
                    "id": "yellow-zone",
                    "label": "Yellow Zone",
                    "color": "yellow",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 15,
                    "description": (
                        "Preparedness screening zone."
                    ),
                    "basis": risk_factors,
                },
                {
                    "id": "green-zone",
                    "label": "Green Zone",
                    "color": "green",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 30,
                    "description": (
                        "Currently lower modeled exposure."
                    ),
                    "basis": risk_factors,
                },
            ]

        elif risk_level == "GREEN":

            risk_zones = [
                {
                    "id": "green-zone",
                    "label": "Green Zone",
                    "color": "green",
                    "lat": center_lat,
                    "lon": center_lon,
                    "radius_km": 20,
                    "description": (
                        "No elevated hazard signal detected "
                        "from currently available telemetry."
                    ),
                    "basis": risk_factors,
                }
            ]

    # ---------------------------------------------------------
    # 10. INSURANCE / PARAMETRIC TRIGGER
    # ---------------------------------------------------------
    #
    # Do NOT invent payout values.
    #
    # If actual storm surge data is unavailable, the trigger
    # cannot be evaluated.
    # ---------------------------------------------------------

    trigger_threshold_m = 1.2

    if storm_surge is None:

        insurance_summary = {
            "status": "UNAVAILABLE",
            "trigger_met": None,
            "trigger_threshold_m": trigger_threshold_m,
            "observed_water_depth_m": None,
            "estimated_payout_cr": None,
            "headline": (
                "Parametric trigger cannot be evaluated "
                "because current water-depth data is unavailable."
            ),
            "coverage_focus": [
                "Coastal wards",
                "Critical infrastructure",
                "Low-lying settlements",
            ],
        }

    else:

        trigger_met = (
            storm_surge >= trigger_threshold_m
        )

        insurance_summary = {
            "status": "EVALUATED",
            "trigger_met": trigger_met,
            "trigger_threshold_m": trigger_threshold_m,
            "observed_water_depth_m": round(
                storm_surge,
                2
            ),
            "estimated_payout_cr": None,
            "headline": (
                "Configured trigger threshold reached."
                if trigger_met
                else "Configured trigger threshold not reached."
            ),
            "coverage_focus": [
                "Coastal wards",
                "Critical infrastructure",
                "Low-lying settlements",
            ],
            "note": (
                "Payout amount is not calculated because "
                "no actual insurance policy configuration "
                "is connected to this endpoint."
            ),
        }

    # ---------------------------------------------------------
    # 11. GEMINI CONTEXT
    # ---------------------------------------------------------
    #
    # Gemini gets verified/derived backend information.
    #
    # It does NOT get permission to create:
    # - weather observations
    # - coordinates
    # - insurance payouts
    # - historical events
    # ---------------------------------------------------------

    ai_context = {
        "region": region_key,

        "current_telemetry": {
            "wind_speed_kmh": wind,
            "pressure_hpa": pressure,
            "storm_surge_meters": storm_surge,
            "timestamp": telemetry_timestamp,
            "status": telemetry_data_status,
            "source_system": system_name,
        },

        "risk_assessment": {
            "level": risk_level,
            "score": risk_score,
            "factors": risk_factors,
        },

        "historical_analogs": valid_analogs[:5],

        "forecast": forecast_items[:10],

        "demography": unified_data.get(
            "demography",
            {}
        ),

        "places": unified_data.get(
            "places",
            {}
        ),
    }

    tactical_insights = {
        "summary": None,
        "recommended_tasks": [],
        "reasoning_context": [],
    }

    # ---------------------------------------------------------
    # 12. GEMINI = EXPLANATION / PREPARATION ASSISTANT
    # ---------------------------------------------------------

    if client is not None:

        prompt = f"""
You are an AI disaster-preparedness assistant.

You must ONLY reason from the supplied backend data.

IMPORTANT RULES:

1. Never invent weather observations.
2. Never invent storm-surge measurements.
3. Never invent historical disasters.
4. Never invent population numbers.
5. Never invent shelters or hospitals.
6. Never invent insurance payout amounts.
7. Never create new coordinates.
8. Never change the backend risk level.
9. If data is missing, explicitly say that it is unavailable.
10. Do not claim that an area is under an official evacuation order.
11. Provide practical preparedness actions based only on available evidence.

The backend has already calculated the risk screening.

BACKEND DATA:

{json.dumps(ai_context, indent=2, default=str)}

Return ONLY JSON in this exact structure:

{{
    "summary": "Short explanation of the current situation based only on the supplied data.",

    "recommended_tasks": [
        {{
            "department": "Relevant response department",
            "location": "Only use a location explicitly present in the supplied data",
            "description": "Practical preparation action justified by the available data",
            "priority": "critical|high|moderate|low"
        }}
    ],

    "reasoning_context": [
        "Specific supplied fact supporting the recommendation"
    ]
}}

If the telemetry status is UNAVAILABLE or NO_CURRENT_MEASUREMENTS,
do not pretend current hazard conditions are known.
"""

        try:

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )

            parsed_ai = json.loads(response.text)

            if isinstance(parsed_ai, dict):

                tactical_insights = {
                    "summary": parsed_ai.get(
                        "summary"
                    ),

                    "recommended_tasks": (
                        parsed_ai.get(
                            "recommended_tasks",
                            []
                        )
                        if isinstance(
                            parsed_ai.get(
                                "recommended_tasks",
                                []
                            ),
                            list
                        )
                        else []
                    ),

                    "reasoning_context": (
                        parsed_ai.get(
                            "reasoning_context",
                            []
                        )
                        if isinstance(
                            parsed_ai.get(
                                "reasoning_context",
                                []
                            ),
                            list
                        )
                        else []
                    ),
                }

        except Exception as error:

            print(
                f"[GEMINI] Disaster intelligence "
                f"analysis failed: {error}"
            )

            tactical_insights = {
                "summary": (
                    "AI analysis is currently unavailable. "
                    "The response contains backend-derived "
                    "risk information."
                ),

                "recommended_tasks": [],

                "reasoning_context": risk_factors,
            }

    # ---------------------------------------------------------
    # 13. FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "status": "success",

        "region": region_key,

        "generated_at": datetime.now(
            timezone.utc
        ).isoformat(),

        "data_quality": {
            "ingestion_status": (
                "FAILED"
                if ingestion_error
                else "SUCCESS"
            ),

            "telemetry_status": telemetry_data_status,

            "ingestion_error": ingestion_error,

            "telemetry_timestamp": telemetry_timestamp,

            "sources": {
                "meteorological": system_name,
                "history": (
                    history.get("source")
                    if isinstance(history, dict)
                    else None
                ),
                "forecast": (
                    forecast.get("source")
                    if isinstance(forecast, dict)
                    else None
                ),
            },
        },

        "current_conditions": {
            "wind_speed_kmh": wind,
            "pressure_hpa": pressure,
            "storm_surge_meters": storm_surge,
            "alert_status": telemetry_status,
        },

        "forecast": {
            "items": forecast_items,
            "source": forecast.get("source"),
            "timestamp": forecast.get("timestamp"),
        },

        "risk_assessment": {
            "level": risk_level,
            "score": risk_score,
            "factors": risk_factors,
            "method": (
                "Backend deterministic screening "
                "from available telemetry"
            ),
            "official_warning": False,
            "note": (
                "This screening result is not an official "
                "evacuation order or government warning."
            ),
        },

        "risk_zones": risk_zones,

        "historical_context": {
            "primary_analog": primary_analog,
            "historical_analogs": valid_analogs[:5],
        },

        "demography": unified_data.get(
            "demography",
            {}
        ),

        "critical_places": unified_data.get(
            "places",
            {}
        ),

        "insurance_summary": insurance_summary,

        "ai_analysis": tactical_insights,

        # VERY IMPORTANT:
        # Keep the actual ingestion context available.
        # This lets your frontend explain why the AI produced
        # its recommendations.
        "supporting_context": {
            "telemetry": telemetry,
            "risk_factors": risk_factors,
            "historical_analogs": valid_analogs[:5],
        },
    }

#------------------NEW CODE---------------#
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class DispatchChatRequest(BaseModel):
    query: str
    region: str = "vizag"
    current_location: str = "Unknown" # Added to receive frontend location

@api_app.post("/api/dispatch-chat")
async def process_dispatch_chat(request: DispatchChatRequest):
    # 1. LOAD THE LIVE REAL-WORLD INFRASTRUCTURE DATA
    places_data = []
    try:
        # Call the function directly for live, updated data instead of reading a file
        unified_data = run_ingestion(request.region)
        places_data = unified_data.get("shelter", [])
    except Exception as e:
        print(f"Warning: Could not fetch live ingested data - {e}")

    # 2. FEED REAL DATA INTO GEMINI
    prompt = f"""
    You are ClimaGuard Verified Dispatch, an AI tactical routing assistant for {request.region}.
    
    The user entered the command: "{request.query}"
    
    REAL-WORLD CRITICAL INFRASTRUCTURE DATA:
    {json.dumps(places_data, indent=2) if places_data else "No live data available."}
    
    INSTRUCTIONS:
    1. Extract the user's current location from their command (e.g., after 'loc -' or 'from -').
    2. Identify what they need (e.g., Shelter, Hospital).
    3. SEARCH the provided 'REAL-WORLD CRITICAL INFRASTRUCTURE DATA' and select the most relevant, ACTUAL place. Do not invent names.
    4. Generate a tactical route from their location to the selected facility.
    
    You MUST output ONLY valid JSON matching this exact structure:
    {{
        "text": "Briefly list 2-3 real nearby facilities found in the data, then state which one you are routing them to.",
        "verifiedRoute": {{
            "origin": "User's extracted location",
            "destination": "EXACT name of the facility from the JSON data",
            "clearanceStatus": "VERIFIED_CLEAR, CAUTION_RESTRICTED, or IMPASSABLE_FLOOD",
            "waterDepth": "e.g., '0.45m max (Coastal stretch)'",
            "recommendedPath": "Clear, tactical driving instructions.",
            "waypoints": ["Point 1", "Point 2", "Point 3"],
            "sensorVerification": "e.g., 'GloFAS Bridge Anemometer'",
            "validityWindow": "e.g., 'Valid for next 45 minutes'"
        }}
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2, 
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate route clearance")

app = socketio.ASGIApp(sio, other_asgi_app=api_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)