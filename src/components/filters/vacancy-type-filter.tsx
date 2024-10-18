import Label from '@/components/ui/label';
import Select from '@/components/ui/select/select';
import { useVacanciesQuery } from '@/data/vacancy';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ActionMeta } from 'react-select';

type Props = {
  onVacancyFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  className?: string;
  type?: string;
};

export default function VacancyTypeFilter({
  onVacancyFilter,
  className,
  type
}: Props) {
  const { locale } = useRouter();
  const { t } = useTranslation();

  const { vacancies, loading: vacancyLoading } = useVacanciesQuery({
    limit: 999,
    language: locale,
    type,
  });


  return (
    <div
      className={cn(
        'flex w-full flex-col space-y-5 rtl:space-x-reverse md:flex-row md:items-end md:space-x-5 md:space-y-0',
        className,
      )}
    >
        <div className="w-full">
          <Label>{t('common:filter-by-vacancy')}</Label>
          <Select
            options={vacancies}
            getOptionLabel={(option: any) => option.title}
            getOptionValue={(option: any) => option.id}
            placeholder={t('common:filter-by-vacancy-placeholder')}
            isLoading={vacancyLoading}
            onChange={onVacancyFilter}
            isClearable={true}
          />
        </div>
    </div>
  );
}
