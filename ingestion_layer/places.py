# ingestion_layer/places.py
import os
import requests
import json
from dotenv import load_dotenv
from ingestion_layer.constant import REGION_COORDS

load_dotenv()

def fetch_critical_infrastructure(region_key="vizag", radius_meters=5000):
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    coords = REGION_COORDS.get(region_key, REGION_COORDS["vizag"])
    
    fallback_data = {
        "hospitals": [
            {"name": "King George Hospital (Demo)", "address": "Maharanipeta, VSKP", "lat": 17.705, "lon": 83.303}
        ],
        "shelters": [
            {"name": "GVMC Cyclone Shelter Ward 17 (Demo)", "address": "Coastal Road", "lat": 17.710, "lon": 83.300}
        ]
    }

    if not google_api_key:
        return fallback_data

    facilities = {"hospitals": [], "shelters": []}

    # API Headers required for Places API
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": google_api_key,
        "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress"
    }

    try:
        # NEARBY SEARCH: Strict filtering for Hospitals
        hospital_url = "https://places.googleapis.com/v1/places:searchNearby"
        hospital_payload = {
            "includedTypes": ["hospital"],
            "maxResultCount": 5,
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": coords["lat"], "longitude": coords["lon"]},
                    "radius": radius_meters
                }
            }
        }
        
        h_resp = requests.post(hospital_url, json=hospital_payload, headers=headers)
        if h_resp.status_code == 200:
            for p in h_resp.json().get("places", []):
                facilities["hospitals"].append({
                    "name": p.get("displayName", {}).get("text"),
                    "address": p.get("formattedAddress"),
                    "lat": p.get("location", {}).get("latitude"),
                    "lon": p.get("location", {}).get("longitude")
                })

        # TEXT SEARCH: Natural language query for Shelters (since it isn't a strict primaryType)
        shelter_url = "https://places.googleapis.com/v1/places:searchText"
        shelter_payload = {
            "textQuery": f"cyclone emergency shelter community center near {region_key}",
            "locationBias": {
                "circle": {
                    "center": {"latitude": coords["lat"], "longitude": coords["lon"]},
                    "radius": radius_meters
                }
            },
            "pageSize": 5
        }
        
        s_resp = requests.post(shelter_url, json=shelter_payload, headers=headers)
        if s_resp.status_code == 200:
            for p in s_resp.json().get("places", []):
                facilities["shelters"].append({
                    "name": p.get("displayName", {}).get("text"),
                    "address": p.get("formattedAddress"),
                    "lat": p.get("location", {}).get("latitude"),
                    "lon": p.get("location", {}).get("longitude")
                })

        return facilities

    except Exception as e:
        return fallback_data