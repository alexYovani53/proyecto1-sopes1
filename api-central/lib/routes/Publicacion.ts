import { Router } from 'express';
import * as statics from '../statics';
import * as controller from '../controllers/Publicacion';
import * as verify from '../verify';

export const PublicacionRoute = Router();

// * * * Subir documentos * * * 
PublicacionRoute.post('/crear', verify.basicAuth(statics.writeCredentials[0], statics.writeCredentials[1]), function (req, res) {
    controller.crearTweet(req, res);
});
