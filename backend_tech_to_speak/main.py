from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.audio_controller import router as audio_router
from controllers.jargon_controller import router as jargon_router
from controllers.image_controller import router as image_router
from controllers.file_controller import router as file_router

app = FastAPI(
    title="Tech To Speak API",
    description="Backend del Traductor de Jerga de Oficio",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["health"])
def read_root():
    return {"mensaje": "Tech To Speak API operativa 🚀"}

app.include_router(audio_router, prefix="/api/v1/audio", tags=["audio"])
app.include_router(jargon_router, prefix="/api/v1/jargon", tags=["traductor"])
app.include_router(image_router, prefix="/api/v1/image", tags=["imagen"])
app.include_router(file_router, prefix="/api/v1/file", tags=["archivo"])