# 🐄 Sistema de Gestión Ganadera

Este es un proyecto de simulación de una granja ganadera con frontend en Next.js y backend con MongoDB. Permite visualizar vacas en un mapa, ubicarlas en distintas zonas y simular sus movimientos, desconexiones y alertas. También incluye un sistema automático de backups.

---

## 🚀 Cómo ejecutar el proyecto

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/tp-sl-gestionganadera.git
   cd tp-sl-gestionganadera
   ```

2. **Crear un archivo .env**:
   ```bash
   MONGODB_URI=mongodb://mongo:27017/mongo
   ```

3. **Levantar todo con Docker**:
   ```bash
   docker-compose up --build
   ```

4. El sistema levantará:

   - Frontend en Next.js (`http://localhost:3000`)
   - MongoDB accesible desde el backend
   - Backend simulando ubicación de vacas y generando backups

---

## 🧠 Seed automático de datos

Al iniciar por primera vez, si la base de datos MongoDB está vacía, se ejecutará automáticamente el seed contenido en:

```
lib/mongodb.ts
```

Este seed crea:

- 👨‍💼 Usuario de admin
- 🐄 20 vacas con ubicaciones aleatorias dentro de la granja
- 📦 Varias zonas predeterminadas (Establos, Comederos, Pastura, etc.)

---

## 🗺️ Funcionalidad principal

- Mapa interactivo con Leaflet
- Movimiento automático de vacas
- Detección de escape y desconexión
- Cálculo de cuántas vacas hay en cada zona
- Sistema de zonas personalizadas

---

## 💾 Sistema de backups

El sistema de backups simula un esquema de backup real:

- **1 backup diario** (se conserva durante 7 días)
- Al 7º día, se genera **1 backup semanal**
- Al 30º día, se genera **1 backup mensual**
- Luego, los backups diarios empiezan a sobreescribirse

### Archivos relacionados:

- `backup.real.sh`: Script real, pensado para producción (1 día, 7 días, 30 días)
- `backup.sh`: Script de simulación rápida para testing:
  - Backups cada 10 segundos (simula diarios)
  - A los 30 segundos, genera un backup semanal
  - A los 60 segundos, uno mensual

---

## ⚠️ Problemas comunes

### ❌ El backup no corre en Linux
'mongo-backup  | sh: 1: /backup.sh: not found'

✅ **Solución**: Convertí el archivo a formato Unix LF con:

```bash
dos2unix backup.sh
```

O editá en VS Code y cambiá el tipo de final de línea (abajo a la derecha: CRLF → LF).

---

## 🧰 Tecnologías usadas

- Next.js 14 (App Router)
- TypeScript
- React Leaflet
- MongoDB
- Docker / Docker Compose

---

## 📍 Autores

- Juan Olave
- Ramiro Cardelli
- Joaquin Martinez
