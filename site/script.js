function addPainting(width = "", height = "", count = 1) {
    const container = document.createElement("div");
    container.className = "painting-item"; // Add class for styling

    const inputW = document.createElement("input");
    inputW.type = "number";
    inputW.placeholder = "Ширина";
    inputW.step = "0.01";
    inputW.value = width;
    inputW.setAttribute("aria-label", "Ширина картины"); // Accessibility

    const inputH = document.createElement("input");
    inputH.type = "number";
    inputH.placeholder = "Высота";
    inputH.step = "0.01";
    inputH.value = height;
    inputH.setAttribute("aria-label", "Высота картины"); // Accessibility

    const inputCount = document.createElement("input");
    inputCount.type = "number";
    inputCount.placeholder = "Количество";
    inputCount.min = 1;
    inputCount.step = 1;
    inputCount.value = count;
    inputCount.setAttribute("aria-label", "Количество картин"); // Accessibility

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.className = "remove-button"; // Add class for styling
    removeBtn.onclick = () => container.remove();
    removeBtn.setAttribute("aria-label", "Удалить картину"); // Accessibility

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

        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0 && count > 0) { // Added validation for positive dimensions
            for (let i = 0; i < count; i++) {
                paintings.push([w, h]);
            }
        } else if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            alert("Пожалуйста, введите корректные положительные значения для ширины и высоты картин.");
            return null; // Indicate an error
        } else if (count <= 0) {
            alert("Количество картин должно быть больше 0.");
            return null; // Indicate an error
        }
    }
    return paintings;
}


async function sendData() {
    const canvasWidth = parseFloat(document.getElementById("canvasWidth").value);
    const paintings = collectPaintings();
    const resultTextElement = document.getElementById("resultText");

    if (paintings === null) { // Check if collectPaintings returned an error
        resultTextElement.textContent = "Проверьте введенные данные для картин.";
        resultTextElement.style.color = "var(--danger-color)";
        return;
    }

    if (paintings.length === 0) {
        resultTextElement.textContent = "Пожалуйста, добавьте хотя бы одну картину.";
        resultTextElement.style.color = "var(--danger-color)";
        return;
    }

    if (isNaN(canvasWidth) || canvasWidth <= 0) {
        resultTextElement.textContent = "Пожалуйста, введите корректную положительную ширину холста.";
        resultTextElement.style.color = "var(--danger-color)";
        return;
    }

    resultTextElement.textContent = "Выполняется расчет...";
    resultTextElement.style.color = "var(--secondary-color)";

    try {
        const response = await fetch("https://api-paintings.duckdns.org/api/pack", {
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
    const svgContainerWidthPx = svg.parentElement.clientWidth;
    const scale = svgContainerWidthPx / canvasWidth;

    const svgHeightPx = canvasLength * scale;

    svg.setAttribute("width", svgContainerWidthPx);
    svg.setAttribute("height", Math.max(200, svgHeightPx));
    svg.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasLength}`);
    svg.innerHTML = "";

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0);
    bg.setAttribute("y", 0);
    bg.setAttribute("width", canvasWidth);
    bg.setAttribute("height", canvasLength);
    bg.setAttribute("fill", "#fef9f4");
    bg.setAttribute("stroke", "#ccc");
    bg.setAttribute("stroke-width", 0.01);
    svg.appendChild(bg);

    layout.forEach((item, index) => {
        const color = `hsl(${(index * 37) % 360}, 60%, 75%)`;

        const marginRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        marginRect.setAttribute("x", item.x + 0.1);
        marginRect.setAttribute("y", item.y + 0.1);
        marginRect.setAttribute("width", item.width - 0.2);
        marginRect.setAttribute("height", item.height - 0.2);
        marginRect.setAttribute("fill", "none");
        marginRect.setAttribute("stroke", "#999");
        marginRect.setAttribute("stroke-dasharray", "0.01 0.02");
        marginRect.setAttribute("stroke-width", 0.003);
        svg.appendChild(marginRect);

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", item.x);
        rect.setAttribute("y", item.y);
        rect.setAttribute("width", item.width);
        rect.setAttribute("height", item.height);
        rect.setAttribute("fill", color);
        rect.setAttribute("stroke", "#333");
        rect.setAttribute("stroke-width", 0.005);
        svg.appendChild(rect);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", item.x + item.width / 2);
        text.setAttribute("y", item.y + item.height / 2 + 0.01);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#000");
	text.textContent = `${item.original[0].toFixed(2)}×${item.original[1].toFixed(2)}${item.rotated ? " ↻" : ""}`;

        // Determine font size in SVG user units (meters)
        const desiredMinFontSize = 0.008; // This is your desired minimum size in meters
        const dynamicFontSizeFactor = 0.15; // How much of the painting's smaller dimension the text should take

        // Calculate font size: either the dynamic size or the desired minimum, whichever is larger.
        const calculatedFontSize = Math.min(item.width, item.height) * dynamicFontSizeFactor;
        const finalFontSize = Math.max(desiredMinFontSize, calculatedFontSize);

        text.setAttribute("font-size", finalFontSize); // Set font size directly in SVG user units (no 'em')
        svg.appendChild(text);
    });
}
