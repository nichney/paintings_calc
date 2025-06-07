from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from pack_paitings import pack_paintings  

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

class PaintingsInput(BaseModel):
    canvas_width: float
    paintings: List[Tuple[float, float]]

@app.post("/api/pack")
def pack(paintings: PaintingsInput):
    height, layout = pack_paintings(paitings.canvas_width, paitings.paintings)
    return {"canvas_length": height, "layout": layout}

