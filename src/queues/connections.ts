import { winstonLogger } from '@ashnewar/helper-library';
import { config } from '@auth/config';
import client , {Channel , Connection} from 'amqplib';
import { Logger } from 'winston';

const log:Logger= winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'AuthMQConnection','debug');

export async function createConnection(): Promise<Channel | undefined>{
    try {
        const connections:Connection = await client.connect(`${config.RABBITMQ_URL}`);
        const channel:Channel = await connections.createChannel();
        log.info('AuthService RabbitMQ connection created');
        closeConnections(channel,connections);
        return channel;
        
    } catch (error) {
        log.log('error','AuthService RabbitMQ connection error',error);
        return undefined;    
    }

}

export function closeConnections(channel:Channel , connection:Connection):void {
    process.once('SIGINT',async () => {
        await channel.close();
        await connection.close();
    });
}