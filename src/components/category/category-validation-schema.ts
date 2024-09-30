import * as yup from 'yup';

export const categoryValidationSchema = yup.object().shape({
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
  // type: yup.object().nullable().required('form:error-type-required'),
});
