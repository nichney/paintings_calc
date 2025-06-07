function addPainting(width = "", height = "", count = 1) {
    const container = document.createElement("div");
    container.className = "painting-item"; // Add class for styling

    const inputW = document.createElement("input");
    inputW.type = "number";
    inputW.placeholder = "Ширина";
    inputW.step = "0.01";
    inputW.value = width;

    const inputH = document.createElement("input");
    inputH.type = "number";
    inputH.placeholder = "Высота";
    inputH.step = "0.01";
    inputH.value = height;

    const inputCount = document.createElement("input");
    inputCount.type = "number";
    inputCount.placeholder = "Количество";
    inputCount.min = 1;
    inputCount.step = 1;
    inputCount.value = count;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.className = "remove-button"; // Add class for styling
    removeBtn.onclick = () => container.remove();

    const labelW = document.createElement("span");
    labelW.textContent = "Ш:";
    const labelH = document.createElement("span");
    labelH.textContent = " В:";
    const labelCount = document.createElement("span");
    labelCount.textContent = " Кол-во:";


    container.append(labelW, inputW, labelH, inputH, labelCount, inputCount, removeBtn);
    document.getElementById("paintingsList").appendChild(container);
}

function collectPaintings() {
    const divs = document.getElementById("paintingsList").children;
    const paintings = [];

    for (let d of divs) {
        const inputs = d.querySelectorAll("input");
        const w = parseFloat(inputs[0].value);
        const h = parseFloat(inputs[1].value);
        const count = parseInt(inputs[2].value);

        if (!isNaN(w) && !isNaN(h) && count > 0) {
            for (let i = 0; i < count; i++) {
                paintings.push([w, h]);
            }
        }
    }
    return paintings;
}


async function sendData() {
    const canvasWidth = parseFloat(document.getElementById("canvasWidth").value);
    const paintings = collectPaintings();
    const resultTextElement = document.getElementById("resultText");

    if (paintings.length === 0) {
        resultTextElement.textContent = "Пожалуйста, добавьте хотя бы одну картину.";
        resultTextElement.style.color = "var(--danger-color)";
        return;
    }

    resultTextElement.textContent = "Выполняется расчет...";
    resultTextElement.style.color = "var(--secondary-color)";

    try {
        const response = await fetch("http://paintings.duckdns.org:8000/api/pack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ canvas_width: canvasWidth, paintings: paintings })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        resultTextElement.textContent = `Необходимая длина холста: ${data.canvas_length.toFixed(2)} м`;
        resultTextElement.style.color = "var(--success-color)";
        drawCanvas(canvasWidth, data.layout, data.canvas_length);
    } catch (error) {
        console.error("Ошибка при запросе:", error);
        resultTextElement.textContent = `Произошла ошибка при вычислении: ${error.message}`;
        resultTextElement.style.color = "var(--danger-color)";
    }
}


function drawCanvas(canvasWidth, layout, canvasLength) {
    const svg = document.getElementById("canvas");
    // Calculate a dynamic scale based on SVG width and desired pixel size per meter
    // Let's assume 1 meter = 300 pixels for a default width of 600px, so canvasWidth * 300 is base for SVG width
    const svgBaseWidthPx = 600; // The fixed width of the SVG container
    const scale = svgBaseWidthPx / canvasWidth; // Scale for 1 meter in pixels

    // Ensure viewBox matches actual dimensions for proper scaling
    // The height of the SVG will be dynamically set to fit the content
    const svgHeightPx = canvasLength * scale;

    svg.setAttribute("width", svgBaseWidthPx); // Maintain the fixed width set in HTML for visual consistency
    svg.setAttribute("height", Math.max(200, svgHeightPx)); // Set min height to avoid collapsing, otherwise calculated height
    svg.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasLength}`); // viewBox defines the internal coordinate system
    svg.innerHTML = ""; // Clear previous drawings

    // background of the canvas
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0);
    bg.setAttribute("y", 0);
    bg.setAttribute("width", canvasWidth);
    bg.setAttribute("height", canvasLength);
    bg.setAttribute("fill", "#fef9f4");
    bg.setAttribute("stroke", "#ccc");
    bg.setAttribute("stroke-width", 0.01);
    svg.appendChild(bg);

    // paintings themselves
    layout.forEach((item, index) => {
        const color = `hsl(${(index * 37) % 360}, 60%, 75%)`; // Distinct colors

        // Dashed border for margin
        const marginRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // These values represent the actual coordinates and dimensions in meters
        marginRect.setAttribute("x", item.x + 0.1);
        marginRect.setAttribute("y", item.y + 0.1);
        marginRect.setAttribute("width", item.width - 0.2);
        marginRect.setAttribute("height", item.height - 0.2);
        marginRect.setAttribute("fill", "none");
        marginRect.setAttribute("stroke", "#999");
        marginRect.setAttribute("stroke-dasharray", "0.01 0.02"); // Dash pattern in user units
        marginRect.setAttribute("stroke-width", 0.003); // Stroke width in user units
        svg.appendChild(marginRect);

        // Main rectangle for the painting
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", item.x);
        rect.setAttribute("y", item.y);
        rect.setAttribute("width", item.width);
        rect.setAttribute("height", item.height);
        rect.setAttribute("fill", color);
        rect.setAttribute("stroke", "#333");
        rect.setAttribute("stroke-width", 0.005);
        svg.appendChild(rect);

        // Text label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", item.x + item.width / 2);
        text.setAttribute("y", item.y + item.height / 2 + 0.01); // Adjust y for vertical centering
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#000");
        text.textContent = `${item.original[0]}×${item.original[1]}${item.rotated ? " ↻" : ""}`;
        svg.appendChild(text);
    });
}
