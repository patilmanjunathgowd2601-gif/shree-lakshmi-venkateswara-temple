import os

# Must be set before the app (and its config module) is imported anywhere.
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/temple_bookings_test")
os.environ.setdefault("CORS_ORIGIN", "*")

import pytest
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app.db import get_bookings_collection
from app.main import app


def _mock_collection():
    client = AsyncMongoMockClient()
    return client["temple_bookings_test"]["bookings"]


@pytest.fixture
def mock_collection():
    return _mock_collection()


@pytest.fixture
def client(mock_collection):
    app.dependency_overrides[get_bookings_collection] = lambda: mock_collection
    yield app
    app.dependency_overrides.clear()


@pytest.fixture
async def async_client(client):
    transport = ASGITransport(app=client)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
