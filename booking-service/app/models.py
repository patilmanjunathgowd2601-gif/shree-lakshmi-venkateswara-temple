from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SevaType(str, Enum):
    griha_pravesh = "griha_pravesh"
    satyanarayana_pooja = "satyanarayana_pooja"
    naming_ceremony = "naming_ceremony"
    housewarming_homam = "housewarming_homam"
    other = "other"


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class BookingCreate(BaseModel):
    devotee_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=5, max_length=20)
    email: Optional[EmailStr] = None
    seva_type: SevaType
    preferred_date: date
    address: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=1000)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    id: str
    devotee_name: str
    phone: str
    email: Optional[EmailStr] = None
    seva_type: SevaType
    preferred_date: date
    address: str
    notes: Optional[str] = None
    status: BookingStatus
    created_at: datetime
