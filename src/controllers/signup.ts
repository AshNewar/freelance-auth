import crypto from 'crypto';

import { BadRequestError, IAuthDocument, IEmailMessageDetails, firstLetterUppercase, lowerCase, uploads } from '@ashnewar/helper-library';
import { signUpSchema } from '@auth/scheme/signup';
import { createAuthUser, getUserByUserNameOrEmail, signToken } from '@auth/services/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { config } from '@auth/config';
import { authPublishDirectMessage } from '@auth/queues/auth.producer';
import { authMQConnect } from '@auth/server';
import {StatusCodes} from 'http-status-codes';


export const create=async(req:Request,res:Response):Promise<void>=>{
    const {error} = await Promise.resolve(signUpSchema.validate(req.body));
    if(error?.details){
        throw new BadRequestError(error.details[0].message , 'SignUp create() error');
    }
    const {username,email,password,country,profilePicture} = req.body;
    const checkUserExist = await getUserByUserNameOrEmail(username,email);
    if(checkUserExist){
        throw new BadRequestError('User Already Exist' , 'SignUp create() error');
    }
    const profilePublicId = uuidV4();
    const uploadResult : UploadApiResponse = await uploads(profilePicture,`${profilePublicId}`,true,true) as UploadApiResponse;
    if(!uploadResult.public_id){
        throw new BadRequestError('Image Upload Failed' , 'SignUp create() error');
    }
    const randomBytes :Buffer = await Promise.resolve(crypto.randomBytes(32));
    const randomString :string = randomBytes.toString('hex');
    const authData :IAuthDocument ={
        username : firstLetterUppercase(username),
        email : lowerCase(email),
        profilePublicId,
        password,
        country,
        profilePicture : uploadResult?.secure_url,
        emailVerificationToken : randomString,
    } as IAuthDocument;

    const result:IAuthDocument = await createAuthUser(authData);
    const verificationLink  = `${config.CLIENT_URL}/verify_email?token=${randomString}`;
    const messageDetails : IEmailMessageDetails = {
        receiverEmail:result.email,
        template:'verifyEmail',
        verifyLink: verificationLink
    };

    await authPublishDirectMessage(
        authMQConnect,
        'freelance-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Verify Email'
    );
    const userToken = signToken(result.id! , result.username!, result.email!);

    res.status(StatusCodes.CREATED).json({message:'User Created Successfully',user:result,token:userToken});


};