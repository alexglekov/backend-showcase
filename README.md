# Xyro

set the .end file by the example in .env.example file

Create network

```bash

  $ docker network create -d bridge xyro

```

Infrastructure up

```bash

  $ make infra

```


### Ports

3000 - Api Gateway http port
3010 - Back office http port

31XX - http ports for microservices
32xx - grpc ports for microservices

```
USER
3101 - http user
3201 - grpc user

PRICES
3102 - http prices
3202 - grpc prices

ANALYNICS
3103 - http analytics
3203 - grpc analytics

BULLSEYE
3105 - http bulls eye
3205 - grpc bulls eye

MESSENGER
3106 - http messenger
3206 - grpc messenger

NOTIFICATIONS
3107 - http notifications

ONE-VS-ONE
3108 - http one vs ove

SETUPS
3109 - http setups

UP DOWN
3110 - http up down

X1000
3111 - http x1000

CANDLES
3112 - http candles

LEDGER
3113 - http ledger
3213 - grpc ledger

TWITTER INDEXER
3114 - http twitter
3214 - grpc twitter

```



