import { ISellerGig, winstonLogger } from '@ashnewar/helper-library';
import {Client} from '@elastic/elasticsearch';
import { config } from '@auth/config';
import { Logger } from 'winston';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';

const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authServiceElasticSearchServer','debug');

export const elasticSearchClient = new Client({
    node: `${config.ELASTIC_SEARCH_URL}`
});

export async function checkConnection():Promise<void>{
    let isConnected = false;
    while (!isConnected) {
        try {
            const health: ClusterHealthResponse= await elasticSearchClient.cluster.health({});
            log.info(`AuthService Elasticsearch health status: ${health.status}`);
            isConnected = true;
        } catch (error) {
            log.error('Elasticsearch cluster is down!');
            log.log('error','AuthServer checkConnection() Error ',error);   
        }
    }
}

async function checkIndexExist(indexName:string):Promise<boolean>{
    const isExist:boolean = await elasticSearchClient.indices.exists({index:indexName});
    return isExist;
}

 export async function createIndex(indexName:string) :Promise<void> {
    try {
        const response:boolean = await checkIndexExist(indexName);
        if(response){
            log.info(`Index ${indexName} already exists in AuthService`);
            return;
        }
        await elasticSearchClient.indices.create({index:indexName});
        await elasticSearchClient.indices.refresh({index:indexName});
        log.info(`Index ${indexName} created in AuthService`);
        
    } catch (error) {
        log.error(`Error in creating index ${indexName} in AuthService`);
        log.info('error','AuthServer createIndex() Error ',error);
    }
}

export async function getDocumentById(indexName:string , gigId : string) :Promise<ISellerGig> {
    try {
        const response:GetResponse = await elasticSearchClient.get({
            index:indexName,
            id:gigId
        });
        return response._source as ISellerGig;
    } catch (error) {
        log.error(`Error in finding document with id ${gigId} in index ${indexName} in AuthService`);
        log.info('error','AuthServer getDocumentById() Error ',error);
        return {} as ISellerGig;
    }
}