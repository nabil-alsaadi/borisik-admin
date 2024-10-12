import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  GetParams,
  Publication,
  PublicationPaginator,
  PublicationQueryOptions,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { Config } from '@/config';
import { QUERY_CLIENT_OPTIONS } from '@/utils/constants';
import { PublicationClient } from './client/Publication';
import { applyPublicationTranslations } from '@/utils/format-ordered-product';

export const useCreatePublicationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation(PublicationClient.create, {
    onSuccess: async () => {
      const generateRedirectUrl = Routes.publications.list;
      await Router.push(generateRedirectUrl, undefined, {
        locale: router.locale ?? Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PUBLICATIONS);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message}`));
    },
  });
};

export const useDeletePublicationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(PublicationClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PUBLICATIONS);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message}`));
    },
  });
};

export const useUpdatePublicationMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(PublicationClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = Routes.publications.list;
      await router.push(
        `${generateRedirectUrl}/${data?.slug}/edit`,
        undefined,
        {
          locale: router.locale ?? Config.defaultLanguage,
        }
      );
      toast.success(t('common:successfully-updated'));
    },
    // onSuccess: () => {
    //   toast.success(t('common:successfully-updated'));
    // },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PUBLICATIONS);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message}`));
    },
  });
};

export const useUpdatePublicationMutationInList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(PublicationClient.update, {
    onSuccess: async () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PUBLICATIONS);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message}`));
    },
  });
};

export const usePublicationQuery = ({ slug, language }: GetParams) => {
    const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<Publication, Error>(
    [API_ENDPOINTS.PUBLICATIONS, { slug, language }],
    () => PublicationClient.get({ slug, language }),
    QUERY_CLIENT_OPTIONS
  );
  console.log('usePublicationQuery error',error,data)
  return {
    publication: data ? applyPublicationTranslations(data,locale) : data,
    error,
    loading: isLoading,
  };
};

export const usePublicationsQuery = (options: Partial<PublicationQueryOptions>) => {
    const { locale } = useRouter();
  const { data, error, isLoading } = useQuery<PublicationPaginator, Error>(
    [API_ENDPOINTS.PUBLICATIONS, options],
    ({ queryKey, pageParam }) =>
      PublicationClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...QUERY_CLIENT_OPTIONS
    }
  );
  const res = data?.data ?? []
  const pubs_translated = res.map((item) => applyPublicationTranslations(item,locale))
  return {
    publications: pubs_translated,
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};
