// Requerir DOTENV que carga la configuracion que tenemos en el archivo .env en el directorio principal
// Aca se pueden definir todas las variables de entorno
require('dotenv').config(); //npm i dotenv

// Modulos instalados 
const express = require('express'); // npm i express
const axios = require('axios'); // npm i axios

// Modulos que escribimos nosotros
const kernels= require('./kernel'); // Modulo que controla los kernels, getTimestamp se utiliza para obtener la informacion que provee el modulo

// EMPEZAMOS LA API

const OTHER_API_URL = process.env.OTHER_API_URL; // Leer la URL de la api del archivo .env

console.log('Realizando peticiones a la API: ' + OTHER_API_URL);

const app = new express(); // Crear una base de datos express

// Habilitamos los CORS
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// IMPORTANTE! Le decimos a express que necesitamos trabajar con intercambio de datos JSON
app.use(express.json({ extended: true }))



// Con esta ruta traeremos todos los datos del server 2
// Luego devolveremos un HTML para mostrarlo todo en una lista
app.get('/', async (req, res) => { // es importante notar que este es un metodo async, ya que utilizamos await dentro de el
    console.log("Server1: Peticion de lista de timestamps");
    // Intentamos realizar el get al otro servidor
    try {

        let cpu =  kernels.getCpu();
        let ram= kernels.getRam();


        return res.status(200).send({
            cpu: cpu,
            ram : ram
        }); // Devolvemos el HTML para que sea renderizado por el navegador
    }
    catch (error) {
        console.log(`Server1: Error en la peticion, error: ${error.message}`);
        return res.status(500).send({ msg: error.message }); // Existio un error, devuelve el mensaje del error
    }
});



// Si existe un puerto en la configuracion, la cargamos; de lo contrario se inicia en el puerto 4000
const PORT = process.env.port || 3000;

// Iniciar la API en el puerto que definimos, mostrar en consola que ya esta funcionando.
app.listen(PORT, () => { console.log(`API lista en -> http://localhost:${PORT}`) });