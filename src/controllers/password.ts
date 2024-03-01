import crypto from 'crypto';

import { BadRequestError, IAuthDocument } from '@ashnewar/helper-library';
import { changePasswordSchema, emailSchema, passwordSchema } from '@auth/scheme/password';
import { getAuthUserByPasswordToken, getUserByEmail, getUserByUserName, updatePassword, updatePasswordToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { config } from '@auth/config';
import { authPublishDirectMessage } from '@auth/queues/auth.producer';
import { authMQConnect } from '@auth/server';
import { authModel } from '@auth/models/auth.schema';


export async function createForgotPassword(req:Request, res:Response):Promise<void>{
    const {error } = await Promise.resolve(emailSchema.validate(req.body));
    if(error?.details){
        throw new BadRequestError(error.details[0].message , 'ForgotPassWord create() error');
    }
    const {email} = req.body;
    const user:IAuthDocument =await getUserByEmail(email);
    if(!user){
        throw new BadRequestError('User Not Found' , 'ForgotPassWord create() error');
    }
    const randomBytes :Buffer = await Promise.resolve(crypto.randomBytes(32));
    const randomString :string = randomBytes.toString('hex');
    const date:Date = new Date();
    date.setHours(date.getHours()+1);
    await updatePasswordToken(user.id!,randomString,date);
    const resetLink =`${config.CLIENT_URL}/reset_password?token=${randomString}`;
    const messageDetails = {
        receiverEmail:user.email,
        username:user.username,
        template:'forgotPassword',
        resetLink
    };
    // send message to queue
    await authPublishDirectMessage(
        authMQConnect,
        'freelance-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Forgot Password Email Sent To Notification Service'
    );
    res.status(200).json({message:'Password Reset Link Sent Successfully'});
}

export async function resetPassword(req:Request, res:Response):Promise<void>{
    const {error } = await Promise.resolve(passwordSchema.validate(req.body));
    if(error?.details){
        throw new BadRequestError(error.details[0].message , 'ResetPassWord resetPassword() error');
    }
    const {password ,confirmPassword} = req.body;
    const {token} = req.params;
    if(password !== confirmPassword){
        throw new BadRequestError('Passwords Not Matched' , 'ResetPassWord resetPassword() error');
    }
    const user:IAuthDocument =await getAuthUserByPasswordToken(token);
    if(!user){
        throw new BadRequestError('Invalid Token Or Expired' , 'ResetPassWord resetPassword() error');
    }
    const hashPassword =await authModel.prototype.hashPassword(password);
    await updatePassword(user.id!,hashPassword);
    const messageDetails = {
        receiverEmail:user.email,
        username:user.username,
        template:'resetPasswordSuccess',
    };
    // send message to queue
    await authPublishDirectMessage(
        authMQConnect,
        'freelance-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Reset Password Email Sent To Notification Service'
    );

    res.status(200).json({message:'Password Reset Successfully'});

}

export async function changePassword(req:Request, res:Response):Promise<void>{
    const {error } = await Promise.resolve(changePasswordSchema.validate(req.body));
    if(error?.details){
        throw new BadRequestError(error.details[0].message , 'ResetPassWord resetPassword() error');
    }
    const {oldPassword ,newPassword} = req.body;
    if(oldPassword === newPassword){
        throw new BadRequestError('Old Password And New Password Should Not Be Same' , 'ResetPassWord resetPassword() error');
    }
    const user:IAuthDocument =await getUserByUserName(`${req.currentUser?.username}`);
    if(!user){
        throw new BadRequestError('Invalid Token Or Expired' , 'ResetPassWord resetPassword() error');
    }
    const hashPassword =await authModel.prototype.hashPassword(newPassword);
    await updatePassword(user.id!,hashPassword);
    const messageDetails = {
        receiverEmail:user.email,
        username:user.username,
        template:'resetPasswordSuccess',
    };
    // send message to queue
    await authPublishDirectMessage(
        authMQConnect,
        'freelance-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Password Change Email Sent To Notification Service'
    );

    res.status(200).json({message:'Password Changed Successfully'});

}
    
