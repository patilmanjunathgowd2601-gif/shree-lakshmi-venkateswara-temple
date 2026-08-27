# --- Booking service Dockerfile: Python + FastAPI ---
FROM python:3.12-slim AS base
WORKDIR /app

# Fixed UID/GID (1000) so k8s/booking-service/deployment.yaml's
# securityContext.runAsUser can pin an exact, known-non-root user.
RUN groupadd --gid 1000 appuser && useradd --uid 1000 --gid 1000 --create-home appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
