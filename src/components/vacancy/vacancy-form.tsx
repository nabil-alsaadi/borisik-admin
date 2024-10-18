import Input from '@/components/ui/input';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import DatePicker from '@/components/ui/date-picker';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { getIcon } from '@/utils/get-icon';
import * as socialIcons from '@/components/icons/social';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { socialIcon } from '@/settings/site.settings';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';
import { useCreateVacancyMutation, useUpdateVacancyMutation } from '@/data/vacancy';
import { vacancyValidationSchema } from './vacancy-validationschema';
import { Vacancy } from '@/types';
import { useEffect } from 'react';

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex items-center justify-center w-4 h-4">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type FormValues = {
    title: string;
    description: string;
    requirements: string[];
    location: string;
    translations: {
        [key: string]: {
            title: string;
            description?: string;
            requirements: string[];
        };
    }
};

type IProps = {
  initialValues?: Vacancy | null;
};

export default function CreateOrUpdateVacancyForm({ initialValues }: IProps) {
  const router = useRouter();
  const locale = router?.locale ?? "en";
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(vacancyValidationSchema),
    ...(initialValues && {
      defaultValues: {
        ...initialValues,
        translations: initialValues?.translations || {
            [locale]: { requirements: [] }
        },
      } as any,
    }),
  });


  const { mutate: createVacancy, isLoading: creating } =
    useCreateVacancyMutation();
  const { mutate: updateVacacny, isLoading: updating } =
    useUpdateVacancyMutation();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `translations.${locale}.requirements`,
    });
    // const watchLocale = watch(`translations.${locale}`);

    // useEffect(() => {
    //   if (initialValues?.translations && initialValues?.translations[locale]) {
    //     reset({
    //       ...initialValues,
    //       translations: {
    //         ...initialValues.translations,
    //         [locale]: initialValues.translations[locale],
    //       },
    //     });
    //   }
    // }, [locale, initialValues, reset]);
  const onSubmit = async (values: FormValues) => {
    const input = {
      ...values,
      language: router.locale,
      translations: {
        [locale]: {
          title: values.title,
          description: values.description,
          requirements: values.requirements
        },
        ...values?.translations,
      },
    };

    try {
      if (
        !initialValues
      ) {
        createVacancy(input);
      } else {
        updateVacacny({
          ...input,
          id: initialValues.id!,
        //   shop_id: shopId,
        });
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:vacancy-form-description-details')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-title')}
            // {...register('title')}
            {...register(`translations.${locale}.title`)}
            // error={t(errors.title?.message!)}
            error={t(errors.translations?.root?.message)}
            variant="outline"
            className="mb-5"
          />

            {/* <RichTextEditor
                title={t('form:input-label-description')}
                control={control}
                name={`translations.${locale ?? 'en'}.description`}  // Fallback to 'en'
                error={t(errors.translations?.[locale ?? 'en']?.description?.message)}
            /> */}
            <TextArea
              label={t('form:input-label-description')}
              {...register(`translations.${locale ?? 'en'}.description`)}
              error={t(errors.description)}
              variant="outline"
              className="col-span-2"
            />

            <Input
            label={t('form:input-label-location')}
            // {...register('title')}
            {...register(`location`)}
            // error={t(errors.title?.message!)}
            error={t(errors.location)}
            variant="outline"
            className="mb-5"
          />

            <div className="w-full space-y-6">
            {/* Requirements section */}
            
            <div className="space-b-4">
                <Label>{t('form:input-label-requirements')}</Label>
                {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                    <Input
                        {...register(`translations.${locale}.requirements.${index}` as const)}
                        placeholder={t('form:placeholder-requirement', { number: index + 1 })}
                        variant="outline"
                        className="w-full"
                    />
                    </div>
                    <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 transition-all"
                        title={t('form:button-label-remove')}
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                </div>
                ))}
            </div>
            {/* Add requirement button */}
            <div className="flex justify-start">
                <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => append('')}
                >
                {t('form:button-label-add-requirement')}
                </Button>
            </div>
            </div>


        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="text-sm me-4 md:text-base"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update-vacancy')
              : t('form:button-label-add-vacancy')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
