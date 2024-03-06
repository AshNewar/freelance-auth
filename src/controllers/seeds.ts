import crypto from 'crypto';

import { BadRequestError, IAuthDocument, firstLetterUppercase } from '@ashnewar/helper-library';
import { createAuthUser, getUserByUserNameOrEmail } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { generateUsername } from 'unique-username-generator';
import { sample } from 'lodash';
import {StatusCodes} from 'http-status-codes';

export async function createSeedData(req:Request , res : Response) {
    const {count} = req.params;

    const username : string[] = [];
    for(let i=0;i<parseInt(count);i++){
        const user:string = generateUsername('',0,12);
        username.push(firstLetterUppercase(user));
    }
    for(let i=0;i<username.length;i++){
        const name=username[i];
        const email = faker.internet.email();
        const country = faker.location.country();
        const profilePicture = faker.image.avatar();
        const password = '12345678';
        const userExist= await getUserByUserNameOrEmail(name,email);
        if(userExist){
            throw new BadRequestError('User Already Exist','Seed Data Error');
        }
        const profilePublicId = uuidV4();
        const randomBytes : Buffer = await Promise.resolve(crypto.randomBytes(32));
        const randomString : string = randomBytes.toString('hex');
        const authData : IAuthDocument = {
            username:name,
            email,
            profilePublicId,
            password,
            country,
            profilePicture,
            emailVerificationToken:randomString,
            emailVerified:sample([0,1])
        } as IAuthDocument;
        await createAuthUser(authData);


    }

    res.status(StatusCodes.OK).json({message:`${count} Seed Users Created Successfully`});

}