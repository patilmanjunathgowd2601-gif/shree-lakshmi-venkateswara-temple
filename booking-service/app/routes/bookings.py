from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from ..auth import require_admin
from ..db import get_bookings_collection
from ..models import BookingCreate, BookingOut, BookingStatus, BookingStatusUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate, collection=Depends(get_bookings_collection)):
    doc = payload.model_dump(mode="json")
    doc["status"] = BookingStatus.pending.value
    doc["created_at"] = datetime.now(timezone.utc)

    result = await collection.insert_one(doc)
    saved = await collection.find_one({"_id": result.inserted_id})
    return _serialize(saved)


@router.get("", response_model=list[BookingOut])
async def list_bookings(
    collection=Depends(get_bookings_collection),
    _admin: dict = Depends(require_admin),
):
    cursor = collection.find().sort("created_at", -1)
    return [_serialize(doc) async for doc in cursor]


@router.patch("/{booking_id}", response_model=BookingOut)
async def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    collection=Depends(get_bookings_collection),
    _admin: dict = Depends(require_admin),
):
    try:
        object_id = ObjectId(booking_id)
    except InvalidId as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking id") from exc

    result = await collection.find_one_and_update(
        {"_id": object_id},
        {"$set": {"status": payload.status.value}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return _serialize(result)
