from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    full_name: Optional[str] = None
    role: str = Field(default="user")
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    role: str = "user"


class UserUpdate(BaseModel):
    email: Optional[str] = Field(default=None, min_length=5, max_length=255)
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class UserPublic(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
