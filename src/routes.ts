import { verifyGatewayRequest } from '@ashnewar/helper-library';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth_routes';

import { userRoutes } from './routes/user_routes';
import { HealthRoute } from './routes/health';

const BASE_PATH = '/api/v1/auth';
export const appRoutes=(app:Application):void => {
    app.use(BASE_PATH,verifyGatewayRequest,authRoutes());
    app.use(BASE_PATH,verifyGatewayRequest,userRoutes());
    app.use('',HealthRoute());
};