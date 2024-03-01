import { IAuthDocument, IAuthPayload } from '@ashnewar/helper-library';
import { Response } from 'express';

export const authMockRequest =(sessionData:IJWT , body:IAuthMock , params?: unknown , currentUser?: IAuthPayload | null)=>({
    session: sessionData,
    body: body,
    params: params,
    currentUser: currentUser

});


export const authMockResponse = ():Response => {
    const res:Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

export interface IJWT{
    jwt ? : string;
}

export interface IAuthMock{
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    createdAt?: Date | string;
}

export const authUserPayloadMock : IAuthPayload = {
    id: 1,
    username: 'test',
    email: 'jnvspr1123@gmail.com',
    iat: 1623092497
};

export const authMock  = {
    id: 1,
    username: 'test',
    profilePublicId: 'test',
    email: 'jnvspr12345@gmail.com',
    password: 'password',
    country:'India',
    profilePicture : 'test',
    emailVerified: 1,
    createdAt: '2021-06-08T10:23:38.000Z',
    comparedPassword: ()=>false,
    hashPassword: ()=>'false',
} as unknown as IAuthDocument; //casting to IAuthDocument