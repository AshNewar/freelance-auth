
import * as auth from '@auth/services/auth.service';
import * as helper from '@ashnewar/helper-library';
import { Request, Response } from 'express';

import { read, resendEmail } from '../user';

import { authMock, authMockRequest, authMockResponse, authUserPayloadMock } from './mocks/auth.mock';

jest.mock('@auth/services/auth.service');
jest.mock('@ashnewar/helper-library');
jest.mock('@auth/queues/auth.producer');
jest.mock('@elastic/elasticsearch');

const USERNAME= 'test';
const PASSWORD = 'password';
  
describe('CurrentUser', () =>{
    beforeEach(()=>{
        jest.resetAllMocks();
    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('read User function', ()=>{
        it('should return Authenticated User', async ()=>{
            const req :Request = authMockRequest({},{username:USERNAME,password:PASSWORD},null ,authUserPayloadMock) as unknown as Request;
            const res :Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue(authMock);
            await read(req,res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message:'User found',user:authMock});
        
        });
        it('should return Empty User', async ()=>{
            const req :Request = authMockRequest({},{username:USERNAME,password:PASSWORD},null ,authUserPayloadMock) as unknown as Request;
            const res :Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue({} as never);
            await read(req,res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message:'User found',user:null});
        
        });
    });

    describe('Send Email User function', ()=>{
        it('should return Bad Request for Invalid Email', async ()=>{
            const req :Request = authMockRequest({},{username:USERNAME,password:PASSWORD},null ,authUserPayloadMock) as unknown as Request;
            const res :Response = authMockResponse();
            jest.spyOn(auth,'getUserByEmail').mockResolvedValue({} as never);
            resendEmail(req,res).catch(()=>{
                expect(helper.BadRequestError).toHaveBeenCalledWith('Email is Invalid' , 'user resendEmail() error');
            });
        });

        it('should return Authenticated User', async ()=>{
            const req :Request = authMockRequest({},{username:USERNAME,password:PASSWORD},null ,authUserPayloadMock) as unknown as Request;
            const res :Response = authMockResponse();
            jest.spyOn(auth,'getUserByEmail').mockResolvedValue(authMock);
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue(authMock);
            await resendEmail(req,res);
            expect(auth.updateVerifyEmail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message:'Verification Email Sent',user:authMock});
        });
        
    });
});