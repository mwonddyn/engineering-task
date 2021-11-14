# syntax=docker/dockerfile:1
FROM node:17
WORKDIR /app
COPY . .
ENV PORT=3000


# Install dependencies
RUN npm install
RUN npm i -g typescript
RUN npm i -g eslint
RUN tsc

# Expose port 3000
EXPOSE 3000

CMD  [ "npm", "run" , "serve" ]
