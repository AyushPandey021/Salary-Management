from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class TransactionCreate(BaseModel):
    type: Literal["Income", "Expense", "Investment"]
    title: str
    amount: float

    # optional now
    tag: Optional[str] = None
    payment_method: Optional[Literal["Cash", "UPI", "Bank", "Card"]] = "Cash"
    description: Optional[str] = None

    month: str


class TransactionResponse(BaseModel):
    id: str
    type: str
    title: str
    amount: float
    tag: Optional[str]
    payment_method: str
    description: Optional[str]
    month: str
    created_at: datetime
