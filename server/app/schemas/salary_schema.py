from pydantic import BaseModel

class SalaryCreate(BaseModel):
    month: str
    amount: int

class SalaryResponse(BaseModel):
    id: int
    month: str
    amount: int

    class Config:
        orm_mode = True
