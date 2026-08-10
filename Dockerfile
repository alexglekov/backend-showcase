ARG NODE_VERSION=node:20.10-alpine

# build dependecies
FROM --platform=linux/amd64 ${NODE_VERSION} as deps

# g++ make python3 required by node-gyp
RUN apk add --update python3 make g++

WORKDIR /app

COPY . .

RUN npm ci --platform=linuxmusl
RUN npm run db:client:generate
RUN npm run build

# run app
FROM --platform=linux/amd64 ${NODE_VERSION} as runner

WORKDIR /app

COPY --from=deps /app/package*.json ./

COPY --from=deps /app/node_modules/ ./node_modules/
COPY --from=deps /app/dist/apps ./apps

COPY --from=deps /app/tools ./tools
ADD ./certificates ./certificates

EXPOSE 3000 3100