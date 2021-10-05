import { logger } from './logs';
import * as statics from './statics';
import * as basicAuthLib from 'basic-auth';

export const basicAuth = function (username, password) {
    return function (req, res, next) {
        logger.info('<===========================================>');
        if(req) logger.info(req.originalUrl);
        
        var user = basicAuthLib(req);

        if (!user || user.name !== username || user.pass !== password) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }

        next();
    };
};