package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

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

type PublicacionId struct {
	id_publicacion int
}

type HashTagId struct {
	id_hashtag int
}

type ListaHash struct {
	hashtags_id []int
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
	datos := ingresar_publicacion(&newPublicacion)

	lista := ingresar_hashtags(&newPublicacion)

	ingresar_publicacion_hash(datos, lista)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(newPublicacion)
}

func ingresar_publicacion(newPub *Publicacion) PublicacionId {

	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}

	stmt, err := db.Prepare("INSERT INTO publicacion(nombre,comentario,fecha, upvotes,downvotes) VALUES(?, ?, STR_TO_DATE(?, '%d/%m/%Y'), ?, ?)")
	if err != nil {
		panic(err.Error())
	}

	//obtenemos la base de datos
	_, err = stmt.Exec(newPub.Nombre, newPub.Comentario, newPub.Fecha, newPub.Upvotes, newPub.Downvotes)
	if err != nil {
		panic(err.Error())
	}

	//Preparando la extraccion de al id
	result, err := db.Query("SELECT id_publicacion from publicacion where nombre = ? and comentario = ?", newPub.Nombre, newPub.Comentario)
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	var datos PublicacionId

	for result.Next() {

		err := result.Scan(&datos.id_publicacion)
		if err != nil {
			panic(err.Error())
		}
		return datos
	}
	return datos
}

func ingresar_hashtags(newPub *Publicacion) ListaHash {
	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}
	var lista_salida ListaHash

	for i := len(newPub.Hashtags) - 1; i >= 0; i-- {
		//Preparando la extraccion de al id
		result, err := db.Query("SELECT id_hashtag from hashtag where descripcion =?", newPub.Hashtags[i])
		if err != nil {
			panic(err.Error())
		}
		defer result.Close()
		var datos HashTagId
		//si existe lo obtengo
		if result.Next() {
			err := result.Scan(&datos.id_hashtag)
			if err != nil {
				panic(err.Error())
			}
			lista_salida.hashtags_id = append(lista_salida.hashtags_id, datos.id_hashtag)
			//Si no existe lo mando a traer
		} else {
			stmt, err := db.Prepare("INSERT INTO hashtag(descripcion) VALUES(?)")
			if err != nil {
				panic(err.Error())
			}

			_, err = stmt.Exec(newPub.Hashtags[i])
			if err != nil {
				panic(err.Error())
			}
			result, err := db.Query("SELECT id_hashtag from hashtag where descripcion =?", newPub.Hashtags[i])
			if err != nil {
				panic(err.Error())
			}
			defer result.Close()
			for result.Next() {
				err := result.Scan(&datos.id_hashtag)
				if err != nil {
					panic(err.Error())
				}
				lista_salida.hashtags_id = append(lista_salida.hashtags_id, datos.id_hashtag)
			}
		}

	}
	return lista_salida
}

func ingresar_publicacion_hash(publicacionId PublicacionId, lista ListaHash) {
	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}

	for i := len(lista.hashtags_id) - 1; i >= 0; i-- {
		stmt, err := db.Prepare("INSERT INTO publicacion_hashtag(id_publicacion,id_hashtag) VALUES(?,?)")
		if err != nil {
			panic(err.Error())
		}
		_, err = stmt.Exec(publicacionId.id_publicacion, lista.hashtags_id[i])
		if err != nil {
			panic(err.Error())
		}
	}
}

func getDB() (*sql.DB, error) {
	return sql.Open("mysql", "root:proyectosusac@tcp(127.0.0.1:3306)/proyecto1")
}

func main() {
	//rutas del servidor
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", indexRoute).Methods("GET")
	router.HandleFunc("/publicacion", publicacion).Methods("POST")
	router.HandleFunc("/finalizarCarga", finalizarCarga).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})
	handler := c.Handler(router)

	http.ListenAndServe(":3001", handler)
}
