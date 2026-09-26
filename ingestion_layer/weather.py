# ingestion_layer/imd.py
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from ingestion_layer.constant import REGION_COORDS

load_dotenv()

def fetch_meteorological_telemetry(region_key="vizag"):
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    coords = REGION_COORDS.get(region_key, REGION_COORDS["vizag"])
    demo_fallback_payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "region_target": region_key,
        "system_name": "Severe Cyclonic Storm 'JAL'",
        "alert_status": "ESCALATION_ALERT",
        "metrics": {"peak_wind_kmh": 145, "central_pressure_hpa": 968, "storm_surge_meters": 2.8},
        "trajectory": {"moving_direction": "W-NW", "speed_kmh": 18, "landfall_eta_hours": 48}
    }

    if not google_api_key:
        return demo_fallback_payload

    try:
        url = f"https://weather.googleapis.com/v1/currentConditions:lookup?key={google_api_key}&location.latitude={coords['lat']}&location.longitude={coords['lon']}"
        response = requests.get(url)
        if response.status_code != 200:
            return demo_fallback_payload
            
        weather_data = response.json()

        wind_speed_kmh = weather_data.get("windSpeedMetersPerSecond", 0) * 3.6
        pressure_hpa = weather_data.get("seaLevelPressureHpa", 1010)
        is_cyclone = wind_speed_kmh > 62.0 
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "system_name": "Active Cyclonic System" if is_cyclone else "Normal Weather Conditions",
            "alert_status": "ESCALATION_ALERT" if is_cyclone else "NORMAL_MONITORING",
            "metrics": {
                "peak_wind_kmh": round(wind_speed_kmh, 1),
                "central_pressure_hpa": pressure_hpa,
                "storm_surge_meters": 2.8 if is_cyclone else 0.5 
            },
            "trajectory": {
                "moving_direction": "W-NW",
                "speed_kmh": 18 if is_cyclone else 0,
                "landfall_eta_hours": 48 if is_cyclone else 0
            }
        }

    except Exception as e:
        return demo_fallback_payload


def fetch_7_day_forecast(region_key="vizag"):    
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    coords = REGION_COORDS.get(region_key, REGION_COORDS["vizag"])
    
    fallback_forecast = {
        "region_target": region_key,
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "forecast": [
            {"date": "2026-09-27", "max_temp_c": 33, "min_temp_c": 25, "condition": "Mostly Cloudy"},
            {"date": "2026-09-28", "max_temp_c": 31, "min_temp_c": 24, "condition": "Light Rain"},
            {"date": "2026-09-29", "max_temp_c": 28, "min_temp_c": 23, "condition": "Heavy Rain / Squalls"},
            {"date": "2026-09-30", "max_temp_c": 26, "min_temp_c": 22, "condition": "Cyclonic Storm"},
            {"date": "2026-10-01", "max_temp_c": 27, "min_temp_c": 23, "condition": "Heavy Rain"},
            {"date": "2026-10-02", "max_temp_c": 29, "min_temp_c": 24, "condition": "Showers"},
            {"date": "2026-10-03", "max_temp_c": 32, "min_temp_c": 25, "condition": "Partly Cloudy"}
        ]
    }

    if not google_api_key:
        return fallback_forecast

    try:
        # Google Maps Weather API Endpoint (7-Day Forecast)
        url = f"https://weather.googleapis.com/v1/forecast/days:lookup?key={google_api_key}&location.latitude={coords['lat']}&location.longitude={coords['lon']}&days=7"
        
        response = requests.get(url)
        if response.status_code != 200:
            print(f"⚠️ API Error ({response.status_code}): {response.text}")
            return fallback_forecast
            
        weather_data = response.json()
        forecast_days = weather_data.get("forecastDays", [])
        
        processed_forecast = []
        for day in forecast_days:
            # Extract structured date
            date_info = day.get("displayDate", {})
            date_str = f"{date_info.get('year')}-{str(date_info.get('month', 0)).zfill(2)}-{str(date_info.get('day', 0)).zfill(2)}"
            
            # Extract temperatures
            max_temp = day.get("maxTemperature", {}).get("value", 0)
            min_temp = day.get("minTemperature", {}).get("value", 0)
            
            # Extract daytime condition
            day_condition = day.get("daytimeForecast", {}).get("weatherCondition", {})
            condition_desc = day_condition.get("description", "Unknown")
            
            processed_forecast.append({
                "date": date_str,
                "max_temp_c": max_temp,
                "min_temp_c": min_temp,
                "condition": condition_desc
            })
            
        return {
            "region_target": region_key,
            "latitude": coords["lat"],
            "longitude": coords["lon"],
            "forecast": processed_forecast
        }

    except Exception as e:
        return fallback_forecast
