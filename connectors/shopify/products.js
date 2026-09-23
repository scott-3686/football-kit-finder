const {
  getKitType,
  getProductCategory,
  getAgeRange,
  getVariantAgeRange,
  getAgeGroup
} = require('../../utils/classifier');

const {
  isExcludedProduct
} = require('../../utils/product');


function sleep(ms) {
  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );
}


async function fetchPage(
  source,
  page
) {
  let response;

  const url =
    `${
      source.url.replace(
        /\/$/,
        ''
      )
    }/products.json?limit=250&page=${page}`;


  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {
    response =
      await fetch(url);


    if (response.ok) {
      break;
    }


    if (
      response.status === 429
    ) {
      console.log(
        `Rate limited. Waiting before retry ${attempt}/3...`
      );

      await sleep(
        attempt * 3000
      );

      continue;
    }


    throw new Error(
      `Shopify request failed (${response.status})`
    );
  }


  if (!response.ok) {
    throw new Error(
      `Shopify request failed (${response.status}) after retries`
    );
  }


  return response.json();
}


async function fetchAllProducts(
  source
) {
  const products = [];

  let page = 1;


  while (true) {
    const data =
      await fetchPage(
        source,
        page
      );


    const batch =
      data.products || [];


    products.push(
      ...batch
    );


    if (
      batch.length < 250
    ) {
      break;
    }


    page++;
  }


  return products;
}


function numberOrNull(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }


  const number =
    Number(value);


  return Number.isNaN(number)
    ? null
    : number;
}


function isRelevantKitProduct(
  product
) {
  if (
    isExcludedProduct(
      product
    )
  ) {
    return false;
  }


  const title =
    String(
      product.title || ''
    );


  const text =
    title.toLowerCase();


  const excludedTerms = [
    'cushion',
    'shirt print',
    'shirt printing',
    'custom print',
    'personalisation',
    'personalization',
    'name set',
    'number set',
    't-shirt',
    't shirt',
    'tee shirt',
    'training',
    'polo',
    'hoodie',
    'jacket',
    'coat',
    'tracksuit',
    'quarter zip',
    '1/4 zip',
    'aloha'
  ];


  if (
    excludedTerms.some(
      term =>
        text.includes(term)
    )
  ) {
    return false;
  }


  const kitType =
    getKitType(title);


  if (!kitType) {
    return false;
  }


  const productCategory =
    getProductCategory(
      title
    );


  const relevantCategories = [
    'shirt',
    'full kit',
    'shorts',
    'socks'
  ];


  if (
    !relevantCategories.includes(
      productCategory
    )
  ) {
    return false;
  }


  const ageGroup =
    getAgeGroup(
      title,
      product.variants || []
    );


  if (
    ageGroup === 'adult'
  ) {
    return false;
  }


  return true;
}


function getSizeOptionPosition(
  product
) {
  const sizeOption =
    (
      product.options ||
      []
    ).find(option =>
      String(
        option.name || ''
      )
        .trim()
        .toLowerCase() ===
      'size'
    );


  return (
    sizeOption?.position ||
    null
  );
}


function getVariantSize(
  variant,
  sizePosition
) {
  if (sizePosition) {
    const value =
      variant[
        `option${sizePosition}`
      ];


    if (
      value &&
      value !== 'No Colour' &&
      value !== 'Default Title'
    ) {
      return String(
        value
      ).trim();
    }
  }


  const parts =
    String(
      variant.title || ''
    )
      .split('/')
      .map(part =>
        part.trim()
      )
      .filter(Boolean)
      .filter(part =>
        part.toLowerCase() !==
          'no colour'
      )
      .filter(part =>
        part.toLowerCase() !==
          'default title'
      );


  return (
    parts.at(-1) ||
    null
  );
}


function mapVariants(product) {
  const sizePosition =
    getSizeOptionPosition(
      product
    );


  return (
    product.variants ||
    []
  ).map(variant => {
    const price =
      numberOrNull(
        variant.price
      );


    const regularPrice =
      numberOrNull(
        variant.compare_at_price
      ) ??
      price;


    const onSale =
      (
        price !== null &&
        regularPrice !== null &&
        price <
          regularPrice
      );


    return {
      id:
        variant.id,

      size:
        getVariantSize(
          variant,
          sizePosition
        ),

      price,

      regular_price:
        regularPrice,

      sale_price:
        onSale
          ? price
          : null,

      on_sale:
        onSale,

      available:
        Boolean(
          variant.available
        ),

      age_range:
        null
    };
  });
}


function getProductPricing(
  variants
) {
  const availableVariants =
    variants.filter(
      variant =>
        variant.available
    );


  const candidates =
    availableVariants.length
      ? availableVariants
      : variants;


  const prices =
    candidates
      .map(
        variant =>
          variant.price
      )
      .filter(price =>
        Number.isFinite(
          price
        )
      );


  const regularPrices =
    candidates
      .map(
        variant =>
          variant.regular_price
      )
      .filter(price =>
        Number.isFinite(
          price
        )
      );


  const salePrices =
    candidates
      .filter(
        variant =>
          variant.on_sale
      )
      .map(
        variant =>
          variant.price
      )
      .filter(price =>
        Number.isFinite(
          price
        )
      );


  return {
    price:
      prices.length
        ? Math.min(
            ...prices
          )
        : null,

    regular_price:
      regularPrices.length
        ? Math.min(
            ...regularPrices
          )
        : null,

    sale_price:
      salePrices.length
        ? Math.min(
            ...salePrices
          )
        : null,

    on_sale:
      candidates.some(
        variant =>
          variant.on_sale
      )
  };
}


function getAvailableSizes(
  variants
) {
  return [
    ...new Set(
      variants
        .filter(
          variant =>
            variant.available
        )
        .map(
          variant =>
            variant.size
        )
        .filter(Boolean)
    )
  ];
}


async function scrapeProducts(
  source
) {
  console.log(
    `Fetching Shopify products for ${source.name}`
  );


  const products =
    await fetchAllProducts(
      source
    );


  console.log(
    `${source.name}: ${products.length} Shopify products found`
  );


  const relevantProducts =
    products.filter(
      isRelevantKitProduct
    );


  console.log(
    `${source.name}: ${relevantProducts.length} relevant kids kit products found`
  );


  return relevantProducts
    .map(product => {
      const variants =
        mapVariants(
          product
        );


      const pricing =
        getProductPricing(
          variants
        );


      const ageRange =
        getVariantAgeRange(
          product.variants ||
          []
        ) ||
        getAgeRange(
          product.title
        );


      return {
        club:
          source.name,

        name:
          product.title,

        kit:
          getKitType(
            product.title
          ),

        product:
          getProductCategory(
            product.title
          ),

        age_group:
          getAgeGroup(
            product.title,
            product.variants ||
            []
          ),

        ageRange,

        price:
          pricing.price,

        regular_price:
          pricing.regular_price,

        sale_price:
          pricing.sale_price,

        on_sale:
          pricing.on_sale,

        currency:
          'GBP',

        available:
          variants.some(
            variant =>
              variant.available
          ),

        sizes:
          getAvailableSizes(
            variants
          ),

        variants,

        image:
          product.images?.[0]?.src ||
          null,

        url:
          `${
            source.url.replace(
              /\/$/,
              ''
            )
          }/products/${product.handle}`,

        source:
          source.platform,

        source_product_id:
          product.id
      };
    });
}


module.exports = {
  scrape: scrapeProducts
};