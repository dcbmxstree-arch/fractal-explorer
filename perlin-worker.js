/**
 * PERLIN-WORKER.JS - Edición Laboratorio Aeroespacial
 */

// Intentamos importar paletas externas
try {
    importScripts('colors.js');
} catch (e) {
    console.warn("Usando paletas integradas por fallo en colors.js");
}

// Definición local de seguridad (Fallback)
const Palettes = self.Palettes || {
    QuantumNeon: (val) => ({ r: 0, g: Math.pow(val, 2) * 242, b: val * 255 }),
    Thermal: (val) => ({ r: val * 255, g: Math.pow(val, 4) * 255, b: (1 - val) * 50 }),
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
    const X = Math.floor(x); const Y = Math.floor(y);
    const fx = x - X; const fy = y - Y;
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
    const selectedPalette = Palettes[paletteName] || Palettes.QuantumNeon;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let nx = (x - width / 2) / zoom + centerX;
            let ny = (y - height / 2) / zoom + centerY;
            let totalNoise = 0; let amp = 1; let freq = 1; let maxAmp = 0;

            for (let i = 0; i < octaves; i++) {
                totalNoise += smoothNoise(nx * freq, ny * freq, seed) * amp;
                maxAmp += amp; amp *= persistence; freq *= lacunarity;
            }

            let norm = Math.pow((totalNoise / maxAmp + 1) / 2, 1.2);
            const color = selectedPalette(Math.max(0, Math.min(1, norm)));
            const idx = (x + y * width) * 4;

            imgData[idx] = color.r;
            imgData[idx + 1] = color.g;
            imgData[idx + 2] = color.b;
            imgData[idx + 3] = 255;
        }
    }

    // CRÍTICO: No usamos transferencia directa para permitir la persistencia en main.js
    self.postMessage({ 
        imgData: imgData, // Enviamos el Array directamente, no el .buffer
        width, 
        height 
    });
};

