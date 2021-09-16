import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize({
    username:   'sopes-1',
    password:   'DqDDyZl8PmK9n6Zj',
    host:       "sopes-1.database.windows.net",
    database:   'proyecto-1',
    port: 1433,
    storage:    ':memory:',
    models:     [__dirname + '/models'],
    dialect:    'mssql',
});
