function extractPrice(product) {

  const variant = product.variants?.[0];

  if (!variant?.price) {
    return null;
  }

  return Number(variant.price);

}

module.exports = {
  extractPrice
};