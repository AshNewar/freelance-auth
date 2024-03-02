import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerGig } from '@ashnewar/helper-library';
import { elasticSearchClient, getDocumentById } from '@auth/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

export async function gigById (indexName: string ,gigId : string):Promise<ISellerGig> {
    const gig = await getDocumentById(indexName,gigId);
    return gig;
}

export async function gigsSearch(
    searchQuery: string,
    paginate : IPaginateProps,
    deliveryTime?: string,
    max?: number,
    min?: number,
) : Promise<ISearchResult> {

    const {from , size , type} = paginate;
    const queryList:IQueryList[] = [
        {
            query_string:{
                fields:['username','title','description','basicDescription','basicTitle','tags','categories','subCategories'],
                query:`*${searchQuery}`,
            },
        },
        {
            term:{
                active:true,
            },
        }

    ];
    if(deliveryTime){
        queryList.push({
            query_string:{
                fields:['expectedDelivery'],
                query:`*${deliveryTime}`,
            }
        });
    }

    if(!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))){
        queryList.push({
            range:{
                price:{
                    gte:min,
                    lte:max,
                },
            },
        });
    }

    const result:SearchResponse = await elasticSearchClient.search({
        index:'gigs',
        size,
        query:{
            bool:{
                must:[...queryList],
            },
        },
        sort:[
            {
                sortId:type ==='forward' ? 'asc' : 'desc',
            }
        ],
        ...(from != '0' && {search_after:[from]}), 
    });

    const total :IHitsTotal = result.hits.total as IHitsTotal;
    return {
        total:total.value,
        hits:result.hits.hits,
    };

}