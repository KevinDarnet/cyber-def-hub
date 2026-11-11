---
subjectCode: 17
title: Matriz MITRE ATT&CK, SIEM y Ciclo de Respuesta a Incidentes
date: 2026-10-29
tags: Blue Team, SIEM, MITRE, SOC
---

# Fases de Respuesta a Incidentes (NIST SP 800-61)

1. **Preparación**: Hardening, inventario de activos, centralización de logs en SIEM y playbooks.
2. **Detección y Análisis**: Correlación de alertas, triaje de falsos positivos e identificación de IoCs.
3. **Contención, Erradicación y Recuperación**: Aislamiento de red, eliminación de persistencia y restauración limpia.
4. **Actividad Post-Incidente**: Lecciones aprendidas y ajuste de reglas de detección (**Sigma / YARA**).

## Ejemplo de Regla Sigma para Detección de Ejecución Sospechosa

```yaml
title: Ejecucion codificada en Base64 mediante PowerShell
status: experimental
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\powershell.exe'
    CommandLine|contains:
      - ' -enc '
      - ' -EncodedCommand '
  condition: selection
level: high
```
