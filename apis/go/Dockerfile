FROM golang:1.14

WORKDIR /go/src/app
COPY . .

RUN go get github.com/gorilla/mux
RUN go get -u github.com/go-sql-driver/mysql
RUN go get github.com/rs/cors

EXPOSE 3002

CMD ["go", "run", "main.go"]