package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

//Variables de conexion para la base de datos
var db *sql.DB
var err error

type Post struct {
	Cantidad int `json:cantidad`
}
type Publicacion struct {
	Nombre     string   `json:nombre`
	Comentario string   `json:comentario`
	Fecha      string   `json:fecha`
	Hashtags   []string `json:hashtags`
	Upvotes    int      `json:upvotes`
	Downvotes  int      `json:downvotes`
}

func indexRoute(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "API GO is ready")
}

func finalizarCarga(w http.ResponseWriter, r *http.Request) {
	var newCantidad Post
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintln(w, "Error en la entrada")
	}
	json.Unmarshal(reqBody, &newCantidad)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(newCantidad)
}

func publicacion(w http.ResponseWriter, r *http.Request) {
	var newPublicacion Publicacion
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintln(w, "Error al recibir la publicacion")
	}
	json.Unmarshal(reqBody, &newPublicacion)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(newPublicacion)
}

func main() {
	//abrir conexion a la base de datos
	db, err := sql.Open("mysql", "root:proyectosusac@tcp(127.0.0.1:3306)/proyecto1")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	//rutas del servidor
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", indexRoute).Methods("GET")
	router.HandleFunc("/publicacion", publicacion).Methods("POST")
	router.HandleFunc("/finalizarCarga", finalizarCarga).Methods("POST")
	http.ListenAndServe(":3001", router)
}
