// main.js - El "Cerebro" de la aplicación
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const worker = new Worker('perlin-worker.js');

// Estado Global (Basado en nuestro Esquema de Datos)
let state = {
    viewPort: { centerX: 0, centerY: 0, zoom: 200 },
    parameters: {
        perlin: { octaves: 6, persistence: 0.5, lacunarity: 2.0, seed: Math.random() }
    },
    visuals: { palette: 'QuantumNeon' }
};

// Función para solicitar un nuevo frame al Worker
function updateSimulation() {
    const { width, height } = canvas;
    
    // Notificamos al HUD que estamos "Escaneando"
    document.dispatchEvent(new CustomEvent('simulation-start'));

    worker.postMessage({
        width,
        height,
        parameters: state.parameters,
        viewPort: state.viewPort,
        paletteName: state.visuals.palette
    });
}

// Escuchar la respuesta del Worker
worker.onmessage = function(e) {
    const { imgData, width, height } = e.data;
    const imageData = new ImageData(new Uint8ClampedArray(imgData), width, height);
    
    // Dibujamos el resultado en el canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Efecto de post-procesamiento futurista (opcional)
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#00f2ff';
    ctx.strokeRect(10, 10, width - 20, height - 20); // Marco HUD
    ctx.globalAlpha = 1.0;

    document.dispatchEvent(new CustomEvent('simulation-end'));
};

// Manejo de Zoom (Interacción)
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    state.viewPort.zoom *= zoomFactor;
    updateSimulation();
});

// Inicialización
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSimulation();
});

// Disparo inicial

window.dispatchEvent(new Event('resize'));
// --- LÓGICA DE CAPTURA DE DATOS (IMAGEN) ---
const captureBtn = document.getElementById('captureBtn');

captureBtn.addEventListener('click', () => {
    // 1. Obtener la fecha para un nombre de archivo único
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `FRACTAL_DATA_${state.simulation.fractalType}_${date}.png`;

    // 2. Convertir el contenido del Canvas a una URL de imagen
    // Nota: El canvas debe haber dibujado algo previamente
    const imageURL = canvas.toDataURL("image/png");

    // 3. Crear un enlace temporal para forzar la descarga
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = fileName;
    
    // 4. Simular el clic y eliminar el enlace
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. Efecto visual de confirmación en el botón
    const originalText = captureBtn.innerText;
    captureBtn.innerText = "DATA_GUARDADA";
    captureBtn.style.borderColor = "#00ff00"; // Cambia a verde momentáneamente
    
    setTimeout(() => {
        captureBtn.innerText = originalText;
        captureBtn.style.borderColor = "var(--neon-cyan)";
    }, 2000);
});
// Actualizar Octavas
document.getElementById('octavesRange').addEventListener('input', (e) => {
    state.parameters.perlin.octaves = parseInt(e.target.value);
    document.getElementById('octavesVal').innerText = e.target.value;
    updateSimulation(); // Llama a la función que envía datos al Worker
});

// Cambiar de Paleta (NEON, THERM, SPACE)
const paletteButtons = document.querySelectorAll('.palette-btn');
paletteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Quitar clase activa de todos y ponerla en el actual
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Actualizar estado y renderizar
        state.visuals.palette = btn.getAttribute('data-palette');
        updateSimulation();
    });
});
