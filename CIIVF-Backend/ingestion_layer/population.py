import ee
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from ingestion_layer.constant import get_region_coords

POPULATION_CACHE_TTL = timedelta(hours=24)
INGESTED_DIR = Path(__file__).resolve().parent.parent / "data" / "ingested"


def _load_recent_population(region_key):
    cache_path = INGESTED_DIR / f"population_{region_key}.json"
    try:
        with cache_path.open(encoding="utf-8") as cache_file:
            cached_data = json.load(cache_file)

        if not isinstance(cached_data, dict) or cached_data.get("region_target") != region_key:
            return None
        if cached_data.get("source_error") or cached_data.get("total_population", 0) <= 0:
            return None

        timestamp_value = cached_data.get("timestamp")
        if not isinstance(timestamp_value, str):
            return None
        timestamp = datetime.fromisoformat(timestamp_value.replace("Z", "+00:00"))
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - timestamp
        if timedelta(0) <= age <= POPULATION_CACHE_TTL:
            return cached_data
    except (OSError, ValueError, TypeError, KeyError):
        pass

    return None


def _save_population(region_key, population_data):
    if population_data.get("source_error") or population_data.get("total_population") is None:
        return

    INGESTED_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = INGESTED_DIR / f"population_{region_key}.json"
    try:
        with cache_path.open("w", encoding="utf-8") as cache_file:
            json.dump(population_data, cache_file, indent=2)
    except OSError as error:
        print(f"[POPULATION] Unable to save cache: {error}")


def fetch_population(region_key="vizag"):
    cached_data = _load_recent_population(region_key)
    if cached_data is not None:
        return cached_data

    coords = get_region_coords(region_key)

    try:
        center_point = ee.Geometry.Point([coords["lon"], coords["lat"]])
        aoi = center_point.buffer(10000).bounds()

        worldpop = (
            ee.ImageCollection("WorldPop/GP/100m/pop")
            .filterDate("2020-01-01", "2021-01-01")
            .filterBounds(aoi)
            .select("population")
            .mosaic()
        )

        pop_reduction = worldpop.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=aoi,
            scale=100,
            maxPixels=1e9,
        ).getInfo()

        raw_population = pop_reduction.get("population")
        if raw_population is None or raw_population <= 0:
            return {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "region_target": region_key,
                "total_population": None,
                "source_error": "WorldPop returned no population pixels for this area.",
            }
        
        population_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "total_population": int(raw_population),
        }
        _save_population(region_key, population_data)
        return population_data

    except Exception as e:
        print(f"⚠️ [POPULATION] Error: {e}.")
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "total_population": None,
            "source_error": str(e),
        }