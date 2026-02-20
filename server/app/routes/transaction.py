from fastapi import APIRouter, Depends, HTTPException
from app.db.database import db
from app.schemas.transaction_schema import TransactionCreate
from app.routes.auth import oauth2_scheme
from jose import jwt
from app.core.config import SECRET_KEY, ALGORITHM
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["Transactions"])

transactions_collection = db["transactions"]

# 🔐 Get Current User Email
def get_current_user_email(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")

# ➕ Add Transaction
@router.post("/")
def add_transaction(
    transaction: TransactionCreate,
    user_email: str = Depends(get_current_user_email)
):
    new_transaction = transaction.dict()
    new_transaction["user_email"] = user_email
    new_transaction["created_at"] = datetime.utcnow()

    result = transactions_collection.insert_one(new_transaction)

    return {"message": "Transaction added successfully"}
    # get dashboard
@router.get("/")
def get_transactions(
    month: str,
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    transactions = list(
        transactions_collection.find(
            {"user_email": email, "month": month}
        )
    )

    # ✅ CORRECT INDENTATION STARTS HERE
    for t in transactions:
        t["_id"] = str(t["_id"])

        if "created_at" in t:
            t["created_at"] = t["created_at"].isoformat()

    return transactions


# 📄 Get All Transactions
@router.get("/")
def get_transactions(user_email: str = Depends(get_current_user_email)):
    transactions = list(
        transactions_collection.find({"user_email": user_email})
    )

    for t in transactions:
        t["id"] = str(t["_id"])
        del t["_id"]

    return transactions

# 📊 Summary (Dashboard Use)
@router.get("/summary")
def get_summary(user_email: str = Depends(get_current_user_email)):
    transactions = list(
        transactions_collection.find({"user_email": user_email})
    )

    income = sum(t["amount"] for t in transactions if t["type"] == "Income")
    expense = sum(t["amount"] for t in transactions if t["type"] == "Expense")
    investment = sum(t["amount"] for t in transactions if t["type"] == "Investment")

    return {
        "income": income,
        "expense": expense,
        "investment": investment,
        "balance": income - expense - investment
    }

# ❌ Delete
@router.delete("/{id}")
def delete_transaction(id: str, user_email: str = Depends(get_current_user_email)):
    transactions_collection.delete_one({
        "_id": ObjectId(id),
        "user_email": user_email
    })
    return {"message": "Deleted successfully"}
