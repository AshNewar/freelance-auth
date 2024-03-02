import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase, lowerCase } from '@ashnewar/helper-library';
import { config } from '@auth/config';
import { authModel } from '@auth/models/auth.schema';
import { authPublishDirectMessage } from '@auth/queues/auth.producer';
import { authMQConnect } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';


export const createAuthUser = async(data :IAuthDocument): Promise<IAuthDocument> =>{
    const result:Model = await authModel.create(data);
    const messageDetails:IAuthBuyerMessageDetails = {
        username:result.dataValues.username,
        email:result.dataValues.email,
        country:result.dataValues.country,
        profilePicture:result.dataValues.profilePicture,
        createdAt:result.dataValues.createdAt,
        type:'auth',
    };

    await authPublishDirectMessage(authMQConnect,'freelance-buyer-updates','user-buyer',JSON.stringify(messageDetails),'Buyer Details Send to BuyerService');
    const userData:IAuthDocument =omit(result.dataValues,['password']) as IAuthDocument;
    return userData;

};

export const getAuthUserById = async(id:number): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{id},attributes:{exclude:['password']}}) as Model;
    return user?.dataValues;

};

export const getUserByUserNameOrEmail = async(username:string , email :string): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{
        [Op.or]:[{username:firstLetterUppercase(username)},{email:lowerCase(email)}],
    },
    attributes:{
        exclude:['password']
    }}) as Model;
    return user?.dataValues;

};

export const getUserByUserName= async(username:string): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{username:firstLetterUppercase(username)},attributes:{exclude:['password']}}) as Model;
    return user?.dataValues;
};

export const getUserByEmail= async(email:string): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{email:lowerCase(email)},attributes:{exclude:['password']}}) as Model;
    return user?.dataValues;
};

export const getAuthUserByVerifyToken = async(emailVerificationToken:string): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{emailVerificationToken},attributes:{exclude:['password']}}) as Model;
    return user?.dataValues;
};

export const getAuthUserByPasswordToken = async(passwordResetToken:string): Promise<IAuthDocument> =>{
    const user:Model = await authModel.findOne({where:{
        [Op.and]:[{passwordResetToken},{passwordResetExpires:{[Op.gt]:Date.now()}}],
    },attributes:{exclude:['password']}}) as Model;
    return user?.dataValues;
};

///Updation 

export const updateVerifyEmail = async(id:number , emailVerified :number,emailVerificationToken:string): Promise<void> =>{
    await authModel.update({emailVerified,emailVerificationToken},{where:{id}});

};

export const updatePasswordToken = async(id:number , passwordResetToken :string,passwordResetExpires:Date): Promise<void> =>{
    await authModel.update({passwordResetToken,passwordResetExpires},{where:{id}});
};

export const updatePassword = async(id:number , password :string): Promise<void> =>{
    await authModel.update({
        password,
        passwordResetToken:'',
        passwordResetExpires:new Date(),
    },{where:{id}});

};

export const signToken = (id:number , username:string , email:string): string =>{
    const token:string =  sign({id,username,email},`${config.JWT_TOKEN}`,{expiresIn:'1d'});
    return token;
};