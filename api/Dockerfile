FROM node:23-alpine3.20
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
EXPOSE 5555
ENV PORT 5555
CMD ["pm2-runtime", "src/index.js"]