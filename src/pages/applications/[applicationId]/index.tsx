import Card from '@/components/common/card';
import { DownloadIcon } from '@/components/icons/download-icon';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useIsRTL } from '@/utils/locals';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useVacancyApplicationQuery } from '@/data/vacancy';

export default function ApplicationDetailsPage() {
  const { t } = useTranslation();
  const { query, locale } = useRouter();
  const { alignLeft, alignRight, isRTL } = useIsRTL();

  const {
    application,
    isLoading: loading,
    error,
  } = useVacancyApplicationQuery({ id: query.applicationId as string, language: locale! });


  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  async function handleDownloadResume() {
    const data = application?.resume.original
    console.log(data,application?.resume)
    if (data) {
      const a = document.createElement('a');
      a.href = data;
      a.setAttribute('download', 'resume');
      a.click();
    }
  }


  return (
    <>
    <Card className="relative overflow-hidden p-8 shadow-lg rounded-lg bg-white">
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleDownloadResume} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md flex items-center"
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          {t('common:text-download')} {t('common:text-resume')}
        </Button>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">{t('common:text-applicant-details')}</h3>
          <p><strong>{t('common:text-name')}:</strong> {application?.name}</p>
          <p><strong>{t('common:text-email')}:</strong> {application?.email}</p>
          <p><strong>{t('common:text-phone')}:</strong> {application?.phone}</p>
          <p><strong>{t('common:text-citizenship')}:</strong> {application?.citizenship}</p>
          <p><strong>{t('common:text-marital-status')}:</strong> {application?.maritalStatus}</p>
          <p><strong>{t('common:text-education')}:</strong> {application?.education}</p>
          <p><strong>{t('common:text-employment-record-book')}:</strong> {application?.employmentRecordBook}</p>
          <p><strong>{t('common:text-medical-book')}:</strong> {application?.medicalBook}</p>
          <p><strong>{t('common:text-smoking')}:</strong> {application?.smoking}</p>
          <p><strong>{t('common:text-alcohol-consumption')}:</strong> {application?.alcoholConsumption}</p>
          <p><strong>{t('common:text-emergency-phone')}:</strong> {application?.emergencyPhone}</p>
        </div>
  
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">{t('common:text-vacancy-details')}</h3>
          <p><strong>{t('common:text-vacancy-title')}:</strong> {application?.vacancy?.title}</p>
          <p><strong>{t('common:text-vacancy-location')}:</strong> {application?.vacancy?.location}</p>
        </div>
      </div>
  
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">{t('common:text-cover-letter')}</h3>
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="whitespace-pre-wrap">{application?.coverLetter}</p>
        </div>
      </div>
  
      <div className="mt-6 text-right text-sm text-gray-500">
        <p>{t('common:text-date')}: {new Date(application?.created_at ?? Date()).toLocaleDateString()}</p>
      </div>
    </Card>
  </>
  
  );
}
ApplicationDetailsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
