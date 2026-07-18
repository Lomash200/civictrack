# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_API_ORIGIN=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
