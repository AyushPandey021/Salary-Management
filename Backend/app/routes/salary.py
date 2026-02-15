from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.salary import Salary
from app.models.users import User
from app.schemas.salary_schema import SalaryCreate
from app.core.security import verify_token

router = APIRouter(prefix="/salary", tags=["Salary"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def add_salary(
    salary: SalaryCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    token = authorization.split(" ")[1]
    email = verify_token(token)

    user = db.query(User).filter(User.email == email).first()

    new_salary = Salary(
        user_id=user.id,
        month=salary.month,
        amount=salary.amount
    )

    db.add(new_salary)
    db.commit()
    db.refresh(new_salary)

    return new_salary


@router.get("/{month}")
def get_salary(
    month: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    token = authorization.split(" ")[1]
    email = verify_token(token)

    user = db.query(User).filter(User.email == email).first()

    salary = db.query(Salary).filter(
        Salary.user_id == user.id,
        Salary.month == month
    ).first()

    return salary
