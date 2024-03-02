import { createSeedData } from '@auth/controllers/seeds';
import express ,{ Router } from 'express';

const router:Router = express.Router();
export function seedRoute(){
    router.put('/seed/:count', createSeedData);

    return router;

}