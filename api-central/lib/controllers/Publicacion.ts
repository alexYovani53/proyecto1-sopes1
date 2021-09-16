import { Op } from 'sequelize';
import { sequelize } from "../sequelize";
import { logger } from '../logs';
import * as statics from '../statics';

// * * * Models * * *
import { Publicacion } from '../models/Publicacion';

export const crearTweet = async function (req, res) {
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
        
        await transaction.commit();
        return res.status(201).send({ error: false, result: result });
    } catch (error) {
        logger.error('Creación de publicacion con error: ' + error);
        await transaction.rollback();
        return res.status(500).send({ error: true, message: error.message });
    }
}
