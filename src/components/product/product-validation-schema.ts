import { ProductStatus, ProductType } from '@/types';
import * as yup from 'yup';
import { MAXIMUM_WORD_COUNT_FOR_RICH_TEXT_EDITOR } from '@/utils/constants';

// fetch
// yup conditionnally
const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

export const productValidationSchema = yup.object().shape({
  translations: yup.object().shape({
    en: yup.object().shape({
      name: yup.string(),
    }),
    ru: yup.object().shape({
      name: yup.string(),
    }),
  }).test('name-required', 'form:error-name-required', function (value) {
    // Ensure that either 'en' or 'ru' name is provided
    const hasEnName = value?.en?.name && value.en.name.trim() !== '';
    const hasRuName = value?.ru?.name && value.ru.name.trim() !== '';

    // Return true if either 'en' or 'ru' name is provided, otherwise return false
    if (hasEnName || hasRuName) {
      return true;
    }

    // If neither 'en' nor 'ru' name is provided, return false to trigger validation error
    return false;
  }),
  // name: yup.string().required('form:error-name-required'),
  // product_type: yup.object().required('form:error-product-type-required'),
  sku: yup.string().nullable().required('form:error-sku-required'),
  price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
  sale_price: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
    .positive('form:error-sale-price-must-positive')
    .nullable(),
  quantity: yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
  unit: yup.string().required('form:error-unit-required'),
  // type: yup.object().nullable().required('form:error-type-required'),
  status: yup.string().nullable().required('form:error-status-required'),
  variation_options: yup.array().of(
    yup.object().shape({
      price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
      sale_price: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
        .positive('form:error-sale-price-must-positive')
        .nullable(),
      quantity: yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
      sku: yup.string().required('form:error-sku-required'),
      is_digital: yup.boolean(),
      digital_file_input: yup.object().when('is_digital', {
        is: true,
        then: () =>
          yup
            .object()
            .shape({
              id: yup.string().required(),
            })
            .required('Degigtal File is required'),
        otherwise: () =>
          yup
            .object()
            .shape({
              id: yup.string().notRequired(),
              original: yup.string().notRequired(),
            })
            .notRequired()
            .nullable(),
      }),
    }),
  ),
  is_digital: yup.boolean(),
  digital_file_input: yup.object().when('is_digital', {
    is: true,
    then: () =>
      yup.object().shape({
        id: yup.string().required(),
      }),
    otherwise: () =>
      yup
        .object()
        .shape({
          id: yup.string().notRequired(),
          original: yup.string().notRequired(),
        })
        .notRequired()
        .nullable(),
  }),
  // video: yup.array().of(
  //   yup.object().shape({
  //     url: yup.string().required('Video URL is required'),
  //   }),
  // ),
  // description: yup
  //   .string()
  //   .max(
  //     MAXIMUM_WORD_COUNT_FOR_RICH_TEXT_EDITOR,
  //     'form:error-description-maximum-title',
  //   ),
  // image: yup
  //   .mixed()
  //   .nullable()
  //   .required('A file is required')
  //   .test(
  //     'FILE_SIZE',
  //     'Uploaded file is too big.',
  //     (value) => !value || (value && value.size <= 1024 * 1024)
  //   )
  //   .test(
  //     'FILE_FORMAT',
  //     'Uploaded file has unsupported format.',
  //     (value) =>
  //       !value || (value && SUPPORTED_IMAGE_FORMATS.includes(value?.type))
  //   ),
});
