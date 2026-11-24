from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_demo_datasets

# Import routers
from app.routers import (
    overview,
    datasets,
    explorer,
    cleaning,
    excel,
    sql,
    python_analytics,
    eda,
    statistics,
    visualizations,
    etl,
    quality,
    powerbi,
    predictive,
    github_analytics,
    software_quality,
    business_insights,
    reports,
    settings as settings_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed realistic demo data
    db = SessionLocal()
    try:
        seed_demo_datasets(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DevPulse - Complete Engineering Productivity and Software Quality Intelligence Platform",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoints
@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": "2026-11-24T12:00:00Z"}

# Register API v1 Routers
api_v1 = settings.API_V1_STR
app.include_router(overview.router, prefix=api_v1)
app.include_router(datasets.router, prefix=api_v1)
app.include_router(explorer.router, prefix=api_v1)
app.include_router(cleaning.router, prefix=api_v1)
app.include_router(excel.router, prefix=api_v1)
app.include_router(sql.router, prefix=api_v1)
app.include_router(python_analytics.router, prefix=api_v1)
app.include_router(eda.router, prefix=api_v1)
app.include_router(statistics.router, prefix=api_v1)
app.include_router(visualizations.router, prefix=api_v1)
app.include_router(etl.router, prefix=api_v1)
app.include_router(quality.router, prefix=api_v1)
app.include_router(powerbi.router, prefix=api_v1)
app.include_router(predictive.router, prefix=api_v1)
app.include_router(github_analytics.router, prefix=api_v1)
app.include_router(software_quality.router, prefix=api_v1)
app.include_router(business_insights.router, prefix=api_v1)
app.include_router(reports.router, prefix=api_v1)
app.include_router(settings_router.router, prefix=api_v1)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
