// Requerir DOTENV que carga la configuracion que tenemos en el archivo .env en el directorio principal
// Aca se pueden definir todas las variables de entorno
require('dotenv').config(); //npm i dotenv

// Modulos instalados 
const express = require('express'); // npm i express
const client = require('prom-client');
const kernels= require('./kernel'); // Modulo que controla los kernels, getTimestamp se utiliza para obtener la informacion que provee el modulo



const collectDefaultMetrics = client.collectDefaultMetrics;
// Probe every 5th second.
collectDefaultMetrics({ timeout: 5000 });


const counter = new client.Counter({
    name: 'procesador',
    help: 'The total number of processed requests'
  });
  
const histogram = new client.Histogram({
    name: 'node_request_duration_secons_data_false',
    help: 'Histogram for the duration in seconds.',
    buckets: [1, 2, 5, 6, 10,8]
});


const ramTotal = new client.Gauge({
    name: 'ramTotal',
    help: 'Ram total de la maquina virtual'
})


const ramLibre = new client.Gauge({
    name: 'ramLibre',
    help: 'Ram libre de la maquina virtual'
})


const ramAvailable = new client.Gauge({
    name: 'ramAvailable',
    help: 'Ram disponible de la maquina virtual'
})


const ramUsada = new client.Gauge({
    name: 'ramUsada',
    help: 'Ram usada de la maquina virtual'
})

const ramUsadaPorcentaje = new client.Gauge({
    name: 'ramUsadaPorcentaje',
    help: 'Ram usadaPorcenateje de la maquina virtual'
})

const cpuProcesos =  new client.Gauge({
    name: 'cpuProcesos',
    help: 'cpu procesos corriendo'
})

const cpuPorcentaje = new client.Gauge({
    name: 'cpuPorcentaje',
    help: 'Porcentaje de uso cp'
})

const app = new express(); // Crear una base de datos express

// Habilitamos los CORS
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});



const asignarValores = async ()=>{
    let ram = kernels.getRam();
    let cpu = kernels.getCpu();


    ramTotal.set( ram.data[0].Memo_total);
    ramAvailable.set(ram.data[0].Memo_available);
    ramLibre.set(ram.data[0].Memo_libre);
    ramUsada.set(ram.data[0].Memo_usada);
    ramUsadaPorcentaje.set(ram.data[0].Memo_usada_por);

    cpuPorcentaje.set(parseInt(cpu.CPU.replace("%","")));
    cpuProcesos.set(cpu.procesos);
}


app.get('/metrics', async (req, res) => {

    await asignarValores();

    res.setHeader('Content-Type', client.register.contentType);
    res.send( await client.register.metrics());
    
});


// Si existe un puerto en la configuracion, la cargamos; de lo contrario se inicia en el puerto 4000
const PORT = process.env.port || 8000;

// Iniciar la API en el puerto que definimos, mostrar en consola que ya esta funcionando.
app.listen(PORT, () => { console.log(`API lista en -> http://localhost:${PORT}`) });