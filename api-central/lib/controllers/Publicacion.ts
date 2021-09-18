import { PublicacionGC } from './../modelsGC/PublicacionGC';
import { Op } from 'sequelize';
import { sequelize } from "../sequelize";
import { logger } from '../logs';
import * as statics from '../statics';
var schedule                = require('node-schedule');

// * * * Models * * *
import { Publicacion } from '../models/Publicacion';

export const scheduleVerPublicaciones = async function () {
    try {
        logger.info('Tarea programada para visualizar publicaciones');
        // Verifica que no exista una tarea ya preparada
        var oldJob = schedule.scheduledJobs['ver-publicaciones'];
        if(oldJob) {
            logger.info('Removiendo programada para visualizar publicaciones');
            oldJob.cancel();
        }

        // Schedule the new job
        // var time = utils.convertDate(date, 'date', 'HH:mm');
        // var parts = time.split(':');
        // [Segundos(0-59) Minutos(0-59) Horas(0-24) Dias(0-31) Mes(0-12) DiaSemana]
        var cronString = '*/5 * * * * *';
        var ref = this;
        var job = schedule.scheduleJob('ver-publicaciones', cronString, function () {
            ref.verPublicaciones();
        });
    }
    catch(error) {
        logger.error('Error scheduling ver publicaciones with error: ' + error);
    }
}

export const crearPublicacion = async function (req, res) {
    var transaction = await sequelize.transaction();
    try {

        var data = req.body;

        const result = await Publicacion.create({
            nombre: data.nombre,
            comentario: data.comentario,
            fecha: data.fecha,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
        }, { transaction: transaction });

        const resultGC = await PublicacionGC.create({
            nombre: data.nombre,
            comentario: data.comentario,
            fecha: data.fecha,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
        }, { transaction: transaction });
        
        await transaction.commit();
        return res.status(201).send({ error: false, result: { PublicacionAzure: result, PublicacionGC: resultGC } });
    } catch (error) {
        logger.error('Creación de publicacion con error: ' + error);
        await transaction.rollback();
        return res.status(500).send({ error: true, message: error.message });
    }
}

export const verPublicaciones = async function () {
    try {

        let publicacionesAzure = await Publicacion.findAll();
        let publicacionesGC = await PublicacionGC.findAll();

        console.log(`========================Inicio=========================`);

        console.log(`------------------ Publicaciones Azure ---------------------`);
        if(publicacionesAzure && publicacionesAzure.length > 0){
            for(let publicacion of publicacionesAzure){
                console.log(publicacion.id, publicacion.comentario, publicacion.fecha);
            }
        }

        console.log(`------------------ Publicaciones GC ---------------------`);
        if(publicacionesGC && publicacionesGC.length > 0){
            for(let publicacion of publicacionesGC){
                console.log(publicacion.id, publicacion.comentario, publicacion.fecha);
            }
        }

        console.log(`=======================Fin==========================`);

    } catch (error) {
        logger.error('Visualizacion de publicaciones con error: ' + error);
    }
}
