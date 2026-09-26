from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import ee
from ingestion_layer.population import fetch_population
from ingestion_layer.places import fetch_critical_infrastructure
from ingestion_layer.weather import fetch_7_day_forecast
from ingestion_layer.disaster_history import fetch_historical_disasters
from ingestion_layer.gee import init_gee
from ingestion_layer.constant import REGION_DATA

app = FastAPI(
    title="CIIVF Digital Twin API",
    description="Backend API powering the Municipal Resilience & Disaster Digital Twin",
    version="1.0.0"
)

# CORS
app.add_middleware(
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
@app.on_event("startup")
def startup_event():
    try:
        init_gee()
        ee.Initialize()
        print("Google Earth Engine initialized for API server.")
    except Exception as e:
        print(f"Earth Engine Initialization Warning: {e}")

# 3. Health check route
@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "CIIVF Engine"}

# 4. Population API Route
@app.get("/api/population")
def get_population(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_population(region_key=region)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/shelter")
def get_shelter(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_critical_infrastructure(region_key=region)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forcast")
def get_forcast(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_7_day_forecast(region_key=region)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history(region: str = Query("vizag", description="Region key (vizag, odisha, chennai, etc.)")):
    try:
        data = fetch_historical_disasters(region_key=region)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/region")
def get_region():
    try:
        return REGION_DATA
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)