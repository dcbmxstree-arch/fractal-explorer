# Fractal Explorer & Lab: Quantum Edition 🌀

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform: Web](https://img.shields.io/badge/platform-web-violet.svg)]()

> Una plataforma interactiva de divulgación científica para la exploración y simulación de fractales deterministas y orgánicos, con un enfoque en aplicaciones modernas.



---

## 🚀 Vision General

**Fractal Explorer & Lab** es más que un visualizador; es un laboratorio digital diseñado con una estética futurista "HUD" (Heads-Up Display). Permite a los usuarios sumergirse en la complejidad matemática de conjuntos clásicos y experimentar con la generación orgánica de terrenos y nubes mediante Ruidos de Perlin, todo renderizado en tiempo real gracias a la potencia del navegador moderno.

### 🎯 Objetivos
1.  **Educación Interactiva:** Explicar conceptos complejos como la autosimilitud y la iteración infinita a través de la experiencia directa.
2.  **Visualización de Aplicaciones:** Demostrar cómo los fractales se utilizan hoy en día en gráficos de videojuegos, compresión de imágenes y diseño de antenas.
3.  **Alto Rendimiento:** Demostrar el uso de tecnologías web avanzadas (WebGL, Web Workers) para simulaciones computacionales intensas.

---

## 🛠️ Arquitectura Técnica y Stack

El proyecto está construido siguiendo principios de modularidad y rendimiento:

| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| **Núcleo de Interfaz** | Vanilla JS / Vite | Manejo de DOM y orquestación del estado. |
| **Motor Gráfico** | Canvas API (2D/WebGL) | Renderizado de píxeles a alta velocidad. |
| **Hilos de Cálculo** | Web Workers | Procesamiento en paralelo de algoritmos iterativos sin bloquear la UI. |
| **Estilos** | CSS Moderno | Estética futurista "Dark Neon" con efectos de desenfoque. |



### ⚙️ El Esquema de Datos
La simulación se rige por un objeto de estado global que controla parámetros como:
* `fractalType`: Mandelbrot, Julia, PerlinClouds.
* `zoom`, `centerX`, `centerY`: Control de la ventana de visualización.
* `maxIterations`, `constantC`, `perlinParameters`: Ajustes específicos del algoritmo.

---

## 🧪 El Algoritmo: Nubes Fractales (Ruido de Perlin)

Para la generación de nubes y terrenos orgánicos, utilizamos una implementación de Ruido de Perlin multifractal. Esto no es solo aleatoriedad; es ruido coherente que simula estructuras naturales.



La función principal suma múltiples "octavas" de ruido con diferentes frecuencias y amplitudes:

```latex
\[ Noise_{fractal}(x, y) = \sum_{i=0}^{n-1} \text{persistence}^i \cdot \text{Noise}(\text{lacunarity}^i \cdot x, \text{lacunarity}^i \cdot y) \]