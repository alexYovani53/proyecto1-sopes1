package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

// Estructura para guardar los datos del json
type Data struct {
	Nombre          string `json:"nombre"`
	Comentario      string `json:"comentario"`
	Fecha			string `json:"fecha"`
	Hashtags        []string    `json:"hashtags"`
	Upvotes		    int    `json:"upvotes"`
	Downvotes	    int    `json:"downvotes"`
}

type Carga struct {
	Guardados 	   int `json:"guardados"`
	TiempoDeCarga  int `json:"tiempoDeCarga"`
}

// Sincronizar los hilos
var wg sync.WaitGroup

// url : la ruta a la que deseamos enviar
var urlDireccion string

// Control
var exitosos int
var errores int

func main() {
	// path : ruta del archivo a leer
	var path string

	// threads : cantidad de hilos a utilizar para enviar
	// amount : cantidad de datos del archivo que queremos enviar
	var threads, amount int

	fmt.Printf("Ingresa la Direccion a dónde deseeas enviar los datos: ")
	fmt.Scanf("%s\n", &urlDireccion)
	fmt.Printf("Ingresa la cantidad de hilos que desea utilizar: ")
	fmt.Scanf("%d\n", &threads)
	fmt.Printf("Ingresa la cantidad de datos que desea enviar: ")
	fmt.Scanf("%d\n", &amount)
	// fmt.Printf("Ingresa la ruta del archivo: ")
	// fmt.Scanf("%s\n", &path)

	readFile(path, threads, amount, urlDireccion)
}

func readFile(path string, threads int, amount int, urlDireccion string) {

	// content : aquí guardaremos el contenido del archivo
	content, err := ioutil.ReadFile("entrada.json")

	// si existe algún error, entraremos en modo pánico, con defer podemos recuperarnos e imprimir dónde ocurrió el error
	defer func() {
		fmt.Println(recover())
	}()

	if err != nil {
		fmt.Println("Error al leer el archivo")
		panic(err)
	}

	// datos : arreglo de ls estructura persona, aquí se almacenarán todos los datos leídos del archivo
	var datos []Data

	// Convertimos cada objeto del archivo json a la estructura Data y la almacenamos en el arreglo
	err2 := json.Unmarshal(content, &datos)
	if err2 != nil {
		fmt.Println("Error al decodificar el json")
		panic(err2)
	}


	aux := len(datos)
	j := 0

	// Acá si el JSON solo tiene 10 estructuras y se necesita 100, hacemos un ciclo
	// para poder llena el arreglo desde la posicion 10 hasta la 9
	for i := len(datos); i < amount; i++ {
		datos = append(datos, datos[j])
		j++

		// Con el valor de j estamos repitiendo las 10 estrucutras que tiene el archivo, hasta
		// llegar a 100 estructuras o n 
		if j == aux {
			j = 0
		}
	}

	fmt.Println(datos)

	cant := amount / threads
	threadsNumber(datos, cant, threads, amount)
}

func threadsNumber(datos []Data, cant int, threads int, amount int) {

	start:= time.Now()

	if threads == 1 {
		wg.Add(1)
		go mostrar(datos, 0, amount)
		wg.Wait();
	} else{
		wg.Add(threads)
		for i := 0; i < threads; i++ {
			go mostrar(datos,cant*i,cant*(i+1))
		}
		wg.Wait()
	}

	// if threads == 1 {
	// 	mostrar(datos, 0, amount)
	// } else if threads == 2 {
	// 	wg.Add(2)
	// 	go mostrar(datos, 0, cant)
	// 	go mostrar(datos, cant, amount)
	// 	wg.Wait()
	// } else if threads == 3 {
	// 	wg.Add(3)
	// 	go mostrar(datos, 0, cant)
	// 	go mostrar(datos, cant, cant*2)
	// 	go mostrar(datos, cant*2, amount)
	// 	wg.Wait()
	// } else if threads == 4 {
	// 	wg.Add(4)
	// 	go mostrar(datos, 0, cant)
	// 	go mostrar(datos, cant, cant*2)
	// 	go mostrar(datos, cant*2, cant*3)
	// 	go mostrar(datos, cant*3, amount)
	// 	wg.Wait()
	// } else if threads == 5 {
	// 	wg.Add(5)
	// 	go mostrar(datos, 0, cant)
	// 	go mostrar(datos, cant, cant*2)
	// 	go mostrar(datos, cant*2, cant*3)
	// 	go mostrar(datos, cant*3, cant*4)
	// 	go mostrar(datos, cant*4, amount)
	// 	wg.Wait()
	// } 

	
	fmt.Println("segundos %f",time.Since(start)/1000)
	fmt.Println("exitosos %d",exitosos)
	fmt.Println("errores %d",errores)

	tiempoFinal := int(time.Since(start)/1000)

	DataFinalizacion := Carga{ Guardados: exitosos,TiempoDeCarga: tiempoFinal}
	e, _ := json.Marshal(DataFinalizacion)

	resp, err := http.Post(urlDireccion+"/finalizarCarga", "application/json", bytes.NewBuffer(e) )
	if err != nil {
		fmt.Printf("No se ha podido enviar la información: %s\n", err)
	}

	var res map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&res)
    fmt.Println(res)
}

func mostrar(datos []Data, init int, cant int) {



	for i := init; i < cant; i++ {

		// Convertimos a json el objeto en turno
		jsonData, _ := json.Marshal(datos[i])

		// Hacemos la insersión en la ruta que nos dio el usuario y le mandamos el objeto json
		_, err := http.Post(urlDireccion+"/publicacion", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("No se ha podido enviar la información: %s\n", err)
			errores += 1
		}
		fmt.Print("Dato enviado  " )
		fmt.Println(datos[i])
		exitosos++
		time.Sleep(time.Millisecond * 10)
	}
	defer wg.Done()

}
