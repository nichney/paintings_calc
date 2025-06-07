from typing import List, Tuple
from itertools import product

def add_margins(w: float, h: float) -> Tuple[float, float]:
    return w + 0.2, h + 0.2

def try_layout(canvas_width: float, max_height: float, paintings: List[Tuple[float, float]], rotation_mask: List[bool]) -> List[dict]:
    paintings_with_margin = []
    for i, (w, h) in enumerate(paintings):
        if rotation_mask[i]:
            w, h = h, w
        w, h = add_margins(w, h)  # добавляем по 0.1 м с каждой стороны
        paintings_with_margin.append({
            "index": i,
            "width": w,
            "height": h,
            "raw": (paintings[i][0], paintings[i][1]),
            "rotated": rotation_mask[i]
        })

    layout = []
    current_y = 0.0
    row_height = 0.0
    row_x = 0.0

    for p in paintings_with_margin:
        if row_x + p["width"] <= canvas_width:
            layout.append({
                "x": row_x,
                "y": current_y,
                "width": p["width"],
                "height": p["height"],
                "original": p["raw"],
                "rotated": p["rotated"]
            })
            row_x += p["width"]
            row_height = max(row_height, p["height"])
        else:
            current_y += row_height
            if current_y + p["height"] > max_height:
                return None  # не влезает
            row_x = 0.0
            row_height = p["height"]
            layout.append({
                "x": row_x,
                "y": current_y,
                "width": p["width"],
                "height": p["height"],
                "original": p["raw"],
                "rotated": p["rotated"]
            })
            row_x += p["width"]

    # финальный размер холста (без учёта свободного места снизу)
    total_height = current_y + row_height
    if total_height > max_height:
        return None

    return layout

def find_min_canvas_length(canvas_width: float, paintings: List[Tuple[float, float]]) -> Tuple[float, List[dict]]:
    low = 0.1
    high = 20.0
    best_layout = None
    best_length = high

    for _ in range(25):
        mid = (low + high) / 2
        found_layout = None
        for rotation_mask in product([False, True], repeat=len(paintings)):
            layout = try_layout(canvas_width, mid, paintings, rotation_mask)
            if layout is not None and len(layout) == len(paintings):  
                found_layout = layout
                break
        if found_layout:
            best_layout = found_layout
            best_length = mid
            high = mid
        else:
            low = mid

    return round(best_length, 3), best_layout

