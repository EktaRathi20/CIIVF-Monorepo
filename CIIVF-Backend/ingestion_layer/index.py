import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from ingestion_layer.gee import init_gee, fetch_sar_imagery, REGION_DATA
from ingestion_layer.weather import fetch_meteorological_telemetry
from ingestion_layer.weather import fetch_7_day_forecast
from ingestion_layer.population import fetch_population
from ingestion_layer.disaster_history import fetch_historical_disasters
from ingestion_layer.places import fetch_critical_infrastructure

INGESTED_DIR = Path(__file__).resolve().parent.parent / "data" / "ingested"
RUN_INGESTION_CACHE_TTL = timedelta(hours=6)


def _load_recent_ingestion(region):
    region_metadata = REGION_DATA.get(region)
    if region_metadata is None:
        return None

    cache_path = INGESTED_DIR / f"unified_payload_{region}.json"
    image_path = INGESTED_DIR / f"scan_{region}.png"
    try:
        with cache_path.open(encoding="utf-8") as cache_file:
            cached_payload = json.load(cache_file)
        if not isinstance(cached_payload, dict):
            return None
        if cached_payload.get("region_metadata") != region_metadata or not image_path.is_file():
            return None

        modified_at = datetime.fromtimestamp(cache_path.stat().st_mtime, timezone.utc)
        age = datetime.now(timezone.utc) - modified_at
        if timedelta(0) <= age <= RUN_INGESTION_CACHE_TTL:
            return cached_payload
    except (OSError, ValueError, TypeError):
        pass

    return None


def run_ingestion(region="vizag"):
    cached_payload = _load_recent_ingestion(region)
    if cached_payload is not None:
        return cached_payload

    # GEE
    init_gee()    
    image_bytes, region_meta = fetch_sar_imagery(region)
    
    # IMD
    weather_data = fetch_meteorological_telemetry(region)

    #7 days
    forcast = fetch_7_day_forecast(region)

    # POPULATION
    population = fetch_population(region)

    #PLACES
    places = fetch_critical_infrastructure(region)

    # Disaster History
    disaster_history_data = fetch_historical_disasters(region)

    # Output Directory
    output_dir = INGESTED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save Image
    image_filepath = output_dir / f"scan_{region}.png"
    image_filepath.write_bytes(image_bytes)
    
    # Telemetry JSON
    telemetry_filepath = output_dir / f"telemetry_{region}.json"
    with open(telemetry_filepath, "w") as f:
        json.dump(weather_data, f, indent=2)
    
    # Population JSON
    pop_history_filepath = output_dir / f"population_{region}.json"
    with open(pop_history_filepath, "w") as f:
        json.dump(population, f, indent=2)

    # Disaster JSON
    with open(output_dir / f"history_{region}.json", "w") as f:
        json.dump(disaster_history_data, f, indent=2)

    compiled_payload = {
        "region_metadata": region_meta,
        "satellite_frame_path": str(Path("data/ingested") / image_filepath.name),
        "meteorological_telemetry": weather_data,
        "forcast":forcast,
        "demography": population,
        "places":places,
        "history": disaster_history_data
    }

    compiled_filepath = output_dir / f"unified_payload_{region}.json"
    with open(compiled_filepath, "w") as f:
        json.dump(compiled_payload, f, indent=2)

    return compiled_payload

if __name__ == "__main__":
    result = run_ingestion("odisha")
    print(result)