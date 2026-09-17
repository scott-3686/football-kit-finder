function searchProducts(products = [], filters = {}) {

  return products.filter(product => {

    if (
      filters.club &&
      !matchesText(product.club, filters.club)
    ) {
      return false;
    }


    if (
      filters.product &&
      !matchesText(product.product, filters.product)
    ) {
      return false;
    }


    if (
      filters.kit &&
      !matchesText(product.kit, filters.kit)
    ) {
      return false;
    }


    if (
      filters.maxPrice !== undefined &&
      Number(product.price) > Number(filters.maxPrice)
    ) {
      return false;
    }


    if (filters.age !== undefined) {

      const ageInMonths =
        Number(filters.age) * 12;

      if (
        !Array.isArray(product.age_ranges) ||
        !product.age_ranges.length
      ) {
        return false;
      }


      const ageMatches =
        product.age_ranges.some(range => {

          return (
            ageInMonths >= range.min_months &&
            ageInMonths <= range.max_months
          );

        });


      if (!ageMatches) {
        return false;
      }

    }


    return true;

  });

}


function matchesText(value, searchValue) {

  if (!value) {
    return false;
  }

  return (
    String(value)
      .trim()
      .toLowerCase() ===
    String(searchValue)
      .trim()
      .toLowerCase()
  );

}


module.exports = {
  searchProducts
};