import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@ashnewar/helper-library';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection, createIndex } from '@auth/elasticsearch';
import { appRoutes } from '@auth/routes';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/queues/connections';

const SERVER_PORT=4002;
const log:Logger =winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'notificationServer','debug');

export let authMQConnect:Channel;
export const start=(app:Application): void => {
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app);
    startQueues();
    startElasticSearch();
    authErrorHandler(app);
    startServer(app);

};

const securityMiddleware=(app:Application):void=>{
    app.set('trust proxy',1);
    app.use(hpp());
    app.use(helmet());
    app.use(cors({
        origin:`${config.API_GATEWAY_URL}`,
        credentials:true,
        methods:['GET','POST','PUT','DELETE','OPTIONS'],
    }));

    app.use((req:Request,_res:Response ,next :NextFunction)=>{
        if(req.headers.authorization){
            const token:string = req.headers.authorization.split(' ')[1];
            const payload =verify(token,`${config.JWT_TOKEN}`) as IAuthPayload;
            req.currentUser=payload;
        }
        next();
    });
    
};

const standardMiddleware=(app:Application):void=>{
    app.use(compression());
    app.use(json({limit : '200mb'}));
    app.use(urlencoded({extended:true , limit:'200mb'}));
};

const routesMiddleware=(app:Application):void=>{
    appRoutes(app);
};

const startQueues=async():Promise<void>=>{
    authMQConnect=await createConnection() as Channel;


};

const startElasticSearch=():void=>{
    checkConnection();
    createIndex('gigs');
};

const authErrorHandler=(app:Application):void=>{
    app.use((error:IErrorResponse, _req:Request,res:Response,next:NextFunction)=>{
        log.log('error',`AuthServer ${error.comingFrom} `,error);
        if(error instanceof CustomError){
            res.status(error.statusCode).send({errors:error.serializeError()});
        }
        next();
    });

};

const startServer=(app:Application):void=>{
    try {
        const httpServer:http.Server = new http.Server(app);
        httpServer.listen(SERVER_PORT,()=>{
            log.info(`AuthServer Started at Port ${SERVER_PORT}`);
        });
    } catch (error) {
        log.log('error','AuthServer startServer() Error:',error);  
    }
};