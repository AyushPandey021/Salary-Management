from fastapi import FastAPI
from app.routes import auth, transaction
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tag_routes
from app.routes import targets
from app.routes import auth

app = FastAPI()

# ✅ CORS Configuration (for Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# ✅ Routers
app.include_router(auth.router)
app.include_router(transaction.router)
app.include_router(tag_routes.router)
app.include_router(targets.router)
@app.get("/")
def root():
    return {"message": "Salary Management API Running 🚀"}


