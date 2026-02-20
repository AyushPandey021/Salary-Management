from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class TransactionCreate(BaseModel):
    type: Literal["Income", "Expense", "Investment"]
    title: str
    amount: float
    tag: str
    payment_method: Literal["Cash", "UPI", "Bank", "Card"]
    description: str | None = None
    month: str

class TransactionResponse(BaseModel):
    id: str
    type: str
    title: str
    amount: float
    tag: str
    payment_method: str
    description: str | None
    month: str
    created_at: datetime
