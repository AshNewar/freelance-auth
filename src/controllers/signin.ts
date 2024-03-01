import { BadRequestError, IAuthDocument, isEmail } from '@ashnewar/helper-library';
import { authModel } from '@auth/models/auth.schema';
import { signInSchema } from '@auth/scheme/signin';
import { getUserByEmail, getUserByUserName, signToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { omit } from 'lodash';


export async function read(req:Request , res:Response):Promise<void>{
    const {error} = await Promise.resolve(signInSchema.validate(req.body));
    if(error?.details){
       throw new BadRequestError(error.details[0].message , 'SignIn read() error');
    }
    const {username,password} = req.body;
    const validEmail = isEmail(username);
    const existingUser:IAuthDocument = validEmail ? await getUserByEmail(username) : await getUserByUserName(username);
    if(!existingUser){
        throw new BadRequestError('Invalid Credential' , 'SignIn read() error');
    }
    const passwordMatched:boolean = await authModel.prototype.comparePassword(password,existingUser.password);
    if(!passwordMatched){
        throw new BadRequestError('Invalid Credential' , 'SignIn read() error');
    }
    const userToken:string =signToken(existingUser.id! , existingUser.username!, existingUser.email!);
    const userData:IAuthDocument =omit(existingUser , ['password']);
    res.status(200).json({message:'User Sign In Successfully',user:userData,token:userToken});

}