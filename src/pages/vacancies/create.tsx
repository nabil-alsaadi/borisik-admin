import Layout from '@/components/layouts/admin';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import CreateOrUpdateVacancyForm from '@/components/vacancy/vacancy-form';

export default function CreateVacancyPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-vacancy')}
        </h1>
      </div>
      <CreateOrUpdateVacancyForm />
    </>
  );
}
CreateVacancyPage.authenticate = {
  permissions: adminOnly,
};
CreateVacancyPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common'])),
  },
});
