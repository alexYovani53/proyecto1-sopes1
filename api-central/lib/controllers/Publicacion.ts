import { Sequelize } from 'sequelize-typescript';
import { PublicacionHashtagGC } from './../modelsGC/PublicacionHashtagGC';
import { PublicacionHashtag } from './../models/PublicacionHashtag';
import { PublicacionGC } from './../modelsGC/PublicacionGC';
import { Op } from 'sequelize';
import { sequelize } from "../sequelize";
import { sequelizeGC } from "../sequelize";
import { logger } from '../logs';
import * as statics from '../statics';
var schedule                = require('node-schedule');

// * * * Models * * *
import { Publicacion } from '../models/Publicacion';
import { Hashtag } from '../models/Hashtag';
import { HashtagGC } from '../modelsGC/HashtagGC';

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

export const verPublicaciones = async function () {
    try {

        let publicacionesAzure = await Publicacion.findAll();
        let publicacionesGC = await PublicacionGC.findAll();

        console.log(`========================Inicio=========================`);

        console.log(`------------------ Publicaciones Azure ---------------------`);
        if(publicacionesAzure && publicacionesAzure.length > 0){
            for(let publicacion of publicacionesAzure){
                console.log(publicacion.id, publicacion.nombre, publicacion.comentario, publicacion.fecha);
            }
        }

        console.log(`------------------ Publicaciones GC ---------------------`);
        if(publicacionesGC && publicacionesGC.length > 0){
            for(let publicacion of publicacionesGC){
                console.log(publicacion.id, publicacion.nombre, publicacion.comentario, publicacion.fecha);
            }
        }

        console.log(`=======================Fin==========================`);

    } catch (error) {
        logger.error('Visualizacion de publicaciones con error: ' + error);
    }
}

export const crearPublicacion = async function (req, res) {
    var transaction = await sequelize.transaction();
    var transactionGC = await sequelizeGC.transaction();
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
        }, { transaction: transactionGC });
        
        await transaction.commit();
        await transactionGC.commit();
        return res.status(201).send({ error: false, result: { PublicacionAzure: result, PublicacionGC: resultGC } });
    } catch (error) {
        logger.error('Creación de publicacion con error: ' + error);
        await transaction.rollback();
        await transactionGC.rollback();
        return res.status(500).send({ error: true, message: error.message });
    }
}

export const obtenerPublicaciones = async function (req, res) {
    try {
        let data: any = req.body;
        let tipoDB = data.tipoDB;

        let publicaciones: Publicacion[] | PublicacionGC[] = [];
    
        if(tipoDB == 'azure'){
            publicaciones = await Publicacion.findAll({
                limit: data.limit,
                offset: data.offset,
                include: [
                    {
                        model: PublicacionHashtag,
                        include: [
                            { model: Hashtag }
                        ]
                    }
                ]
            });
        }

        if(tipoDB == 'google-cloud'){
            publicaciones = await PublicacionGC.findAll({
                limit: data.limit,
                offset: data.offset,
                include: [
                    {
                        model: PublicacionHashtagGC,
                        include: [
                            { model: HashtagGC }
                        ]
                    }
                ]
            });
        }
        
        return res.status(201).send({ error: false, result: publicaciones });
    } catch (error) {
        logger.error('Error al obtener publicaciones: ' + error);
        return res.status(500).send({ error: true, message: error.message });
    }
}

export const obtenerCantidadPublicaciones = async function (req, res) {
    try {
        let data: any = req.body;
        let tipoDB = data.tipoDB;

        let publicaciones: number = 0;
    
        if(tipoDB == 'azure'){
            publicaciones = await Publicacion.count();
        }

        if(tipoDB == 'google-cloud'){
            publicaciones = await PublicacionGC.count();
        }
        
        return res.status(201).send({ error: false, result: publicaciones });
    } catch (error) {
        logger.error('Error al obtener cantidad de publicaciones: ' + error);
        return res.status(500).send({ error: true, message: error.message });
    }
}

export const obtenerCantidadUpVotesDownVotes = async function (req, res) {
    try {
        let data: any = req.body;
        let tipoDB = data.tipoDB;

        let upvotes: number = 0;
        let downvotes: number = 0;
    
        if(tipoDB == 'azure'){
            upvotes = await Publicacion.sum('upvotes');
            downvotes = await Publicacion.sum('downvotes');
        }

        if(tipoDB == 'google-cloud'){
            upvotes = await PublicacionGC.sum('upvotes');
            downvotes = await PublicacionGC.sum('downvotes');
        }
        
        return res.status(201).send({ error: false, result: { upvotes, downvotes } });
    } catch (error) {
        logger.error('Error al obtener cantidad de upvotes y downvotes: ' + error);
        return res.status(500).send({ error: true, message: error.message });
    }
}

export const obtenerTopHashtags = async function (req, res) {
    try {
        let data: any = req.body;
        let tipoDB = data.tipoDB;

        let top: any[] = [];
        let total: number = 0;
    
        if(tipoDB == 'azure'){
            total = await Hashtag.count();
            top = await Hashtag.findAll({
                attributes: {
                    include: ['comentario', [
                        // Note the wrapping parentheses in the call below!
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM PublicacionesHashtags AS p
                            WHERE p.HashtagId = Hashtag.id
                        )`),
                        'cantidad'
                    ]]
                },
                limit: 5,
                order: [[Sequelize.literal('cantidad'), 'DESC' ]]
            });
        }

        if(tipoDB == 'google-cloud'){
            total = await HashtagGC.count();
            top = await HashtagGC.findAll({
                attributes: {
                    include: ['comentario', [
                        // Note the wrapping parentheses in the call below!
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM PublicacionesHashtags AS p
                            WHERE p.HashtagId = HashtagGC.id
                        )`),
                        'cantidad'
                    ]]
                },
                limit: 5,
                order: [[Sequelize.literal('cantidad'), 'DESC']]
            });
        }
        
        return res.status(201).send({ error: false, result: { top, total } });
    } catch (error) {
        logger.error('Error al obtener cantidad de upvotes y downvotes: ' + error);
        return res.status(500).send({ error: true, message: error.message });
    }
}
