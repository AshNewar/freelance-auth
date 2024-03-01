import { BadRequestError, IAuthDocument } from '@ashnewar/helper-library';
import { getAuthUserById, getAuthUserByVerifyToken, updateVerifyEmail } from '@auth/services/auth.service';
import  { Request, Response } from 'express';


export async function update(req:Request ,res:Response):Promise<void>{
    const {token } =req.body;
    const userExist :IAuthDocument = await getAuthUserByVerifyToken(token);
    if(!userExist){
        throw new BadRequestError('Invalid Token Or Expired' , 'Verify Email update() error');
    }
    await updateVerifyEmail(userExist.id!,1,'');
    const updatedUser:IAuthDocument = await getAuthUserById(userExist.id!);
    res.status(200).json({message:'Email Verified Successfully',user:updatedUser});
}