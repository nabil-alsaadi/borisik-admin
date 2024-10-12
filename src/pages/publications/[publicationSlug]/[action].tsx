import Layout from '@/components/layouts/admin';
import AuthorCreateOrUpdateForm from '@/components/author/author-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { useAuthorQuery } from '@/data/author';
import { Config } from '@/config';
import { usePublicationQuery } from '@/data/publications';
import CreateOrUpdatePublicationForm from '@/components/publication/publication-form';

export default function UpdatePublicationPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { publication, loading, error } = usePublicationQuery({
    slug: query.publicationSlug as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-update-publication')}
        </h1>
      </div>
      <CreateOrUpdatePublicationForm initialValues={publication} />
    </>
  );
}
UpdatePublicationPage.authenticate = {
  permissions: adminOnly,
};
UpdatePublicationPage.Layout = Layout;

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common'])),
  },
});
