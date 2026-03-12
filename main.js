const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const worker = new Worker('perlin-worker.js'); 

let lastRenderedBuffer = null; 

let state = {
    simulation: { fractalType: 'PerlinClouds' },
    viewPort: { centerX: 0, centerY: 0, zoom: 200 },
    parameters: {
        perlin: { octaves: 6, persistence: 0.5, lacunarity: 2.0, seed: Math.random() }
    },
    visuals: { palette: 'QuantumNeon' }
};

function updateSimulation() {
    if (!canvas.width || !canvas.height) return;
    worker.postMessage({
        width: canvas.width,
        height: canvas.height,
        parameters: state.parameters,
        viewPort: state.viewPort,
        paletteName: state.visuals.palette
    });
}

worker.onmessage = function(e) {
    const { imgData, width, height } = e.data;
    // Guardamos la copia física de los píxeles
    lastRenderedBuffer = imgData; 
    const imageData = new ImageData(imgData, width, height);
    ctx.putImageData(imageData, 0, 0);
};

// --- CAPTURA ---
document.getElementById('captureBtn').addEventListener('click', () => {
    if (!lastRenderedBuffer) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    const exportData = new ImageData(new Uint8ClampedArray(lastRenderedBuffer), canvas.width, canvas.height);
    tempCtx.putImageData(exportData, 0, 0);

    const link = document.createElement('a');
    link.download = `FRACTAL_EXPORT_${Date.now()}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();

    // Feedback visual
    const btn = document.getElementById('captureBtn');
    btn.innerText = "CAPTURA_EXITOSA";
    setTimeout(() => btn.innerText = "CAPTURAR_DATA", 2000);
});

// --- CONTROLES ---
document.getElementById('octavesRange').addEventListener('input', (e) => {
    state.parameters.perlin.octaves = parseInt(e.target.value);
    document.getElementById('octavesVal').innerText = e.target.value;
    updateSimulation();
});

document.getElementById('persRange').addEventListener('input', (e) => {
    state.parameters.perlin.persistence = parseFloat(e.target.value);
    document.getElementById('persVal').innerText = e.target.value;
    updateSimulation();
});

document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.visuals.palette = btn.getAttribute('data-palette');
        updateSimulation();
    });
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSimulation();
});
window.dispatchEvent(new Event('resize'));

