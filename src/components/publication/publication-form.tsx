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
import FileInput from '@/components/ui/file-input';
import { yupResolver } from '@hookform/resolvers/yup';

import ValidationError from '@/components/ui/form-validation-error';
import { getIcon } from '@/utils/get-icon';
import SelectInput from '@/components/ui/select-input';
import * as socialIcons from '@/components/icons/social';
import { AttachmentInput, ItemProps, Publication, ShopSocialInput } from '@/types';
import { useShopQuery } from '@/data/shop';
import { EditIcon } from '@/components/icons/edit';
import { Config } from '@/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { join, split } from 'lodash';

import { useSettingsQuery } from '@/data/settings';
import { useModalAction } from '@/components/ui/modal/modal.context';

import OpenAIButton from '@/components/openAI/openAI.button';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { socialIcon } from '@/settings/site.settings';
import { useCreatePublicationMutation, useUpdatePublicationMutation } from '@/data/publications';
import { publicationValidationSchema } from './publication-validationschema';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';

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
  slug: string;
  languages: string;
  image: AttachmentInput;
  translations?: {
    [key: string]: {
      title: string;
      description: string;
    };
  };
};

type IProps = {
  initialValues?: Publication | null;
};

export default function CreateOrUpdatePublicationForm({ initialValues }: IProps) {
  const router = useRouter();
  const locale = router?.locale ?? "en";
  const { t } = useTranslation();
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    router?.query?.action === 'edit' 
    // &&
    // router?.locale === Config.defaultLanguage;
//   const {
//     query: { shop },
//   } = router;
//   const { data: shopData } = useShopQuery(
//     {
//       slug: shop as string,
//     },
//     { enabled: !!router.query.shop },
//   );
//   const shopId = shopData?.id!;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(publicationValidationSchema),
    ...(initialValues && {
      defaultValues: {
        ...initialValues,
        translations: initialValues?.translations || {},
      } as any,
    }),
  });

//   const slugAutoSuggest = formatSlug(watch('title'));
  const [slugAutoSuggest, setSlugAutoSuggest] = useState('');
  const translatedTitle = watch(`translations.${locale}.title`);
  useEffect(() => {
    if (translatedTitle) {
      setSlugAutoSuggest(formatSlug(translatedTitle));
    }
  }, [translatedTitle]);

  const {
    // @ts-ignore
    settings: { options },
  } = useSettingsQuery({
    language: locale!,
  });


  const { mutate: createPublication, isLoading: creating } =
    useCreatePublicationMutation();
  const { mutate: updatePublication, isLoading: updating } =
    useUpdatePublicationMutation();

  
  const onSubmit = async (values: FormValues) => {
    const finalSlug = values.slug || slugAutoSuggest;
    const input = {
      ...values,
      language: router.locale,
      image: {
        thumbnail: values?.image?.thumbnail,
        original: values?.image?.original,
        id: values?.image?.id,
      },
      translations: {
        [locale]: {
          title: values.title,
          description: values.description,
        },
        ...values?.translations,
      },
      slug: finalSlug,
    };

    try {
      if (
        !initialValues
      ) {
        createPublication(input);
      } else {
        updatePublication({
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
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:publication-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:publication-form-description-details')}`}
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

          {isSlugEditable ? (
            <div className="relative mb-5">
              <Input
                label={t('form:input-label-slug')}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <button
                className="absolute top-[27px] right-px z-0 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                type="button"
                title={t('common:text-edit')}
                onClick={() => setIsSlugDisable(false)}
              >
                <EditIcon width={14} />
              </button>
            </div>
          ) : (
            <Input
              label={t('form:input-label-slug')}
              {...register('slug')}
              value={slugAutoSuggest}
              variant="outline"
              className="mb-5"
              disabled
            />
          )}

            <RichTextEditor
                title={t('form:input-label-description')}
                control={control}
                name={`translations.${locale ?? 'en'}.description`}  // Fallback to 'en'
                error={t(errors.translations?.[locale ?? 'en']?.description?.message)}
            />
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
              ? t('form:button-label-update-publication')
              : t('form:button-label-add-publication')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
