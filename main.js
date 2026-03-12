// --- CONFIGURACIÓN DE ALTA PERSISTENCIA ---
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // 'alpha: false' ayuda a evitar transparencias negras

const worker = new Worker('perlin-worker.js'); 

// MEMORIA DE RESPALDO: Aquí guardaremos físicamente los píxeles calculados
let lastRenderedBuffer = null; 

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
    if (!canvas.width || !canvas.height) return;
    
    worker.postMessage({
        width: canvas.width,
        height: canvas.height,
        parameters: state.parameters,
        viewPort: state.viewPort,
        paletteName: state.visuals.palette
    });
}

// RECEPTOR DE DATOS MEJORADO
worker.onmessage = function(e) {
    const { imgData, width, height } = e.data;
    
    // 1. Guardamos una copia en RAM del buffer recibido
    lastRenderedBuffer = new Uint8ClampedArray(imgData);
    
    // 2. Pintamos en el canvas visible
    const imageData = new ImageData(lastRenderedBuffer, width, height);
    ctx.putImageData(imageData, 0, 0);
};

// --- CONEXIÓN DE CONTROLES DEL HUD ---

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

const paletteButtons = document.querySelectorAll('.palette-btn');
paletteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.visuals.palette = btn.getAttribute('data-palette');
        updateSimulation();
    });
});

// --- NUEVA LÓGICA DE CAPTURA POR RECONSTRUCCIÓN ---
const captureBtn = document.getElementById('captureBtn');
if(captureBtn) {
    captureBtn.addEventListener('click', () => {
        // Si no hay nada en el buffer, el worker aún no ha terminado
        if (!lastRenderedBuffer) {
            console.warn("Buffer vacío: el sistema aún está calculando.");
            return;
        }

        try {
            // Creamos un canvas "fantasma" que solo existe en memoria
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Reconstruimos la imagen desde el buffer guardado en RAM
            const exportData = new ImageData(lastRenderedBuffer, canvas.width, canvas.height);
            tempCtx.putImageData(exportData, 0, 0);

            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `FRACTAL_DATA_${timestamp}.png`;
            
            // Obtenemos la URL del canvas fantasma (que garantizamos tiene datos)
            link.href = tempCanvas.toDataURL("image/png");
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Feedback visual
            const originalText = captureBtn.innerText;
            captureBtn.innerText = "DATA_GUARDADA";
            captureBtn.style.color = "#00ff00";
            setTimeout(() => {
                captureBtn.innerText = originalText;
                captureBtn.style.color = "var(--neon-cyan)";
            }, 2000);

        } catch (error) {
            console.error("Error en la extracción de datos:", error);
        }
    });
}

// --- GESTIÓN DE VENTANA ---
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSimulation();
});

window.dispatchEvent(new Event('resize'));
