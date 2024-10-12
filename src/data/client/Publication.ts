import {
    Author,
    CreateAuthorInput,
    AuthorQueryOptions,
    AuthorPaginator,
    QueryOptions,
    Publication,
    CreatePublicationInput,
    PublicationPaginator,
    PublicationQueryOptions,
  } from '@/types';
  import { API_ENDPOINTS } from './api-endpoints';
  import { crudFactory } from './curd-factory';
  import { HttpClient } from './http-client';
  
  export const PublicationClient = {
    ...crudFactory<Publication, QueryOptions, CreatePublicationInput>(
      API_ENDPOINTS.PUBLICATIONS
    ),
    paginated: ({
      name,
      ...params
    }: Partial<PublicationQueryOptions>) => {
      return HttpClient.get<PublicationPaginator>(API_ENDPOINTS.PUBLICATIONS, {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({ name }),
      });
    },
  };
  