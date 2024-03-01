import { winstonLogger } from '@ashnewar/helper-library';
import { Sequelize } from 'sequelize';
import { Logger } from 'winston';

import { config } from './config';


const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authDatabaseServer','debug');


export const sequelize:Sequelize = new Sequelize( config.MYSQL_DB! ,
    {
        dialect: 'mysql',
        logging:false,
        dialectOptions:{
            multipleStatements: true
        }
    }
);

export const databaseConnections=async():Promise<void>=>{
    try {
        await sequelize.authenticate();
        log.info('AuthDataBase Connection has been established successfully');
    } catch (error) {
        log.error('AuthDatabase Connection failed');
        log.log('error','AuthService databaseConnection() ',error);
        
    }
};