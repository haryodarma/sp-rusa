from fastapi import APIRouter
from . import auth, user, deer, disease, symptom, expert_symptom, user_symptom, prediction

router = APIRouter(prefix="/api", tags=["API"])

router.include_router(router=auth.router)
router.include_router(router=user.router)
router.include_router(router=deer.router)
router.include_router(router=disease.router)
router.include_router(router=symptom.router)
router.include_router(router=expert_symptom.router)
router.include_router(router=user_symptom.router)
router.include_router(router=prediction.router)
