from src.db import database
from fastapi import FastAPI
from src.routes import router
from fastapi.middleware.cors import CORSMiddleware

database.Base.metadata.create_all(bind=database.engine,)

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=["*"]
)

app.include_router(router=router.router)


