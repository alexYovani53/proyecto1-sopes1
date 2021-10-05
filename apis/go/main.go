package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	_ "github.com/denisenkom/go-mssqldb"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"

	// Leer variables de entorno
	"cloud.google.com/go/pubsub"
	"github.com/joho/godotenv"
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
	fmt.Fprintln(w, "API GO is ready CENTOS")
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

	msg, err := json.Marshal(newCarga)

	if err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}
	publish(string(msg))
	
	var salida Salidas
	salida.Mensaje = "Ok"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(salida)
}

func publicacion(w http.ResponseWriter, r *http.Request) {
	var newPublicacion Publicacion
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintln(w, "Error al recibir la publicacion")
	}

	json.Unmarshal(reqBody, &newPublicacion)

	//Primera base azure
	datos := ingresar_publicacion(&newPublicacion)
	lista := ingresar_hashtags(&newPublicacion)
	ingresar_publicacion_hash(datos, lista)

	//Segunda base google cloud
	datos_gcp := ingresar_publicacion_google(&newPublicacion)
	lista_gcp := ingresar_hashtags_google(&newPublicacion)
	ingresar_publicacion_hash_google(datos_gcp, lista_gcp)

	var salida Salidas
	salida.Mensaje = "Ok"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(salida)
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

func ingresar_publicacion_hash(publicacionId PublicacionId, lista ListaHash) {
	ctx := context.Background()

	db, err := getDB()
	if err != nil {
		panic(err.Error)
	}

	for i := len(lista.hashtags_id) - 1; i >= 0; i-- {
		tsql := `INSERT INTO PublicacionesHashtags(PublicacionId,HashtagId) VALUES(@Publicacion,@Hashtag);`
		//fmt.Printf("%d", publicacionId.id)
		//fmt.Printf("%d", lista.hashtags_id[i])
		_, err = db.ExecContext(ctx, tsql,
			sql.Named("Publicacion", publicacionId.id),
			sql.Named("Hashtag", lista.hashtags_id[i]))
		if err != nil {
			panic(err.Error())
		}
	}
}

// ============= ACA COMIENZA LA PARTE PARA INGRESAR GOOGLE CLOUD

func getDB2() (*sql.DB, error) {
	return sql.Open("mysql", "root:DqDDyZl8PmK9n6Zj@tcp(35.193.66.235:3306)/proyecto1")
}

func ingresar_publicacion_google(newPub *Publicacion) PublicacionId {

	db, err := getDB2()
	if err != nil {
		panic(err.Error)
	}

	stmt, err := db.Prepare("INSERT INTO Publicaciones(nombre,comentario,fecha, upvotes,downvotes) VALUES(?, ?, STR_TO_DATE(?, '%d/%m/%Y'), ?, ?)")
	if err != nil {
		panic(err.Error())
	}

	//obtenemos la base de datos
	_, err = stmt.Exec(newPub.Nombre, newPub.Comentario, newPub.Fecha, newPub.Upvotes, newPub.Downvotes)
	if err != nil {
		panic(err.Error())
	}

	//Preparando la extraccion de al id
	result, err := db.Query("SELECT LAST_INSERT_ID() as id from Publicaciones")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	var datos PublicacionId

	for result.Next() {

		err := result.Scan(&datos.id)
		if err != nil {
			panic(err.Error())
		}
		return datos
	}
	return datos
}

func ingresar_hashtags_google(newPub *Publicacion) ListaHash {
	db, err := getDB2()
	if err != nil {
		panic(err.Error)
	}
	var lista_salida ListaHash

	for i := len(newPub.Hashtags) - 1; i >= 0; i-- {
		//Preparando la extraccion de al id
		result, err := db.Query("SELECT id from Hashtags where comentario =?", newPub.Hashtags[i])
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
			stmt, err := db.Prepare("INSERT INTO Hashtags(comentario) VALUES(?)")
			if err != nil {
				panic(err.Error())
			}

			_, err = stmt.Exec(newPub.Hashtags[i])
			if err != nil {
				panic(err.Error())
			}
			result, err := db.Query("SELECT id from Hashtags where comentario =?", newPub.Hashtags[i])
			if err != nil {
				panic(err.Error())
			}
			defer result.Close()
			for result.Next() {
				err := result.Scan(&datos.id)
				if err != nil {
					panic(err.Error())
				}
				lista_salida.hashtags_id = append(lista_salida.hashtags_id, datos.id)
			}
		}

	}
	return lista_salida
}

func ingresar_publicacion_hash_google(publicacionId PublicacionId, lista ListaHash) {
	db, err := getDB2()
	if err != nil {
		panic(err.Error)
	}

	for i := len(lista.hashtags_id) - 1; i >= 0; i-- {
		stmt, err := db.Prepare("INSERT INTO PublicacionesHashtags(PublicacionId,HashtagId) VALUES(?,?)")
		if err != nil {
			panic(err.Error())
		}
		_, err = stmt.Exec(publicacionId.id, lista.hashtags_id[i])
		if err != nil {
			panic(err.Error())
		}
	}
}

func CargarCredenciales() {
	os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", "./clave.json")
}

func goDotEnvVariable(key string) string {

	// Leer el archivo .env ubicado en la carpeta actual
	err := godotenv.Load(".env")

	// Si existio error leyendo el archivo
	if err != nil {
		log.Fatalf("Error cargando las variables de entorno")
	}

	// Enviar la variable de entorno que se necesita leer
	return os.Getenv(key)
}

func publish(msg string) error {
	projectID := goDotEnvVariable("PROJECT_ID")
	topicID := goDotEnvVariable("TOPIC_ID")
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		fmt.Println("error")
		return fmt.Errorf("pubsub.NewClient: %v", err)
	}
	t := client.Topic(topicID)
	result := t.Publish(ctx, &pubsub.Message{Data: []byte(msg)})
	id, err := result.Get(ctx)
	if err != nil {
		fmt.Println("error")
		fmt.Println(err)
		return fmt.Errorf("Error: %v", err)
	}
	fmt.Println("Published a message; msg ID: %v\n", id)
	return nil
}

func main() {
	CargarCredenciales()
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
