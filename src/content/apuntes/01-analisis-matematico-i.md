---
subjectCode: 1
title: Teoremas de Derivabilidad, Regla de L'Hôpital y Estudio de Funciones
date: 2026-10-15
tags: Cálculo, Derivadas, Límites
---

# Teoremas Fundamentales del Cálculo Diferencial

## 1. Teorema de Rolle
Si una función `f(x)` es:
- Continua en el intervalo cerrado `[a, b]`
- Derivable en el intervalo abierto `(a, b)`
- Cumple `f(a) = f(b)`

Entonces existe al menos un punto `c` en `(a, b)` tal que `f'(c) = 0`.

## 2. Teorema del Valor Medio (Lagrange)
Bajo las mismas hipótesis de continuidad en `[a, b]` y derivabilidad en `(a, b)`, existe `c` tal que:

```text
f'(c) = (f(b) - f(a)) / (b - a)
```

> **Consejo para el final:** Siempre verificar explícitamente continuidad y derivabilidad antes de aplicar Rolle, Lagrange o la Regla de L'Hôpital en indeterminaciones `0/0` o `inf/inf`.
