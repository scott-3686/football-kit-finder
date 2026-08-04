const Product = require('../../models/product');

async function scrapeProducts(source) {

  console.log(`Fetching Shopify products for ${source.name}`);

  const response = await fetch(
    `${source.url}/products.json`
  );

  if (!response.ok) {
    throw new Error(
      `Shopify request failed (${response.status})`
    );
  }

  const data = await response.json();

  return data.products
    .filter(product => {
      const title = product.title.toLowerCase();

      return !title.includes('gift card');
    })
    .map(product => {

      const variant = product.variants?.[0];

      return new Product({
        team: source.name,
        title: product.title,
        category: product.product_type || null,
        ageGroup: product.tags?.includes('Junior')
          ? 'junior'
          : null,
        price: variant
          ? Number(variant.price)
          : null,
        url: `${source.url}/products/${product.handle}`,
        image: product.images?.[0]?.src || null,
        sizes: product.variants?.map(v => v.title) || [],
        source: source.platform
      });

    });

}

module.exports = {
  scrape: scrapeProducts
};