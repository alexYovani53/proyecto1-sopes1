import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import { routes } from './routes';

export const app = express();

app.set('views', path.join(__dirname, 'html'));
app.set('view engine', 'jade');

app.use(cors());

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

// Captura de error 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.message = 'Error 404';
    next(err);
});

// Handler para errores
app.use(function(err, req, res, next) {
    // Entorno de desarrollo
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});