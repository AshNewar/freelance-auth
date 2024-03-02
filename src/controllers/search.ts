import { IPaginateProps } from '@ashnewar/helper-library';
import { gigById, gigsSearch } from '@auth/services/search.service';
import { Request, Response } from 'express';
import { sortBy } from 'lodash';
import {StatusCodes} from 'http-status-codes';


export async function gigs(req:Request , res:Response):Promise<void>{
    const {from ,size ,type} = req.params;
    const paginate:IPaginateProps = {
        from,
        size:parseInt(size),
        type,
    };
    const {query ,delivery_time ,max ,min} = req.query;
    
    let resultHits: unknown[] =[];
    const gig = await gigsSearch(
        `${query}`,
        paginate,
        `${delivery_time}`,
        parseInt(`${max}`),
        parseInt(`${min}`)
    );

    for(const item of gig.hits){
        resultHits.push(item._source);
    }

    if(type == 'backward'){
        resultHits =sortBy(resultHits,['sortId']);
    }
    res.status(StatusCodes.OK).json({
        message:'Search Gigs Result',
        hits:resultHits,
        total:gig.total,
    });
}

export async function singleGigById(req:Request,res:Response):Promise<void>{
    const {gigId} = req.params;
    const gig = await gigById('gigs',gigId);
    res.status(StatusCodes.OK).json({message:'Search Result of Gig By Id',gig});
}