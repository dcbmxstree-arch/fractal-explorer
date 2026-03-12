/**
 * PERLIN-WORKER.JS - Versión de Alta Estabilidad
 */

// Intentamos importar paletas externas, si falla usamos las integradas
try {
    importScripts('colors.js');
} catch (e) {
    console.log("Usando paletas integradas");
}

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

function noise2D(x, y, seed) {
    const n = Math.sin(seed * 12.9898 + x * 78.233 + y * 437.0) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; 
}

function smoothNoise(x, y, seed) {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const fx = x - X;
    const fy = y - Y;
    const v1 = noise2D(X, Y, seed);
    const v2 = noise2D(X + 1, Y, seed);
    const v3 = noise2D(X, Y + 1, seed);
    const v4 = noise2D(X + 1, Y + 1, seed);
    const i1 = v1 * (1 - fx) + v2 * fx;
    const i2 = v3 * (1 - fx) + v4 * fx;
    return i1 * (1 - fy) + i2 * fy;
}

self.onmessage = function(e) {
    const { width, height, parameters, viewPort, paletteName } = e.data;
    const { octaves, persistence, lacunarity, seed } = parameters.perlin;
    const { centerX, centerY, zoom } = viewPort;

    const imgData = new Uint8ClampedArray(width * height * 4);
    
    // Verificación de paleta para evitar errores de referencia
    let selectedPalette = Palettes[paletteName];
    if (!selectedPalette && typeof getPalette === 'function') {
        selectedPalette = getPalette(paletteName);
    }
    if (!selectedPalette) selectedPalette = Palettes.QuantumNeon;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let nx = (x - width / 2) / zoom + centerX;
            let ny = (y - height / 2) / zoom + centerY;

            let totalNoise = 0;
            let amplitude = 1;
            let frequency = 1;
            let maxAmplitude = 0;

            for (let i = 0; i < octaves; i++) {
                totalNoise += smoothNoise(nx * frequency, ny * frequency, seed) * amplitude;
                maxAmplitude += amplitude;
                amplitude *= persistence;
                frequency *= lacunarity;
            }

            let normNoise = (totalNoise / maxAmplitude + 1) / 2;
            normNoise = Math.pow(Math.max(0, Math.min(1, normNoise)), 1.2);

            const color = selectedPalette(normNoise);
            const index = (x + y * width) * 4;

            imgData[index]     = color.r;
            imgData[index + 1] = color.g;
            imgData[index + 2] = color.b;
            imgData[index + 3] = 255;
        }
    }

    // Enviamos una COPIA del buffer. Esto consume un poco más de memoria
    // pero garantiza que 'lastRenderedBuffer' en main.js sea persistente.
    const bufferCopy = imgData.buffer.slice(0);
    self.postMessage({ 
        imgData: bufferCopy, 
        width, 
        height 
    }, [bufferCopy]);
};
