
import { token } from '@auth/controllers/refresh-token';
import { read, resendEmail } from '@auth/controllers/user';
import { Router } from 'express';


const router:Router = Router();

export const userRoutes = ():Router => {
    router.get('/currentuser',read);
    router.post('resend-email',resendEmail);
    router.get('/refresh-token/:username',token);

    return router;
};
