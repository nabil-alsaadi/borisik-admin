import {
    ApplicationPaginator,
    ApplicationQueryOptions,
    Category,
    CategoryPaginator,
    CategoryQueryOptions,
    CreateCategoryInput,
    CreateVacancyInput,
    QueryOptions,
    Vacancy,
    VacancyApplication,
  } from '@/types';
  import { API_ENDPOINTS } from './api-endpoints';
  import { crudFactory } from './curd-factory';
  import { HttpClient } from './http-client';
  
  export const vacancyApplicationClient = {
    ...crudFactory<VacancyApplication, QueryOptions, null>(
      API_ENDPOINTS.VACANCIES_APPLICATIONS
    ),
    paginated: ({ name,vacancy, self, ...params }: Partial<ApplicationQueryOptions>) => {
      return HttpClient.get<ApplicationPaginator>(API_ENDPOINTS.VACANCIES_APPLICATIONS, {
        searchJoin: 'and',
        self,
        ...params,
        search: HttpClient.formatSearchParams({name,vacancy}),
      });
    },
  };