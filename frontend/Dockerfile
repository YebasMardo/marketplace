# ---- Étape 1 : Construction ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Étape 2 : Servir avec Nginx ----
# Une application React construite n'est que des fichiers statiques —
# aucun Node.js n'est nécessaire pour l'exécuter.
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]