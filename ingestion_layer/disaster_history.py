import json
import os
from datetime import datetime
import ee
from google import genai
from google.genai import types
from ingestion_layer.constant import REGION_COORDS

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def resolve_historical_cyclone_dates(region_key="vizag"):
    prompt = f"""
    Identify a comprehensive list of all major destructive historical cyclones to make landfall near {region_key}, India over the last 30 years.
    Return strictly a JSON array of objects with this exact schema:
    [
      {{
        "cyclone_name": "String (e.g. HUDHUD (2014))",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "historical_surge_meters": Float
      }}
    ]
    """
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"[HISTORY] Gemini Agent Fallback: {e}")
        return [
            {
                "cyclone_name": "HUDHUD (2014)",
                "start_date": "2014-10-11",
                "end_date": "2014-10-13",
                "historical_surge_meters": 2.4,
            },
            {
                "cyclone_name": "GULAB (2021)",
                "start_date": "2021-09-25",
                "end_date": "2021-09-27",
                "historical_surge_meters": 0.8,
            },
            {
                "cyclone_name": "PHAILIN (2013)",
                "start_date": "2013-10-11",
                "end_date": "2013-10-13",
                "historical_surge_meters": 3.5,
            }
        ]

def fetch_historical_disasters(region_key="vizag"):
    gee_project = os.getenv("GEE_PROJECT_ID")
    event_list = resolve_historical_cyclone_dates(region_key)
    coords = REGION_COORDS.get(region_key, REGION_COORDS["vizag"])
    final_results = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "region_target": region_key,
        "total_historical_events_analyzed": len(event_list),
        "historical_analogs": []
    }

    try:
        center_point = ee.Geometry.Point([coords["lon"], coords["lat"]])
        aoi = center_point.buffer(10000).bounds()

        for event in event_list:
            event_data = {
                "matched_cyclone": event["cyclone_name"],
                "historical_peak_wind_kmh": 165, 
                "historical_surge_meters": event.get("historical_surge_meters", 2.0),
                "reference_period": {
                    "start_date": event["start_date"],
                    "end_date": event["end_date"],
                },
            }

            try:
                era5 = (
                    ee.ImageCollection("ECMWF/ERA5/DAILY")
                    .filterDate(event["start_date"], event["end_date"])
                    .select(["u_component_of_wind_10m", "v_component_of_wind_10m"])
                    .first()
                )

                if era5:
                    wind_speed = era5.expression(
                        "sqrt(u**2 + v**2)",
                        {
                            "u": era5.select("u_component_of_wind_10m"),
                            "v": era5.select("v_component_of_wind_10m")
                        }
                    ).rename("wind_speed")
                    
                    era5_stats = wind_speed.reduceRegion(
                        reducer=ee.Reducer.max(), geometry=aoi, scale=10000
                    ).getInfo()
                    
                    gust_ms = era5_stats.get("wind_speed")
                    
                    if gust_ms is not None:
                        event_data["historical_peak_wind_kmh"] = round(gust_ms * 3.6)
            
            except Exception as inner_e:
                print(f"Warning extracting ERA5 for {event['cyclone_name']}: {inner_e}")
            
            final_results["historical_analogs"].append(event_data)

        return final_results

    except Exception as e:
        print(f"[HISTORY] General ERA5 Extraction Warning: {e}. Utilizing baseline.")
        final_results["historical_analogs"] = [
            {
                "matched_cyclone": "HUDHUD (2014)",
                "historical_peak_wind_kmh": 185,
                "historical_surge_meters": 2.4,
                "reference_period": {"start_date": "2014-10-11", "end_date": "2014-10-13"}
            }
        ]
        return final_results