import ee
from datetime import datetime
from ingestion_layer.constant import get_region_coords

def fetch_population(region_key="vizag"):
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
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "total_population": int(raw_population),
        }

    except Exception as e:
        print(f"⚠️ [POPULATION] Error: {e}.")
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "region_target": region_key,
            "total_population": None,
            "source_error": str(e),
        }