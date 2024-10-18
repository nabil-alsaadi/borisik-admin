import {
    Category,
    CategoryPaginator,
    CategoryQueryOptions,
    CreateCategoryInput,
    CreateVacancyInput,
    QueryOptions,
    Vacancy,
  } from '@/types';
  import { API_ENDPOINTS } from './api-endpoints';
  import { crudFactory } from './curd-factory';
  import { HttpClient } from './http-client';
  
  export const vacancyClient = {
    ...crudFactory<Vacancy, QueryOptions, CreateVacancyInput>(
      API_ENDPOINTS.VACANCIES
    ),
    paginated: ({ type, name, self, ...params }: Partial<CategoryQueryOptions>) => {
      return HttpClient.get<Vacancy[]>(API_ENDPOINTS.VACANCIES, {
        searchJoin: 'and',
        self,
        ...params,
        search: HttpClient.formatSearchParams({ type, name }),
      });
    },
  };
  