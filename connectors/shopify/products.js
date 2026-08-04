const Product = require('../../models/product');

const {
  normaliseCategory,
  normaliseAgeGroup
} = require('../../utils/normaliseProduct');

const { extractPrice } = require('../../utils/pricing');

const {
  isExcludedProduct,
  extractSizes
} = require('../../utils/product');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeProducts(source) {

  console.log(`Fetching Shopify products for ${source.name}`);

  let response;

for (let attempt = 1; attempt <= 3; attempt++) {

  response = await fetch(
    `${source.url}/products.json`
  );

  if (response.ok) {
    break;
  }

  if (response.status === 429) {
    console.log(`Rate limited. Waiting before retry ${attempt}/3...`);
    await sleep(attempt * 3000);
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


  const data = await response.json();

  return data.products
  .filter(product => !isExcludedProduct(product))
  .map(product => {

    return new Product({
      team: source.name,
      title: product.title,
      category: normaliseCategory(product.title),
      ageGroup: normaliseAgeGroup(product.title),
      price: extractPrice(product),
      url: `${source.url}/products/${product.handle}`,
      image: product.images?.[0]?.src || null,
      sizes: extractSizes(product),
      source: source.platform
    });

  });

}

module.exports = {
  scrape: scrapeProducts
};