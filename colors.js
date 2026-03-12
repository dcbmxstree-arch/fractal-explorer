// Dentro de perlin-worker.js o un archivo de utilidades
const Palettes = {
    // Estética de circuitos y neón
    QuantumNeon: (val) => {
        return {
            r: Math.pow(val, 3) * 0,      // Sin rojo
            g: Math.pow(val, 2) * 242,    // Verde Cyan
            b: val * 255                  // Azul Eléctrico
        };
    },
    // Estética de sensor térmico / Energía pura
    Thermal: (val) => {
        return {
            r: val * 255,                 // Calor intenso
            g: Math.pow(val, 4) * 255,    // Transición rápida
            b: (1 - val) * 50             // Sombras frías
        };
    },
    // Estética "Deep Space" (Blanco y Negro con tintes violetas)
    DeepSpace: (val) => {
        const v = Math.pow(val, 1.5) * 255;
        return {
            r: v * 0.4,
            g: v * 0.2,
            b: v
        };
    }
};

// Uso dentro del bucle del Worker:
// const color = Palettes[paletteName](normalizedNoise);
// data[pix] = color.r;
// data[pix + 1] = color.g;
// data[pix + 2] = color.b;