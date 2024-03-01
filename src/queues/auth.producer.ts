import { winstonLogger } from '@ashnewar/helper-library';
import { config } from '@auth/config';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@auth/queues/connections';


const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');

export const authPublishDirectMessage=async(channel:Channel , exchangeName:string , routingKey:string , message:string , logMessage :string):Promise<void>=>{
    try {
        if(!channel){
            channel = await createConnection() as Channel;
        }
        await channel.assertExchange(exchangeName,'direct',{durable:true});
        channel.publish(exchangeName,routingKey,Buffer.from(message));
        log.info(logMessage);
    } catch (error) {
        log.log('error', 'AuthService authPublishDirectMessage() Error', error);
    }
};