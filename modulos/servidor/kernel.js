
const fs = require('fs'); // Este modulo viene cargado directamente en nodejs, sirve para trabajar con archivos

// Configuraremos una variable de entorno unicamente en nuestro server de PRUEBAS (en mi caso, en mi computadora Windows)
// El server no tendra esta variable, por lo tanto SI leeremos el archivo proc
const isTesting = process.env.TESTING === "false";

// Aca es donde se lee el modulo kernel que cargamos!
const getRam = () => (fs.readFileSync('/proc/memoria_ram___201602912', 'utf8')).toString(); // Este metodo va a leer la carpeta /proc/timestamps y convierte sus datos a un string.
const getCpu = () => (fs.readFileSync('/proc/memoria_cpu____201602912', 'utf8')).toString(); // Este metodo va a leer la carpeta /proc/timestamps y convierte sus datos a un string.


// Este metodo sirve para devolver la informacion que hay en el modulo
// En caso la lectura no pueda ser efectuada, devolvemos un error!
// Esto es util ya que el server entocnces no se caera cada vez que requiramos la lectura y no tengamos bien el modulo
const obtenerRam = () => {

    // si estamos en nuestra computadora local, sin el modulo instalado, enviamos nuestra hora actual
    if (isTesting) {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    // Intentamos hacer la lectura del archivo /proc/timestamps
    try {
        // Si todo es correcto, lo devolveremos
        return JSON.parse(getRam());
    }
    // Deconstruimos el objeto error en el catch, y obtenemos unicamente su valor
    catch ({ message }) {
        // En dado caso haya un error, devolveremos el error.
        return `No se pudo leer el modulo. ${message}`;
    }
}

const obtenerCPU = () => {

    // si estamos en nuestra computadora local, sin el modulo instalado, enviamos nuestra hora actual
    if (isTesting) {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    // Intentamos hacer la lectura del archivo /proc/timestamps
    try {
        // Si todo es correcto, lo devolveremos
        return JSON.parse(getCpu());
    }
    // Deconstruimos el objeto error en el catch, y obtenemos unicamente su valor
    catch ({ message }) {
        // En dado caso haya un error, devolveremos el error.
        return `No se pudo leer el modulo. ${message}`;
    }
}


// Exportamos el metodo que queremos utilizar, en este caso le renombramos a getTimestamp

module.exports = { getCpu: obtenerCPU ,getRam: obtenerRam };