import { readCredentials } from './../statics';
import { Router } from 'express';
import * as statics from '../statics';
import * as controller from '../controllers/Publicacion';
import * as verify from '../verify';

export const PublicacionRoute = Router();

PublicacionRoute.post('/crear', verify.basicAuth(statics.writeCredentials[0], statics.writeCredentials[1]), function (req, res) {
    controller.crearPublicacion(req, res);
});

PublicacionRoute.post('/obtener', verify.basicAuth(statics.readCredentials[0], statics.readCredentials[1]), function (req, res) {
    controller.obtenerPublicaciones(req, res);
});

PublicacionRoute.post('/cantidad', verify.basicAuth(statics.readCredentials[0], statics.readCredentials[1]), function (req, res) {
    controller.obtenerCantidadPublicaciones(req, res);
});

PublicacionRoute.post('/votos', verify.basicAuth(statics.readCredentials[0], statics.readCredentials[1]), function (req, res) {
    controller.obtenerCantidadUpVotesDownVotes(req, res);
});

PublicacionRoute.post('/top', verify.basicAuth(statics.readCredentials[0], statics.readCredentials[1]), function (req, res) {
    controller.obtenerTopHashtags(req, res);
});