/**
 * COLORS.JS - Definición de espectros para el Fractal Lab
 */
self.Palettes = {
    // Estética de circuitos y neón (Cyan/Azul)
    QuantumNeon: (val) => ({
        r: 0,
        g: Math.pow(val, 2) * 242,
        b: val * 255
    }),
    
    // Estética de sensor térmico (Rojo/Amarillo)
    Thermal: (val) => ({
        r: val * 255,
        g: Math.pow(val, 4) * 255,
        b: (1 - val) * 50
    }),
    
    // Estética Deep Space (Violetas/Azules profundos)
    DeepSpace: (val) => {
        const v = Math.pow(val, 1.5) * 255;
        return {
            r: v * 0.4,
            g: v * 0.2,
            b: v
        };
    }
};

// Función de ayuda para el Worker
function getPalette(name) {
    return self.Palettes[name] || self.Palettes.QuantumNeon;
}
