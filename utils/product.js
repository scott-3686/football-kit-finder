function getAgeGroup(product) {

  const tags = product.tags || [];

  const junior =
    tags.some(tag =>
      tag.toLowerCase().includes('junior')
    );

  return junior ? 'junior' : null;

}


function isExcludedProduct(product) {

  const title = product.title.toLowerCase();

  return (
    title.includes('gift card')
  );

}


function extractSizes(product) {

  return product.variants
    ?.map(v => v.title)
    .filter(Boolean) || [];

}


module.exports = {
  getAgeGroup,
  isExcludedProduct,
  extractSizes
};