import crypto from 'crypto';

import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@ashnewar/helper-library';
import { getAuthUserById, getUserByEmail, updateVerifyEmail } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@auth/config';
import { authPublishDirectMessage } from '@auth/queues/auth.producer';
import { authMQConnect } from '@auth/server';


export async function read(req: Request, res: Response): Promise<void> {
    let user=null;
    const currentUser :IAuthDocument = await getAuthUserById(req.currentUser!.id);
    if(Object.keys(currentUser).length>0){
        user=currentUser;
    }
    res.status(StatusCodes.OK).json({message: 'User found', user: user });
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
   const {email ,userId} =req.body;
   const user :IAuthDocument = await getUserByEmail(email); //lowerCase(email)
   if(!user){
    throw new BadRequestError('Email is Invalid' , 'user resendEmail() error');
   }
   const randomBytes :Buffer = await Promise.resolve(crypto.randomBytes(32));
   const randomString :string = randomBytes.toString('hex');
   const verificationLink  = `${config.CLIENT_URL}/verify_email?token=${randomString}`;
   await updateVerifyEmail(parseInt(userId),0,randomString);
    const messageDetails : IEmailMessageDetails = {
        receiverEmail:email, //lowerCase(email)
        template:'verifyEmail',
        verifyLink: verificationLink
    };

    await authPublishDirectMessage(
        authMQConnect,
        'freelance-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Verify Email Send to Notification Service'
    );
    const updatedUser :IAuthDocument = await getAuthUserById(parseInt(userId));
    res.status(StatusCodes.OK).json({message:'Verification Email Sent',user:updatedUser});
}