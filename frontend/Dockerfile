FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# URLs do backend que o Next.js precisa em BUILD TIME (rewrites e
# NEXT_PUBLIC_*). Sao injetadas como build args pelo docker-compose.yml.
ARG BACKEND_INTERNAL_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
