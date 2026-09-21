const fs = require('fs');
const path = require('path');
const { getConnector } = require('./connectors');
const { normaliseProduct } = require('./normalisers/product');


const sources = JSON.parse(
  fs.readFileSync(
    './config/sources.json',
    'utf8'
  )
);


function getProductKey(product) {
  if (
    product.source_product_id
  ) {
    return [
      product.source || 'unknown',
      product.club,
      product.source_product_id
    ]
      .join('|')
      .toLowerCase();
  }

  if (product.url) {
    return [
      product.club,
      product.url
    ]
      .join('|')
      .toLowerCase();
  }

  return [
    product.club,
    product.name
  ]
    .join('|')
    .toLowerCase();
}


function mergeUniqueValues(
  first = [],
  second = []
) {
  return [
    ...new Set([
      ...first,
      ...second
    ])
  ];
}


function mergeObjectsByKey(
  first = [],
  second = [],
  getKey
) {
  const items = new Map();

  for (
    const item
    of [...first, ...second]
  ) {
    if (!item) {
      continue;
    }

    const key = getKey(item);

    if (!items.has(key)) {
      items.set(key, item);
    }
  }

  return Array.from(
    items.values()
  );
}


function mergeProducts(
  existing,
  incoming
) {
  return {
    ...existing,

    age_groups:
      mergeUniqueValues(
        existing.age_groups || [],
        incoming.age_groups || []
      ),

    age_ranges:
      mergeObjectsByKey(
        existing.age_ranges || [],
        incoming.age_ranges || [],
        range => [
          range.label || '',
          range.min_months,
          range.max_months
        ].join('|')
      ),

    sizes:
      mergeUniqueValues(
        existing.sizes || [],
        incoming.sizes || []
      ),

    variants:
      mergeObjectsByKey(
        existing.variants || [],
        incoming.variants || [],
        variant =>
          variant.id ??
          variant.size ??
          JSON.stringify(variant)
      ),

    available:
      existing.available === true ||
      incoming.available === true
        ? true
        : existing.available === false &&
          incoming.available === false
          ? false
          : null
  };
}


function dedupeProducts(products) {
  const seen = new Map();

  for (const product of products) {
    const key =
      getProductKey(product);

    if (!seen.has(key)) {
      seen.set(
        key,
        product
      );

      continue;
    }

    seen.set(
      key,
      mergeProducts(
        seen.get(key),
        product
      )
    );
  }

  return Array.from(
    seen.values()
  );
}


async function run() {
  if (
    !fs.existsSync('./output')
  ) {
    fs.mkdirSync('./output');
  }

  for (const source of sources) {
    const connector =
      getConnector(
        source.platform
      );

    if (!connector) {
      console.log(
        `No connector found for ${source.platform}`
      );

      continue;
    }

    console.log(
      `Fetching ${source.name} products`
    );

    const products =
      await connector.scrape(
        source
      );

    const normalised =
      products.map(product =>
        normaliseProduct(product)
      );

    const deduped =
      dedupeProducts(
        normalised
      );

    console.log(
      `${source.name}: ${products.length} raw products`
    );

    console.log(
      `${source.name}: ${deduped.length} after dedupe`
    );

    const filename =
      source.name
        .toLowerCase()
        .replace(/\s+/g, '-') +
      '.json';

    fs.writeFileSync(
      path.join(
        './output',
        filename
      ),
      JSON.stringify(
        deduped,
        null,
        2
      )
    );

    console.log(
      `Saved to output/${filename}`
    );
  }
}


run().catch(console.error);