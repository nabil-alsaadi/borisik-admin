import { Order } from "@/types";

export function formatOrderedProduct(product: any) {
  return {
    product_id: product?.productId ? product.productId : product.id,
    ...(product?.variationId
      ? { variation_option_id: product.variationId }
      : {}),
    order_quantity: product.quantity,
    unit_price: product.price,
    subtotal: product.itemTotal,
  };
}

const defaultTranslateValue = ''
export function applyProductTranslations(product: any, language: string = "en"): any {
    const translations = product?.translations || {};

    // Try to get the translation for the provided language
    const translation = translations[language];

    // Validate if the translation exists for the specified language
    if (translation) {
        product.name = translation.name || translations['en']?.name || defaultTranslateValue;
        product.description = translation.description || translations['en']?.description || defaultTranslateValue;
    } else {
        // Fallback to English translation or default if English doesn't exist
        product.name = translations['en']?.name || defaultTranslateValue;
        product.description = translations['en']?.description || defaultTranslateValue;
    }

    return product;
}

export function applyOrderTranslations(order: Order, language: string = "en"): any {
  return {
    ...order,  // Spread the original order properties
    products: order.products.map((product) => 
      applyProductTranslations(product, language)
    ),  // Create a new products array with translated products
  };
}

export function applyPublicationTranslations(publication: any, language: string = "en"): any {
  const translations = publication?.translations || {};

  // Try to get the translation for the provided language
  const translation = translations[language];
  console.log('translation==========',publication,translation,translations,translations?.['en']?.title)
  // Validate if the translation exists for the specified language
  if (translation) {
      publication.title = translation.title || translations['en']?.title || defaultTranslateValue;
      publication.description = translation.description || translations['en']?.description || defaultTranslateValue;
  } else {
      // Fallback to English translation or default if English doesn't exist
      publication.title = translations?.['en']?.title || defaultTranslateValue;
      publication.description = translations?.['en']?.description || defaultTranslateValue;
  }

  return publication;
}

export function applyVacancyTranslations(vacancy: any, language: string = "en"): any {
  const translations = vacancy?.translations || {};

  // Try to get the translation for the provided language
  const translation = translations[language];
  console.log('translation==========',vacancy,translation,translations,translations?.['en']?.title)
  // Validate if the translation exists for the specified language
  if (translation) {
    vacancy.title = translation.title || translations['en']?.title || defaultTranslateValue;
    vacancy.description = translation.description || translations['en']?.description || defaultTranslateValue;
    vacancy.requirements = translation.requirements || translations['en']?.requirements || [];
  } else {
      // Fallback to English translation or default if English doesn't exist
      vacancy.title = translations?.['en']?.title || defaultTranslateValue;
      vacancy.description = translations?.['en']?.description || defaultTranslateValue;
      vacancy.requirements = translations?.['en']?.requirements || [];
  }

  return vacancy;
}