# ingestion_layer/places.py
import os
import requests
import json
import math
from dotenv import load_dotenv
from ingestion_layer.constant import get_region_coords, REGION_DATA

load_dotenv()

def _distance_meters(lat_a, lon_a, lat_b, lon_b):
    earth_radius_meters = 6371000
    lat_delta = math.radians(lat_b - lat_a)
    lon_delta = math.radians(lon_b - lon_a)
    value = (
        math.sin(lat_delta / 2) ** 2
        + math.cos(math.radians(lat_a))
        * math.cos(math.radians(lat_b))
        * math.sin(lon_delta / 2) ** 2
    )
    return 2 * earth_radius_meters * math.asin(math.sqrt(value))


def fetch_critical_infrastructure(region_key="vizag", radius_meters=5000):
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    coords = get_region_coords(region_key)
    if not google_api_key:
        return {
            "hospitals": [],
            "shelters": [],
            "source_errors": {
                "hospitals": "GOOGLE_MAPS_API_KEY is not configured.",
                "shelters": "GOOGLE_MAPS_API_KEY is not configured.",
            },
        }

    facilities = {"hospitals": [], "shelters": [], "source_errors": {}}

    # API Headers required for Places API
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": google_api_key,
        "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress"
    }

    def add_results(kind, url, payload):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if not response.ok:
                try:
                    provider_message = response.json().get("error", {}).get("message")
                except (ValueError, AttributeError):
                    provider_message = None
                facilities["source_errors"][kind] = (
                    f"Google Places returned HTTP {response.status_code}: "
                    f"{provider_message or response.reason}"
                )
                return

            for place in response.json().get("places", []):
                location = place.get("location", {})
                latitude = location.get("latitude")
                longitude = location.get("longitude")
                if latitude is None or longitude is None:
                    continue
                if _distance_meters(coords["lat"], coords["lon"], latitude, longitude) > radius_meters:
                    continue
                facilities[kind].append({
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "lat": latitude,
                    "lon": longitude,
                })
        except (requests.RequestException, ValueError) as error:
            facilities["source_errors"][kind] = f"Google Places request failed: {error}"

    hospital_payload = {
        "includedTypes": ["hospital"],
        "maxResultCount": 5,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": coords["lat"], "longitude": coords["lon"]},
                "radius": radius_meters,
            }
        },
    }
    add_results("hospitals", "https://places.googleapis.com/v1/places:searchNearby", hospital_payload)

    shelter_payload = {
        "textQuery": f"cyclone emergency shelter community center near {REGION_DATA[region_key]['name']}",
        "locationBias": {
            "circle": {
                "center": {"latitude": coords["lat"], "longitude": coords["lon"]},
                "radius": radius_meters,
            },
        },
        "pageSize": 5,
    }
    add_results("shelters", "https://places.googleapis.com/v1/places:searchText", shelter_payload)

    return facilities