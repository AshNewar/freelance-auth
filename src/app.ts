import express ,{ Application } from 'express';
import { start } from '@auth/server';
import { databaseConnections } from '@auth/database';
import { config } from '@auth/config';


const initializeApp =():void  => {
    config.cloudinaryConfig();
    const app:Application = express();
    databaseConnections();
    start(app);

}; 

 initializeApp();