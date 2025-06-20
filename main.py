from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from pack_paitings import find_min_canvas_length  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PaintingsInput(BaseModel):
    canvas_width: float
    paintings: List[List[float]]  

@app.post("/api/pack")
def pack(input_data: PaintingsInput):
    height, layout = find_min_canvas_length(input_data.canvas_width, input_data.paintings)
    return {
        "canvas_length": height,
        "layout": layout
    }

