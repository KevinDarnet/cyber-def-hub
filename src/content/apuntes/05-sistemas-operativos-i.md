---
subjectCode: 5
title: Arquitectura del Kernel Linux, Permisos POSIX y Hardening Base
date: 2026-10-25
tags: Linux, Kernel, Permisos, Bash
---

# Arquitectura User Space vs Kernel Space

El sistema operativo **GNU/Linux** separa estrictamente la ejecución entre el **Espacio de Usuario (Ring 3)** y el **Espacio de Kernel (Ring 0)** mediante llamadas al sistema (*syscalls*).

![Arquitectura Kernel GNU/Linux](./media/linux-kernel-arch.svg)

## Permisos Especiales POSIX (SUID, SGID y Sticky Bit)

> En auditorías de seguridad y escalada de privilegios local (LPE), los binarios con bit **SUID** mal configurados son uno de los vectores críticos más frecuentes.

| Permiso | Valor Octal | Efecto en Archivos | Efecto en Directorios |
| --- | --- | --- | --- |
| SUID | 4000 | Ejecuta con UID del propietario | Sin efecto estándar |
| SGID | 2000 | Ejecuta con GID del grupo | Hereda el grupo del directorio |
| Sticky Bit | 1000 | Sin uso moderno | Solo el dueño puede borrar sus archivos (`/tmp`) |

## Comandos Esenciales de Auditoría en Terminal

```bash
# Buscar todos los binarios con bit SUID activo en el sistema
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null

# Verificar capacidades POSIX (Linux Capabilities)
getcap -r / 2>/dev/null

# Inspeccionar procesos y sockets abiertos con privilegios
ss -tulnp
ps auxf
```

## Checklist de Repaso para Parcial
- [x] Diferencia entre proceso, hilo (thread) y *namespace* en Linux
- [x] Paginación de memoria virtual y rol de la MMU / TLB
- [ ] Practicar planificación de CPU (Round Robin, CFS, Prioridades)
