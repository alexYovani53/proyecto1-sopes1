import { Router } from 'express';
import { PublicacionRoute } from './Publicacion';

export const routes = Router();
var version = '1.0.0';

// Endpoints intermedios
routes.use('/publicaciones', PublicacionRoute);

// Inicio de api
routes.get('/', function(req, res) {
    res.status(200).send({
        message: 'Sopes 1 API ' + version,
    });
});