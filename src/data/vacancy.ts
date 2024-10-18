import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  ApplicationPaginator,
  ApplicationQueryOptions,
  Category,
  CategoryPaginator,
  CategoryQueryOptions,
  GetParams,
  GetParamsId,
  Vacancy,
  VacancyApplication,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { categoryClient } from './client/category';
import { Config } from '@/config';
import { QUERY_CLIENT_OPTIONS } from '@/utils/constants';
import { vacancyClient } from './client/vacancy';
import Vacancies from '@/pages/vacancies';
import { applyVacancyTranslations } from '@/utils/format-ordered-product';
import { vacancyApplicationClient } from './client/vacancy-application';

export const useCreateVacancyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();
  return useMutation(vacancyClient.create, {
    onSuccess: () => {
      Router.push(Routes.vacancy.list, undefined, {
        locale: router.locale ?? Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onError: () => {
        toast.error((t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG')))
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VACANCIES);
    },
  });
};

export const useDeleteVacancyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(vacancyClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: () => {
        toast.error((t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG')))
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VACANCIES);
    },
  });
};

export const useUpdateVacancyMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(vacancyClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = Routes.vacancy.list;
      await router.push(
        `${generateRedirectUrl}/${data?.id}/edit`,
        undefined,
        {
          locale: router.locale ?? Config.defaultLanguage,
        }
      );
      toast.success(t('common:successfully-updated'));
    },
    onError: () => {
        console.log('error============')
        toast.error((t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG')))
    },
    // onSuccess: () => {
    //   toast.success(t('common:successfully-updated'));
    // },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.VACANCIES);
    },
  });
};

export const useVacancyQuery = ({ id, language }: GetParamsId) => {
  const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<Vacancy, Error>(
    [API_ENDPOINTS.VACANCIES, { id, language }],
    () => vacancyClient.getId({ id, language }),
    QUERY_CLIENT_OPTIONS
  );

  return {
    vacancy: data ? applyVacancyTranslations(data,locale) : data,
    error,
    isLoading,
  };
};

export const useVacanciesQuery = (options: Partial<CategoryQueryOptions>) => {
  const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<Vacancy[], Error>(
    [API_ENDPOINTS.VACANCIES, options],
    ({ queryKey, pageParam }) =>
      vacancyClient.all(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...QUERY_CLIENT_OPTIONS
    }
  );
  const res = data ?? []
  const pubs_translated = res.map((item) => applyVacancyTranslations(item,locale))
  return {
    vacancies: pubs_translated,
    // paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useVacanciesApplicationsQuery = (options: Partial<ApplicationQueryOptions>) => {
  const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<ApplicationPaginator, Error>(
    [API_ENDPOINTS.VACANCIES_APPLICATIONS, options],
    ({ queryKey, pageParam }) =>
      vacancyApplicationClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...QUERY_CLIENT_OPTIONS
    }
  );
  const res = data?.data ?? []
  
  const translated = res.map((item) => item.vacancy ? ({...item,vacancy: applyVacancyTranslations(item.vacancy,locale)}) : item)
  return {
    applications: translated,
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};
export const useVacancyApplicationQuery = ({ id, language }: GetParamsId) => {
  const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<VacancyApplication, Error>(
    [API_ENDPOINTS.VACANCIES_APPLICATIONS, { id, language }],
    () => vacancyApplicationClient.getId({ id, language }),
    QUERY_CLIENT_OPTIONS
  );

  return {
    application:  data && data.vacancy ? ({...data,vacancy: applyVacancyTranslations(data.vacancy,locale)}) : data,
    error,
    isLoading,
  };
};
