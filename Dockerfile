# Build Stage
FROM node:25-slim AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy source and build Storybook
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build-storybook

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/storybook-static /usr/share/nginx/html

# Custom nginx config for SPA/Storybook support if needed
# (Standard nginx:alpine works fine for Storybook's static output)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
