from typing import List, Tuple

def add_margins(w: float, h: float) -> Tuple[float, float]:
    """С каждой стороны нужно добавить по 10см отступов """
    return w + 0.2, h + 0.2

def pack_paintings(canvas_width: float, paintings: List[Tuple[float, float]]) -> Tuple[float, List[dict]]:
    paintings_with_margin = []
    for index, (w, h) in enumerate(paintings):
        w1, h1 = add_margins(w, h)
        w2, h2 = add_margins(h, w) # в повёрнутом на 90 градусов состоянии
        paintings_with_margin.append({
            "index": index,
            "original": (w1, h1),
            "rotated": (w2, h2),
            "raw": (w, h)
        })

    # сортируем по максимальной высоте
    paintings_with_margin.sort(key=lambda p: -max(p["original"][1], p["rotated"][1]))

    layout = []
    current_y = 0.0
    row_height = 0.0
    row_x = 0.0

    for p in paintings_with_margin:
        placed = False # размещена ли предыдущая картина на текущей строке?
        for is_rotated, (w, h) in enumerate([p["original"], p["rotated"]]): # если да, размещаем следующую
            if row_x + w <= canvas_width:
                layout.append({
                    "x": row_x,
                    "y": current_y,
                    "width": w,
                    "height": h,
                    "original": p["raw"],
                    "rotated": bool(is_rotated)
                })
                row_x += w
                row_height = max(row_height, h)
                placed = True
                break

        if not placed: # если нет, переходим на новую строку
            current_y += row_height
            row_x = 0.0
            w, h = min([p["original"], p["rotated"]], key=lambda x: x[0])
            layout.append({
                "x": row_x,
                "y": current_y,
                "width": w,
                "height": h,
                "original": p["raw"],
                "rotated": p["rotated"] == (w, h)
            })
            row_x += w
            row_height = h

    total_height = current_y + row_height
    return round(total_height, 3), layout

