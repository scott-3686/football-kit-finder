function normaliseProduct(product = {}) {
  const name =
    product.name ||
    product.title ||
    '';

  const variants = normaliseVariants(
    product.variants || []
  );

  const sizes = normaliseSizes(
    product.sizes || []
  );

  const ageGroups = normaliseAgeGroups(
    product.age_groups ||
    product.age_group ||
    product.ageGroup ||
    extractAgeGroup(product, name)
  );

  return {
    club:
      product.club ||
      product.team ||
      product.source ||
      'Unknown',

    name,

    season:
      normaliseSeason(
        product.season ||
        extractSeason(name)
      ),

    kit:
      normaliseKit(
        product.kit ||
        product.kitType ||
        extractKit(product, name)
      ),

    product:
      normaliseProductType(
        product.product ||
        product.productCategory ||
        extractProductType(name)
      ),

    age_groups:
      ageGroups,

    age_ranges:
      extractAgeRanges({
        sizes,
        variants,
        explicitRanges:
          product.age_ranges || [],
        ageRange:
          product.ageRange || null
      }),

    price:
      numberOrNull(product.price) ?? 0,

    regular_price:
      numberOrNull(
        product.regular_price ??
        product.regularPrice
      ),

    sale_price:
      numberOrNull(
        product.sale_price ??
        product.salePrice
      ),

    on_sale:
      booleanOrNull(
        product.on_sale ??
        product.onSale
      ),

    currency:
      product.currency ||
      'GBP',

    available:
      booleanOrNull(
        product.available
      ),

    sizes,

    variants,

    image:
      product.image || null,

    url:
      product.url || null,

    source:
      product.source || null,

    source_product_id:
      normaliseSourceProductId(
        product.source_product_id ??
        product.sourceProductId ??
        product.id
      )
  };
}


function numberOrNull(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}


function booleanOrNull(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  return Boolean(value);
}


function normaliseSourceProductId(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return String(value);
}


function normaliseVariants(variants = []) {
  return variants
    .map(variant => {
      if (!variant) {
        return null;
      }

      const size =
        variant.size
          ? String(variant.size).trim()
          : null;

      return {
        id:
          variant.id ?? null,

        size,

        price:
          numberOrNull(
            variant.price
          ),

        regular_price:
          numberOrNull(
            variant.regular_price ??
            variant.regularPrice
          ),

        sale_price:
          numberOrNull(
            variant.sale_price ??
            variant.salePrice
          ),

        on_sale:
          booleanOrNull(
            variant.on_sale ??
            variant.onSale
          ),

        available:
          booleanOrNull(
            variant.available
          ),

        age_range:
          normaliseAgeRange(
            variant.age_range ??
            variant.ageRange,
            size
          )
      };
    })
    .filter(Boolean);
}


function normaliseSizes(sizes = []) {
  const cleaned = sizes
    .map(size => {
      const value =
        String(size).trim();

      if (!value) {
        return null;
      }

      if (
        value.toLowerCase() ===
        'no colour'
      ) {
        return null;
      }

      if (value.includes(' / ')) {
        if (
          /^\d+\s*\/\s*\d+\s*[YM]$/i
            .test(value)
        ) {
          return value;
        }

        const parts =
          value.split(' / ');

        return parts[
          parts.length - 1
        ].trim();
      }

      return value;
    })
    .filter(Boolean);

  return [...new Set(cleaned)];
}


function normaliseAgeGroups(value) {
  const values = Array.isArray(value)
    ? value
    : [value];

  const groups = values
    .map(normaliseAgeGroup)
    .filter(Boolean);

  return [...new Set(groups)];
}


function normaliseAgeGroup(value) {
  if (!value) {
    return null;
  }

  const text =
    String(value)
      .trim()
      .toLowerCase();

  if (
    text.includes('baby') ||
    text.includes('infant') ||
    text.includes('toddler') ||
    text.includes('mini')
  ) {
    return 'Baby / Infant';
  }

  if (
    text.includes('youth') ||
    text.includes('junior') ||
    text.includes('jnr') ||
    text.includes('kid') ||
    text.includes('child')
  ) {
    return 'Youth';
  }

  if (
    text.includes('adult') ||
    text.includes('mens') ||
    text.includes("men's") ||
    text.includes('women')
  ) {
    return 'Adult';
  }

  if (text === 'unknown') {
    return null;
  }

  return String(value).trim();
}


function extractAgeRanges({
  sizes = [],
  variants = [],
  explicitRanges = [],
  ageRange = null
} = {}) {
  const ranges = [];

  for (const range of explicitRanges) {
    const normalised =
      normaliseAgeRange(range);

    if (normalised) {
      ranges.push(normalised);
    }
  }

  const productAgeRange =
    normaliseGenericAgeRange(
      ageRange
    );

  if (productAgeRange) {
    ranges.push(productAgeRange);
  }

  for (const variant of variants) {
    if (
      variant.age_range &&
      variant.available !== false
    ) {
      ranges.push(
        variant.age_range
      );
    }
  }

  for (const size of sizes) {
    const parsed =
      parseSizeAgeRange(size);

    if (parsed) {
      ranges.push(parsed);
    }
  }

  const unique = new Map();

  for (const range of ranges) {
    const key = [
      range.label || '',
      range.min_months,
      range.max_months
    ].join('|');

    unique.set(key, range);
  }

  return Array.from(
    unique.values()
  );
}


function normaliseGenericAgeRange(range) {
  if (!range) {
    return null;
  }

  if (
    range.min_months !== undefined ||
    range.max_months !== undefined
  ) {
    return normaliseAgeRange(range);
  }

  const minYears =
    numberOrNull(range.min);

  const maxYears =
    numberOrNull(range.max);

  if (
    minYears === null ||
    maxYears === null
  ) {
    return null;
  }

  return {
    label:
      range.label ||
      `${minYears}-${maxYears}Y`,

    min_months:
      minYears * 12,

    max_months:
      maxYears * 12
  };
}


function normaliseAgeRange(
  range,
  fallbackLabel = null
) {
  if (!range) {
    return null;
  }

  const minMonths =
    numberOrNull(
      range.min_months
    );

  const maxMonths =
    numberOrNull(
      range.max_months
    );

  if (
    minMonths === null ||
    maxMonths === null
  ) {
    return null;
  }

  return {
    label:
      range.label ||
      fallbackLabel,

    min_months:
      minMonths,

    max_months:
      maxMonths
  };
}


function parseSizeAgeRange(size) {
  const value =
    String(size)
      .trim()
      .toUpperCase();

  const monthRange =
    value.match(
      /^(\d+)\s*(?:\/|-|TO)\s*(\d+)\s*(?:M|MONTH|MONTHS)$/
    );

  if (monthRange) {
    return {
      label: size,
      min_months:
        Number(monthRange[1]),
      max_months:
        Number(monthRange[2])
    };
  }

  const yearRange =
    value.match(
      /^(\d+)\s*(?:\/|-|TO)\s*(\d+)\s*(?:Y|YEAR|YEARS)$/
    );

  if (yearRange) {
    return {
      label: size,
      min_months:
        Number(yearRange[1]) * 12,
      max_months:
        Number(yearRange[2]) * 12
    };
  }

  const singleYear =
    value.match(
      /^(\d+)\s*(?:Y|YEAR|YEARS)$/
    );

  if (singleYear) {
    const months =
      Number(singleYear[1]) * 12;

    return {
      label: size,
      min_months: months,
      max_months: months
    };
  }

  const singleMonth =
    value.match(
      /^(\d+)\s*(?:M|MONTH|MONTHS)$/
    );

  if (singleMonth) {
    const months =
      Number(singleMonth[1]);

    return {
      label: size,
      min_months: months,
      max_months: months
    };
  }

  return null;
}


function normaliseSeason(value) {
  if (!value) {
    return null;
  }

  const match =
    String(value).match(
      /\b(\d{2}|20\d{2})\s*\/\s*(\d{2}|20\d{2})\b/
    );

  if (!match) {
    return String(value).trim();
  }

  const first = match[1];
  const second = match[2];

  const firstYear =
    first.length === 2
      ? `20${first}`
      : first;

  const secondYear =
    second.length === 4
      ? second.slice(-2)
      : second;

  return `${firstYear}/${secondYear}`;
}


function extractSeason(name = '') {
  const match =
    name.match(
      /\b(\d{2}|20\d{2})\s*\/\s*(\d{2}|20\d{2})\b/
    );

  return match
    ? match[0]
    : null;
}


function normaliseKit(value) {
  if (!value) {
    return null;
  }

  const text =
    String(value)
      .trim()
      .toLowerCase();

  if (
    text.includes('goalkeeper') ||
    /^gk\b/.test(text)
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

  return String(value).trim();
}


function extractKit(
  product = {},
  name = ''
) {
  const text =
    `${JSON.stringify(product)} ${name}`
      .toLowerCase();

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


function normaliseProductType(value) {
  if (!value) {
    return null;
  }

  const text =
    String(value)
      .trim()
      .toLowerCase();

  if (
    text === 'kit' ||
    text.includes('full kit') ||
    text.includes('bundle')
  ) {
    return 'Full Kit';
  }

  if (
    text.includes('shirt') ||
    text.includes('jersey') ||
    text === 'top'
  ) {
    return 'Shirt';
  }

  if (text.includes('short')) {
    return 'Shorts';
  }

  if (text.includes('sock')) {
    return 'Socks';
  }

  if (text.includes('glove')) {
    return 'Gloves';
  }

  if (text === 'other') {
    return 'Other';
  }

  return String(value).trim();
}


function extractProductType(name = '') {
  const text =
    name.toLowerCase();

  if (
    text.includes('mini kit') ||
    text.includes('infant kit') ||
    text.includes('baby kit') ||
    text.includes('toddler kit') ||
    text.includes('full kit') ||
    text.includes('kit set') ||
    text.includes('kit bundle') ||
    text.includes('bundle')
  ) {
    return 'Full Kit';
  }

  if (
    text.includes('jersey') ||
    text.includes('shirt') ||
    text.includes('top') ||
    text.includes(' ss ') ||
    text.includes(' ls ') ||
    text.endsWith(' ss') ||
    text.endsWith(' ls')
  ) {
    return 'Shirt';
  }

  if (text.includes('short')) {
    return 'Shorts';
  }

  if (text.includes('sock')) {
    return 'Socks';
  }

  if (text.includes('glove')) {
    return 'Gloves';
  }

  return 'Other';
}


function extractAgeGroup(
  product = {},
  name = ''
) {
  const text =
    `${JSON.stringify(product)} ${name}`
      .toLowerCase();

  const sizes =
    JSON.stringify(
      product.sizes ||
      product.item_catalogue ||
      product.size ||
      ''
    ).toLowerCase();

  if (
    text.includes('baby') ||
    text.includes('infant') ||
    text.includes('mini') ||
    text.includes('toddler')
  ) {
    return 'Baby / Infant';
  }

  if (
    text.includes('youth') ||
    text.includes('junior') ||
    text.includes('jnr') ||
    text.includes('kids') ||
    text.includes('child')
  ) {
    return 'Youth';
  }

  if (
    sizes.includes('10.5') ||
    sizes.includes('2.5') ||
    sizes.includes('5.5')
  ) {
    return 'Youth';
  }

  if (
    text.includes('adult') ||
    text.includes('mens') ||
    text.includes("men's") ||
    text.includes('women')
  ) {
    return 'Adult';
  }

  return 'Unknown';
}


module.exports = {
  normaliseProduct
};