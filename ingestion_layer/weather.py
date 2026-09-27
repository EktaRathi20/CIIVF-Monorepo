# ingestion_layer/imd.py
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from ingestion_layer.constant import get_region_coords

load_dotenv()

def _description_text(description):
    if isinstance(description, dict):
        return description.get("text") or "Unknown"
    return description if isinstance(description, str) and description else "Unknown"


def fetch_meteorological_telemetry(region_key="vizag"):
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    coords = get_region_coords(region_key)
    if not google_api_key:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is not configured.")

    try:
        url = f"https://weather.googleapis.com/v1/currentConditions:lookup?key={google_api_key}&location.latitude={coords['lat']}&location.longitude={coords['lon']}"
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            try:
                provider_message = response.json().get("error", {}).get("message")
            except (ValueError, AttributeError):
                provider_message = None
            raise RuntimeError(
                f"Google Weather API returned HTTP {response.status_code}: "
                f"{provider_message or response.reason}"
            )

        weather_data = response.json()
        temperature = weather_data.get("temperature", {})
        condition = weather_data.get("weatherCondition", {}).get("description", {})
        wind = weather_data.get("wind", {}).get("speed", {})
        wind_speed = wind.get("value")
        wind_unit = wind.get("unit", "KILOMETERS_PER_HOUR")
        if wind_speed is not None and wind_unit == "METERS_PER_SECOND":
            wind_speed *= 3.6

        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "temperature_c": temperature.get("degrees"),
            "condition": condition.get("text") if isinstance(condition, dict) else condition,
            "wind_speed_kmh": round(wind_speed, 1) if wind_speed is not None else None,
            "wind_direction": weather_data.get("wind", {}).get("direction", {}).get("cardinal"),
            "pressure_hpa": weather_data.get("airPressure", {}).get("meanSeaLevelMillibars"),
            "relative_humidity_percent": weather_data.get("relativeHumidity"),
        }

    except requests.RequestException as error:
        raise RuntimeError(f"Google Weather API request failed: {error}") from error


def fetch_7_day_forecast(region_key="vizag"):    
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not google_api_key:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is not configured.")

    coords = get_region_coords(region_key)

    try:
        # Google Maps Weather API Endpoint (7-Day Forecast)
        url = f"https://weather.googleapis.com/v1/forecast/days:lookup?key={google_api_key}&location.latitude={coords['lat']}&location.longitude={coords['lon']}&days=7"
        
        response = requests.get(url, timeout=20)
        if response.status_code != 200:
            try:
                provider_message = response.json().get("error", {}).get("message")
            except (ValueError, AttributeError):
                provider_message = None
            raise RuntimeError(
                f"Google Weather API returned HTTP {response.status_code}: "
                f"{provider_message or response.reason}"
            )
            
        weather_data = response.json()
        forecast_days = weather_data.get("forecastDays", [])
        
        processed_forecast = []
        for day in forecast_days:
            # Extract structured date
            date_info = day.get("displayDate", {})
            date_str = f"{date_info.get('year')}-{str(date_info.get('month', 0)).zfill(2)}-{str(date_info.get('day', 0)).zfill(2)}"
            
            # Extract temperatures
            max_temp = day.get("maxTemperature", {}).get("degrees")
            min_temp = day.get("minTemperature", {}).get("degrees")
            
            # Extract daytime condition
            day_condition = day.get("daytimeForecast", {}).get("weatherCondition", {})
            condition_desc = _description_text(day_condition.get("description"))
            
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

    except requests.RequestException as error:
        raise RuntimeError(f"Google Weather API request failed: {error}") from error
