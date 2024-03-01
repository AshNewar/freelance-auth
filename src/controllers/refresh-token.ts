import { IAuthDocument } from '@ashnewar/helper-library';
import { getUserByUserName, signToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import {StatusCodes} from 'http-status-codes';


export async function token(req:Request , res :Response):Promise<void>{
    const {username} =req.params;
    const user:IAuthDocument = await getUserByUserName(username);
    const userJWT = signToken(user.id! , user.email! , user.username!);
    res.status(StatusCodes.OK).json({message:'Refresh-Token',token:userJWT, user:user});
}