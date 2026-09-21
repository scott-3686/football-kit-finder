function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&pound;/gi, '£')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}


function moneyValue(
  prices,
  field = 'price'
) {
  if (
    !prices ||
    prices[field] === undefined ||
    prices[field] === null
  ) {
    return null;
  }

  const minorUnit =
    Number(
      prices.currency_minor_unit ?? 2
    );

  const divisor =
    Math.pow(
      10,
      minorUnit
    );

  return (
    Number(prices[field]) /
    divisor
  );
}


function getProductType(
  name = ''
) {
  const text =
    name.toLowerCase();

  if (
    text.includes('mini kit') ||
    text.includes('infant kit') ||
    text.includes('baby kit') ||
    text.includes('full kit') ||
    text.includes('kit bundle') ||
    text.includes('kit set')
  ) {
    return 'Full Kit';
  }

  if (
    text.includes('shirt') ||
    text.includes('jersey')
  ) {
    return 'Shirt';
  }

  if (text.includes('short')) {
    return 'Shorts';
  }

  if (text.includes('sock')) {
    return 'Socks';
  }

  return 'Other';
}


function getKitType(
  name = ''
) {
  const text =
    name.toLowerCase();

  if (
    text.includes('goalkeeper') ||
    /\bgk\b/.test(text)
  ) {
    return 'Goalkeeper Kit';
  }

  if (text.includes('home')) {
    return 'Home Kit';
  }

  if (text.includes('away')) {
    return 'Away Kit';
  }

  if (text.includes('third')) {
    return 'Third Kit';
  }

  return null;
}


function getAgeGroup(
  name = ''
) {
  const text =
    name.toLowerCase();

  if (
    text.includes('baby') ||
    text.includes('infant') ||
    text.includes('toddler')
  ) {
    return 'Baby / Infant';
  }

  if (
    text.includes('kid') ||
    text.includes('junior') ||
    text.includes('youth') ||
    text.includes('child')
  ) {
    return 'Youth';
  }

  if (
    text.includes('adult') ||
    text.includes('mens') ||
    text.includes("men's")
  ) {
    return 'Adult';
  }

  return 'Unknown';
}


function isRelevantKidsProduct(
  product = {}
) {
  const name =
    decodeHtmlEntities(
      product.name || ''
    );

  const text =
    name.toLowerCase();

  const productType =
    getProductType(name);

  const ageGroup =
    getAgeGroup(name);

  const isChildProduct =
    ageGroup === 'Youth' ||
    ageGroup === 'Baby / Infant';

  const isKitProduct = [
    'Shirt',
    'Full Kit',
    'Shorts',
    'Socks'
  ].includes(productType);

  const excluded =
    text.includes('matchworn') ||
    text.includes('match worn') ||
    text.includes('signed') ||
    text.includes('testimonial');

  return (
    isChildProduct &&
    isKitProduct &&
    !excluded
  );
}


function getApiBase(source) {
  return (
    source.api_url ||
    `${
      source.url.replace(
        /\/$/,
        ''
      )
    }/wp-json/wc/store/v1`
  );
}


async function getJson(url) {
  const response =
    await fetch(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
    );

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText} - ${url}`
    );
  }

  return response.json();
}


async function fetchAllPages(url) {
  const items = [];

  let page = 1;

  while (true) {
    const separator =
      url.includes('?')
        ? '&'
        : '?';

    const pageUrl =
      `${url}${separator}per_page=100&page=${page}`;

    const batch =
      await getJson(pageUrl);

    if (
      !Array.isArray(batch) ||
      !batch.length
    ) {
      break;
    }

    items.push(
      ...batch
    );

    if (batch.length < 100) {
      break;
    }

    page++;
  }

  return items;
}


function getSizeFromVariation(
  variation = {}
) {
  const sizeAttribute =
    (
      variation.attributes ||
      []
    )
      .find(attribute =>
        String(
          attribute.name || ''
        )
          .toLowerCase() ===
        'size'
      );

  if (sizeAttribute?.value) {
    return decodeHtmlEntities(
      sizeAttribute.value
    ).toUpperCase();
  }

  const variationText =
    decodeHtmlEntities(
      variation.variation ||
      ''
    );

  const match =
    variationText.match(
      /(?:^|,\s*)size:\s*(.+?)(?:,|$)/i
    );

  return match
    ? match[1]
        .trim()
        .toUpperCase()
    : null;
}


function getConfiguredAgeRange(
  size,
  source = {}
) {
  if (
    !size ||
    !source.size_age_map
  ) {
    return null;
  }

  const mapping =
    source.size_age_map[
      size.toUpperCase()
    ];

  if (!mapping) {
    return null;
  }

  const minYears =
    Number(mapping.min);

  const maxYears =
    Number(mapping.max);

  if (
    Number.isNaN(minYears) ||
    Number.isNaN(maxYears)
  ) {
    return null;
  }

  return {
    label: size,

    min_months:
      minYears * 12,

    max_months:
      maxYears * 12
  };
}


function mapVariation(
  variation,
  source
) {
  const size =
    getSizeFromVariation(
      variation
    );

  const currentPrice =
    moneyValue(
      variation.prices,
      'price'
    );

  const regularPrice =
    moneyValue(
      variation.prices,
      'regular_price'
    );

  const available =
    Boolean(
      variation.is_in_stock &&
      variation.is_purchasable
    );

  const onSale =
    Boolean(
      variation.on_sale ||
      (
        currentPrice !== null &&
        regularPrice !== null &&
        currentPrice <
          regularPrice
      )
    );

  return {
    id:
      variation.id,

    size,

    price:
      currentPrice,

    regular_price:
      regularPrice,

    sale_price:
      onSale
        ? currentPrice
        : null,

    on_sale:
      onSale,

    available,

    age_range:
      getConfiguredAgeRange(
        size,
        source
      )
  };
}


function getAttributeSizes(
  product = {}
) {
  const sizeAttribute =
    (
      product.attributes ||
      []
    )
      .find(attribute =>
        String(
          attribute.name || ''
        )
          .toLowerCase() ===
        'size'
      );

  return (
    sizeAttribute?.terms ||
    []
  )
    .map(term =>
      decodeHtmlEntities(
        term.name || ''
      )
    )
    .filter(Boolean);
}


async function mapProduct(
  product,
  source,
  apiBase
) {
  const name =
    decodeHtmlEntities(
      product.name ||
      ''
    );

  let variants = [];

  if (
    product.type === 'variable' ||
    (
      product.variations ||
      []
    ).length
  ) {
    const variationProducts =
      await fetchAllPages(
        `${apiBase}/products?type=variation&parent=${product.id}`
      );

    variants =
      variationProducts
        .map(variation =>
          mapVariation(
            variation,
            source
          )
        )
        .filter(
          variation =>
            variation.size
        );
  }

  const availableVariants =
    variants.filter(
      variant =>
        variant.available
    );

  const sizes =
    variants.length
      ? availableVariants.map(
          variant =>
            variant.size
        )
      : getAttributeSizes(
          product
        );

  const currentPrice =
    moneyValue(
      product.prices,
      'price'
    );

  const regularPrice =
    moneyValue(
      product.prices,
      'regular_price'
    );

  const onSale =
    Boolean(
      product.on_sale ||
      (
        currentPrice !== null &&
        regularPrice !== null &&
        currentPrice <
          regularPrice
      )
    );

  return {
    club:
      source.name,

    name,

    kit:
      getKitType(name),

    product:
      getProductType(name),

    age_group:
      getAgeGroup(name),

    price:
      currentPrice,

    regular_price:
      regularPrice,

    sale_price:
      onSale
        ? currentPrice
        : null,

    on_sale:
      onSale,

    available:
      variants.length
        ? availableVariants.length > 0
        : Boolean(
            product.is_in_stock &&
            product.is_purchasable
          ),

    currency:
      product.prices
        ?.currency_code ||
      'GBP',

    sizes:
      [
        ...new Set(sizes)
      ],

    variants,

    image:
      product.images?.[0]?.src ||
      null,

    url:
      product.permalink ||
      null,

    source:
      source.platform,

    source_product_id:
      product.id
  };
}


async function scrape(source) {
  const apiBase =
    getApiBase(source);

  console.log(
    `Fetching WooCommerce products for ${source.name}`
  );

  const allProducts =
    await fetchAllPages(
      `${apiBase}/products`
    );

  const relevantProducts =
    allProducts.filter(
      isRelevantKidsProduct
    );

  console.log(
    `${source.name}: ${allProducts.length} WooCommerce products found`
  );

  console.log(
    `${source.name}: ${relevantProducts.length} relevant kids kit products found`
  );

  const products = [];

  for (
    const product
    of relevantProducts
  ) {
    try {
      products.push(
        await mapProduct(
          product,
          source,
          apiBase
        )
      );

    } catch (error) {
      console.error(
        `${source.name} product failed: ${
          product.permalink ||
          product.id
        }`
      );

      console.error(
        error.message
      );
    }
  }

  return products;
}


module.exports = {
  scrape
};