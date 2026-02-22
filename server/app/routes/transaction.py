from fastapi import APIRouter, Depends, HTTPException
from app.db.database import db
from app.schemas.transaction_schema import TransactionCreate
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
from app.core.config import SECRET_KEY, ALGORITHM
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["Transactions"])

transactions_collection = db["transactions"]


# -----------------------------
# 🔐 GET CURRENT USER (SAFE)
# -----------------------------
def get_current_user_email(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return email

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")


# -----------------------------
# ➕ ADD TRANSACTION
# -----------------------------
@router.post("/")
def add_transaction(
    transaction: TransactionCreate,
    user_email: str = Depends(get_current_user_email)
):
    new_transaction = transaction.dict()
    new_transaction["user_email"] = user_email
    new_transaction["created_at"] = datetime.utcnow()

    transactions_collection.insert_one(new_transaction)

    return {"message": "Transaction added successfully"}


# -----------------------------
# 📅 GET TRANSACTIONS BY MONTH (Dashboard)
# -----------------------------
@router.get("/month")
def get_transactions_by_month(
    month: str,
    user_email: str = Depends(get_current_user_email)
):
    transactions = list(
        transactions_collection.find(
            {"user_email": user_email, "month": month}
        ).sort("created_at", -1)
    )

    for t in transactions:
        t["_id"] = str(t["_id"])
        if "created_at" in t:
            t["created_at"] = t["created_at"].isoformat()

    return transactions


# -----------------------------
# 📊 SUMMARY (Dashboard Cards)
# -----------------------------
@router.get("/summary")
def get_summary(user_email: str = Depends(get_current_user_email)):
    transactions = list(
        transactions_collection.find({"user_email": user_email})
    )

    # important: float conversion prevents NaN bug
    income = sum(float(t["amount"]) for t in transactions if t["type"] == "Income")
    expense = sum(float(t["amount"]) for t in transactions if t["type"] == "Expense")
    investment = sum(float(t["amount"]) for t in transactions if t["type"] == "Investment")

    return {
        "income": income,
        "expense": expense,
        "investment": investment,
        "balance": income - expense - investment
    }


# -----------------------------
# 📄 GET ALL TRANSACTIONS (Transactions Page)
# -----------------------------
@router.get("/all")
def get_all_transactions(user_email: str = Depends(get_current_user_email)):
    transactions = list(
        transactions_collection.find({"user_email": user_email})
        .sort("created_at", -1)
    )

    for t in transactions:
        t["_id"] = str(t["_id"])
        if "created_at" in t:
            t["created_at"] = t["created_at"].isoformat()

    return transactions


# -----------------------------
# 🧾 RECENT 4 TRANSACTIONS (Dashboard small list)
# -----------------------------
@router.get("/recent")
def get_recent_transactions(user_email: str = Depends(get_current_user_email)):
    transactions = list(
        transactions_collection.find({"user_email": user_email})
        .sort("created_at", -1)
        .limit(4)
    )

    for t in transactions:
        t["_id"] = str(t["_id"])
        if "created_at" in t:
            t["created_at"] = t["created_at"].isoformat()

    return transactions


# -----------------------------
# ❌ DELETE TRANSACTION
# -----------------------------
@router.delete("/{id}")
def delete_transaction(id: str, user_email: str = Depends(get_current_user_email)):
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        result = transactions_collection.delete_one({
            "_id": ObjectId(id.strip()),
            "user_email": user_email
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Transaction not found")

        return {"success": True}

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transaction id")

# ✏️ UPDATE TRANSACTION
@router.put("/{id}")
def update_transaction(
    id: str,
    transaction: TransactionCreate,
    user_email: str = Depends(get_current_user_email)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    update_data = transaction.dict()

    result = transactions_collection.update_one(
        {"_id": ObjectId(id), "user_email": user_email},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {"message": "Transaction updated"}
