import ee
from datetime import datetime
from ingestion_layer.constant import REGION_COORDS

def fetch_population(region_key="vizag"):
    coords = REGION_COORDS.get(region_key, REGION_COORDS["vizag"])
    fallback_demographics = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "region_target": region_key,
        "total_population": 145230,
    }

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
        if raw_population is not None and raw_population > 0:
            calculated_population = int(raw_population)
        else:
            calculated_population = fallback_demographics["total_population_at_risk"]
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "total_population": calculated_population,
        }

    except Exception as e:
        print(f"⚠️ [POPULATION] Error: {e}.")
        return fallback_demographics