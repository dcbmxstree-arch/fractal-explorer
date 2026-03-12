// --- CONFIGURACIÓN INICIAL ---
const canvas = document.getElementById('fractalCanvas');

/** * CORRECCIÓN: Se añade 'willReadFrequently' para asegurar que el buffer 
 * no se limpie y permita capturas de imagen consistentes.
 */
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Asegúrate de que este nombre coincida exactamente con tu archivo en GitHub
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
    if (!canvas.width || !canvas.height) return;
    
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
    // Creamos la imagen a partir del buffer recibido
    const imageData = new ImageData(new Uint8ClampedArray(imgData), width, height);
    ctx.putImageData(imageData, 0, 0);
};

// --- CONEXIÓN DE CONTROLES DEL HUD ---

// 1. Sliders de Parámetros
const octRange = document.getElementById('octavesRange');
if(octRange) {
    octRange.addEventListener('input', (e) => {
        state.parameters.perlin.octaves = parseInt(e.target.value);
        const valDisplay = document.getElementById('octavesVal');
        if(valDisplay) valDisplay.innerText = e.target.value;
        updateSimulation();
    });
}

const persRange = document.getElementById('persRange');
if(persRange) {
    persRange.addEventListener('input', (e) => {
        state.parameters.perlin.persistence = parseFloat(e.target.value);
        const valDisplay = document.getElementById('persVal');
        if(valDisplay) valDisplay.innerText = e.target.value;
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

// 3. Botón de Captura (CORREGIDO)
const captureBtn = document.getElementById('captureBtn');
if(captureBtn) {
    captureBtn.addEventListener('click', () => {
        try {
            // Generar enlace de descarga
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `FRACTAL_LAB_DATA_${timestamp}.png`;
            
            /**
             * Al usar willReadFrequently arriba, toDataURL ahora debería 
             * obtener los datos correctos del buffer de la GPU.
             */
            link.href = canvas.toDataURL("image/png");
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Feedback visual de éxito
            const originalText = captureBtn.innerText;
            captureBtn.innerText = "DATA_GUARDADA";
            captureBtn.style.color = "#00ff00";
            
            setTimeout(() => {
                captureBtn.innerText = originalText;
                captureBtn.style.color = "var(--neon-cyan)";
            }, 2000);

        } catch (error) {
            console.error("Error al capturar el Canvas:", error);
            captureBtn.innerText = "ERROR_CAPTURA";
        }
    });
}

// --- GESTIÓN DE VENTANA ---
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSimulation();
});

// Inicio automático al cargar
window.dispatchEvent(new Event('resize'));
