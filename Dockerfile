# Etapa 1: Instalación de dependencias y build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependencias solo de producción si existe package-lock.json o pnpm/yarn.lock
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copia el resto de la aplicación
COPY . .

# Construye el proyecto Next.js
RUN npm run build

# Etapa 2: Imagen ligera para producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia los artefactos de build y node_modules de la etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Si usas TypeScript y quieres omitir los archivos fuente:
# No copies archivos src/ ni tsconfig.json, solo los esenciales de producción

EXPOSE 3000

CMD ["npm", "start"]