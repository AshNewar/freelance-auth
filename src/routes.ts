import { verifyGatewayRequest } from '@ashnewar/helper-library';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth_routes';

import { userRoutes } from './routes/user_routes';
import { HealthRoute } from './routes/health';
import { searchRoutes } from './routes/search';
import { seedRoute } from './routes/seed';

const BASE_PATH = '/api/v1/auth';
export const appRoutes=(app:Application):void => {
    app.use('',HealthRoute());

    app.use(BASE_PATH, searchRoutes());
    app.use(BASE_PATH,seedRoute());
    
    app.use(BASE_PATH,verifyGatewayRequest,authRoutes());
    app.use(BASE_PATH,verifyGatewayRequest,userRoutes());
    
};