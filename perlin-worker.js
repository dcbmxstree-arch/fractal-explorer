/**
 * PERLIN-WORKER.JS
 * Proceso en segundo plano para el cálculo de nubes fractales y ruidos de Perlin.
 * Implementa suma de octavas para generar texturas orgánicas.
 */

// 1. Definición de Paletas Quantum (Integradas para evitar problemas de importación en GitHub Pages)
const Palettes = {
    QuantumNeon: (val) => ({
        r: 0,
        g: Math.pow(val, 2) * 242,
        b: val * 255
    }),
    Thermal: (val) => ({
        r: val * 255,
        g: Math.pow(val, 4) * 255,
        b: (1 - val) * 50
    }),
    DeepSpace: (val) => {
        const v = Math.pow(val, 1.5) * 255;
        return { r: v * 0.4, g: v * 0.2, b: v };
    }
};

// 2. Función de Ruido Base (Algoritmo de Hash para ruido determinista)
function noise2D(x, y, seed) {
    const n = Math.sin(seed * 12.9898 + x * 78.233 + y * 437.0) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; 
}

// 3. Función de interpolación bilineal para suavizar el ruido
function smoothNoise(x, y, seed) {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const fx = x - X;
    const fy = y - Y;

    // Valores de ruido en los 4 bordes del "píxel" matemático
    const v1 = noise2D(X, Y, seed);
    const v2 = noise2D(X + 1, Y, seed);
    const v3 = noise2D(X, Y + 1, seed);
    const v4 = noise2D(X + 1, Y + 1, seed);

    // Interpolación (Suavizado)
    const i1 = v1 * (1 - fx) + v2 * fx;
    const i2 = v3 * (1 - fx) + v4 * fx;
    return i1 * (1 - fy) + i2 * fy;
}

// 4. Escuchador de mensajes del Hilo Principal
self.onmessage = function(e) {
    const { width, height, parameters, viewPort, paletteName } = e.data;
    const { octaves, persistence, lacunarity, seed } = parameters.perlin;
    const { centerX, centerY, zoom } = viewPort;

    // Buffer de imagen: 4 bytes por píxel (RGBA)
    const imgData = new Uint8ClampedArray(width * height * 4);
    const selectedPalette = Palettes[paletteName] || Palettes.QuantumNeon;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            
            // Mapeo de coordenadas con zoom y desplazamiento
            let nx = (x - width / 2) / zoom + centerX;
            let ny = (y - height / 2) / zoom + centerY;

            let totalNoise = 0;
            let amplitude = 1;
            let frequency = 1;
            let maxAmplitude = 0;

            // Bucle de Octavas Fractales
            for (let i = 0; i < octaves; i++) {
                totalNoise += smoothNoise(nx * frequency, ny * frequency, seed) * amplitude;
                maxAmplitude += amplitude;
                amplitude *= persistence;
                frequency *= lacunarity;
            }

            // Normalización y ajuste de contraste para estética de "Nubes"
            let normNoise = totalNoise / maxAmplitude;
            normNoise = (normNoise + 1) / 2; // Rango [0, 1]
            normNoise = Math.pow(normNoise, 1.2); // Curva de contraste

            // Mapeo de Color según la paleta seleccionada
            const color = selectedPalette(normNoise);
            const index = (x + y * width) * 4;

            imgData[index]     = color.r;     // R
            imgData[index + 1] = color.g;     // G
            imgData[index + 2] = color.b;     // B
            imgData[index + 3] = 255;         // A
        }
    }

    // Devolución de datos optimizada (Transferable Objects)
    // Se transfiere el buffer para que el hilo principal no tenga que copiar la memoria
    self.postMessage({ 
        imgData: imgData.buffer, 
        width, 
        height 
    }, [imgData.buffer]);
};