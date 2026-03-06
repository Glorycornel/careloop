from fastapi import FastAPI

from app.routers import auth, habits

app = FastAPI(title="CareLoop API")

app.include_router(auth.router)
app.include_router(habits.router)


@app.get("/health")
def health():
    return {"status": "ok"}
