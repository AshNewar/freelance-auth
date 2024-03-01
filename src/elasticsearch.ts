import { winstonLogger } from '@ashnewar/helper-library';
import {Client} from '@elastic/elasticsearch';
import { config } from '@auth/config';
import { Logger } from 'winston';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authServiceElasticSearchServer','debug');

const elasticSearchClient = new Client({
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