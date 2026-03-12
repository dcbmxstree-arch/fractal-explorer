// --- CONFIGURACIÓN INICIAL ---
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
// Asegúrate de que este nombre coincida con tu archivo en GitHub
const worker = new Worker('perlin-worker.js'); 

let state = {
    simulation: { fractalType: 'PerlinClouds' },
    viewPort: { centerX: 0, centerY: 0, zoom: 200 },
    parameters: {
        perlin: { octaves: 6, persistence: 0.5, lacunarity: 2.0, seed: Math.random() }
    },
    visuals: { palette: 'QuantumNeon' }
};

// --- FUNCIÓN DE RENDERIZADO ---
function updateSimulation() {
    if (!canvas.width) return;
    
    worker.postMessage({
        width: canvas.width,
        height: canvas.height,
        parameters: state.parameters,
        viewPort: state.viewPort,
        paletteName: state.visuals.palette
    });
}

// Recibir datos del Worker y pintar
worker.onmessage = function(e) {
    const { imgData, width, height } = e.data;
    const imageData = new ImageData(new Uint8ClampedArray(imgData), width, height);
    ctx.putImageData(imageData, 0, 0);
};

// --- CONEXIÓN DE CONTROLES DEL HUD ---

// 1. Sliders de Parámetros
const octRange = document.getElementById('octavesRange');
if(octRange) {
    octRange.addEventListener('input', (e) => {
        state.parameters.perlin.octaves = parseInt(e.target.value);
        document.getElementById('octavesVal').innerText = e.target.value;
        updateSimulation();
    });
}

const persRange = document.getElementById('persRange');
if(persRange) {
    persRange.addEventListener('input', (e) => {
        state.parameters.perlin.persistence = parseFloat(e.target.value);
        document.getElementById('persVal').innerText = e.target.value;
        updateSimulation();
    });
}

// 2. Botones de Paleta (NEON, THERM, SPACE)
const paletteButtons = document.querySelectorAll('.palette-btn');
paletteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.visuals.palette = btn.getAttribute('data-palette');
        updateSimulation();
    });
});

// 3. Botón de Captura
const captureBtn = document.getElementById('captureBtn');
if(captureBtn) {
    captureBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `FRACTAL_DATA_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// --- GESTIÓN DE VENTANA ---
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSimulation();
});

// Inicio automático
window.dispatchEvent(new Event('resize'));
