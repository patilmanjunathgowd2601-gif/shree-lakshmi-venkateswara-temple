import jwt


def make_admin_token():
    return jwt.encode({"id": "1", "email": "admin@example.com"}, "test-secret", algorithm="HS256")


async def test_health(async_client):
    res = await async_client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


async def test_create_booking(async_client):
    payload = {
        "devotee_name": "Test Devotee",
        "phone": "9999999999",
        "email": "devotee@example.com",
        "seva_type": "satyanarayana_pooja",
        "preferred_date": "2026-09-01",
        "address": "123 Main St",
        "notes": "Please arrive by 9am",
    }
    res = await async_client.post("/bookings", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "pending"
    assert body["devotee_name"] == "Test Devotee"
    assert "id" in body


async def test_list_bookings_requires_admin(async_client):
    res = await async_client.get("/bookings")
    assert res.status_code == 401


async def test_list_bookings_with_admin_token(async_client):
    token = make_admin_token()
    res = await async_client.get("/bookings", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_update_status_requires_admin(async_client):
    res = await async_client.patch("/bookings/000000000000000000000000", json={"status": "confirmed"})
    assert res.status_code == 401


async def test_full_booking_lifecycle(async_client):
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    create_res = await async_client.post(
        "/bookings",
        json={
            "devotee_name": "Lifecycle Devotee",
            "phone": "8888888888",
            "seva_type": "griha_pravesh",
            "preferred_date": "2026-10-01",
            "address": "456 Temple Rd",
        },
    )
    booking_id = create_res.json()["id"]

    update_res = await async_client.patch(
        f"/bookings/{booking_id}", json={"status": "confirmed"}, headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "confirmed"

    list_res = await async_client.get("/bookings", headers=headers)
    ids = [b["id"] for b in list_res.json()]
    assert booking_id in ids


async def test_metrics_endpoint(async_client):
    res = await async_client.get("/metrics")
    assert res.status_code == 200
    assert b"http_requests" in res.content or b"http_request" in res.content
