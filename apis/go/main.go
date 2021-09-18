package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"context"

	_ "github.com/denisenkom/go-mssqldb"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Post struct {
	Guardados     int `json:guardados`
	TiempoDeCarga int `json:tiempoDeCarga`
}

type Publicacion struct {
	Nombre     string   `json:nombre`
	Comentario string   `json:comentario`
	Fecha      string   `json:fecha`
	Hashtags   []string `json:hashtags`
	Upvotes    int      `json:upvotes`
	Downvotes  int      `json:downvotes`
}

type Fin struct {
	Guardados     int    `json:guardados`
	Api           string `json:api`
	TiempoDeCarga int    `json:tiempoDeCarga`
	Bd            string `json:bd`
}

type PublicacionId struct {
	id int
}

type HashTagId struct {
	id int
}

type ListaHash struct {
	hashtags_id []int
}

type Salidas struct {
	Mensaje string `json:mensaje`
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

	var newCarga Fin
	newCarga.Api = "go"
	newCarga.Guardados = newCantidad.Guardados
	newCarga.TiempoDeCarga = newCantidad.TiempoDeCarga
	newCarga.Bd = "CosmosBD y CloudSQL"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(newCarga)
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

//----------- Operaciones base 1
func getDB() (*sql.DB, error) {
	var server = "sopes-1.database.windows.net"
	var port = 1433
	var user = "sopes-1"
	var password = "DqDDyZl8PmK9n6Zj"
	var database = "proyecto-1"
	var connString = fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;",
		server, user, password, port, database)
	return sql.Open("sqlserver", connString)

}

func ingresar_publicacion(newPub *Publicacion) PublicacionId {

	ctx := context.Background()

	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}

	tsql := `INSERT INTO Publicaciones(nombre,comentario,fecha, upvotes,downvotes) 
	VALUES(@Nombre, @Comentario, CONVERT(DATETIME,@Fecha,103), @Upvotes, @Downvotes);
	select @@IDENTITY as id;`

	stmt, err := db.Prepare(tsql)
	if err != nil {
		panic(err.Error())
	}

	defer stmt.Close()

	row := stmt.QueryRowContext(
		ctx,
		sql.Named("Nombre", newPub.Nombre),
		sql.Named("Comentario", newPub.Comentario),
		sql.Named("Fecha", newPub.Fecha),
		sql.Named("Upvotes", newPub.Upvotes),
		sql.Named("Downvotes", newPub.Downvotes))

	var datos PublicacionId
	err = row.Scan(&datos.id)
	if err != nil {
		panic(err.Error())
	}

	return datos
}

func ingresar_hashtags(newPub *Publicacion) ListaHash {
	ctx := context.Background()

	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}
	var lista_salida ListaHash

	for i := len(newPub.Hashtags) - 1; i >= 0; i-- {
		//Preparando la extraccion de al id
		tsql := `SELECT id from Hashtags where comentario=@Comentario;`

		result, err := db.QueryContext(
			ctx,
			tsql,
			sql.Named("Comentario", newPub.Hashtags[i]))
		if err != nil {
			panic(err.Error())
		}

		defer result.Close()
		var datos HashTagId
		//si existe lo obtengo
		if result.Next() {
			err := result.Scan(&datos.id)
			if err != nil {
				panic(err.Error())
			}
			lista_salida.hashtags_id = append(lista_salida.hashtags_id, datos.id)
			//Si no existe lo mando a traer
		} else {
			tsql = `INSERT INTO Hashtags (comentario) VALUES(@Comentario);
					SELECT @@IDENTITY as id;`

			stmt, err := db.Prepare(tsql)
			if err != nil {
				panic(err.Error())
			}

			defer stmt.Close()

			row := stmt.QueryRowContext(
				ctx,
				sql.Named("Comentario", newPub.Hashtags[i]))

			err = row.Scan(&datos.id)
			if err != nil {
				panic(err.Error())
			}
			lista_salida.hashtags_id = append(lista_salida.hashtags_id, datos.id)
		}

	}
	return lista_salida
}

//Revisar problema de fk
func ingresar_publicacion_hash(publicacionId PublicacionId, lista ListaHash) {
	ctx := context.Background()

	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}

	for i := len(lista.hashtags_id) - 1; i >= 0; i-- {
		tsql := `INSERT INTO PublicacionesHashtags(PublicacionId,HashtagId) VALUES(@Publicacion,@Hashtag);`
		fmt.Printf("%d", publicacionId.id)
		fmt.Printf("%d", lista.hashtags_id[i])
		_, err = db.ExecContext(ctx, tsql,
			sql.Named("Publicacion", publicacionId.id),
			sql.Named("Hashtag", lista.hashtags_id[i]))
		if err != nil {
			panic(err.Error())
		}
	}
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

	http.ListenAndServe(":3002", handler)
}
