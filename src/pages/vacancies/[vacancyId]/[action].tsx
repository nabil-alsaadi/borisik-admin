import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { Config } from '@/config';
import { useVacancyQuery } from '@/data/vacancy';
import CreateOrUpdateVacancyForm from '@/components/vacancy/vacancy-form';

export default function UpdateVacancyPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { vacancy, isLoading, error } = useVacancyQuery({
    id: query.vacancyId as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });
  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-update-publication')}
        </h1>
      </div>
      <CreateOrUpdateVacancyForm initialValues={vacancy} />
    </>
  );
}
UpdateVacancyPage.authenticate = {
  permissions: adminOnly,
};
UpdateVacancyPage.Layout = Layout;

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common'])),
  },
});
