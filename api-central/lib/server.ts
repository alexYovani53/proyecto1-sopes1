import { createServer } from 'http';
import { app } from './app';
import { sequelize } from './sequelize';
import { sequelizeGC } from './sequelize';
import * as debug from 'debug';
import * as PublicacionesController from './controllers/Publicacion';
import * as PubSubController from './controllers/PubSub';
var cors = require('cors');
app.use(cors());

require('dotenv').config();

var port = normalizePort(process.env.PORT || '4153');
app.set('port', port);

var server = createServer(app);

export const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

sequelize.sync().then(function () {
    sequelizeGC.sync().then(function () {
        // TODO: Enviar notificaciones al recibir con PubSub
        io.on('connection', (socket) => { 
            console.log('a user connected');
            
            io.emit('status-conexion', { mensaje: 'Usuario conectado con exito' });

            socket.on('prueba',async ()=>{    
                io.emit('prueba', { mensaje: 'Exito' });
            });
        });

        server.listen(port, function () {
            debug('Express server listening on port  ' + port);
        });
        server.on('error', onError);
        server.on('listening', onListening);


        // Pub Sub
        PubSubController.quickstart();
        // PublicacionesController.scheduleVerPublicaciones();
    });
});

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + ( addr ? addr.port : '');
    debug('Listening on ' + bind);
}