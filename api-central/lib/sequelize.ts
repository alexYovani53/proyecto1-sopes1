import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize({
    username:   'sopes-1',
    password:   'DqDDyZl8PmK9n6Zj',
    host:       "sopes-1.database.windows.net",
    database:   'proyecto-1',
    port:       1433,
    storage:    ':memory:',
    models:     [__dirname + '/models'],
    dialect:    'mssql',
});

export const sequelizeGC = new Sequelize({
    username:   'root',
    password:   'DqDDyZl8PmK9n6Zj',
    host:       "35.193.66.235",
    database:   'proyecto1',
    port:       3306,
    storage:    ':memory:',
    models:     [__dirname + '/modelsGC'],
    dialect:    'mysql',
});
