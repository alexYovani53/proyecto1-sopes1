FROM golang:1.14

WORKDIR /go/src/app
COPY . .

RUN go get github.com/gorilla/mux
RUN go get -u github.com/go-sql-driver/mysql
RUN go get github.com/rs/cors
RUN go get github.com/denisenkom/go-mssqldb
RUN go get cloud.google.com/go/pubsub
RUN go get github.com/joho/godotenv

EXPOSE 3002

CMD ["go", "run", "main.go"]
