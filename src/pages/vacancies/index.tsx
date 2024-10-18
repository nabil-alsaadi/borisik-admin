import { useRouter } from 'next/router';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { GetStaticProps } from 'next';
import AuthorList from '@/components/author/author-list';
import { useAuthorsQuery } from '@/data/author';
import { SortOrder } from '@/types';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';
import { usePublicationsQuery } from '@/data/publications';
import PublicationList from '@/components/publication/publication-list';
import { useVacanciesQuery } from '@/data/vacancy';
import VacancyList from '@/components/vacancy/vacancy-list';
export default function Vacancies() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { vacancies, loading, error } = useVacanciesQuery({
    limit: LIMIT,
    name: searchTerm,
    page,
    orderBy,
    sortedBy,
    language: locale,
  });
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;


  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:text-vacancies')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-1/2 justify-end">

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.vacancy.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span>+ {t('form:button-label-add-vacancy')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <VacancyList
        vacancies={vacancies}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}
Vacancies.authenticate = {
  permissions: adminOnly,
};
Vacancies.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
