---
subjectCode: 7
title: Resumen Modelo OSI, Encapsulamiento TCP/IP y Análisis con Wireshark
date: 2026-10-28
tags: Redes, TCP/IP, Wireshark, VLAN
---

# Modelo OSI vs Suite de Protocolos TCP/IP

El encapsulamiento transforma los **Datos** de aplicación en **Segmentos** (Capa 4), **Paquetes** (Capa 3), **Tramas** (Capa 2) y **Bits** (Capa 1).

![Comparativa Modelo OSI vs TCP/IP](./media/osi-tcpip-diagram.svg)

## Three-Way Handshake TCP y Flags Críticos

1. **SYN**: El cliente inicia conexión enviando `SEQ = x`.
2. **SYN-ACK**: El servidor responde con `SEQ = y, ACK = x + 1`.
3. **ACK**: El cliente confirma `ACK = y + 1` y comienza la transferencia.

> Un exceso de paquetes `SYN` sin completar el tercer paso (`ACK`) es síntoma clásico de un escaneo **SYN Stealth (`nmap -sS`)** o un ataque **SYN Flood**.

## Filtros Rápidos para Laboratorios en Wireshark

```bash
# Detectar intentos de escaneo SYN sin ACK previo
tcp.flags.syn == 1 && tcp.flags.ack == 0

# Filtrar tráfico ARP para identificar posible ARP Spoofing
arp.duplicate-address-detected || arp.opcode == 2

# Aislar tráfico DNS y consultas TLS ClientHello
dns || tls.handshake.type == 1
```
