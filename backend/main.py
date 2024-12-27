from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Starting up Intraday History Data Analyzer API...")
    await init_db()
    print("Database initialized successfully")
    
    yield
    
    # Shutdown
    print("Shutting down Intraday History Data Analyzer API...")


def create_application() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="Intraday History Data Analyzer API",
        description="API for analyzing intraday market data with DuckDB and Parquet",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/")
    async def root():
        return {
            "message": "Intraday History Data Analyzer API",
            "version": "1.0.0",
            "docs": "/docs"
        }

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "intraday-analyzer-api"}

    return app


app = create_application()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 