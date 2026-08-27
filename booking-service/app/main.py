from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from .config import settings
from .routes import bookings

app = FastAPI(
    title="Sri Lakshmi Venkateswara Temple - Booking Service",
    description="Handles priest / home-seva booking requests. A separate "
    "microservice from the main Node backend, sharing its admin JWT.",
    version="1.0.0",
)

allowed_origins = [origin.strip() for origin in settings.cors_origin.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exposes /metrics in Prometheus text format, plus request count/latency
# instrumentation on every route - this is what the ServiceMonitor in
# k8s/booking-service/ tells Prometheus to scrape.
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.include_router(bookings.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "booking-service"}
