# ---- Étape 1 : Construction ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers package AVANT le reste du code source.
# Docker met en cache chaque instruction comme une "couche" — si package.json
# n'a pas changé, cette couche (et le lent npm install) est réutilisée au lieu
# d'être relancée, même si vous avez modifié votre code source depuis le dernier build.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Étape 2 : Production ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Ne récupérer QUE le dossier dist compilé depuis l'étape de build.
# Le code source, le compilateur TypeScript et les dépendances de développement
# ne se retrouvent jamais dans cette image finale.
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]