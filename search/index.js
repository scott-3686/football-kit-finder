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
        !product.age_range ||
        product.age_range.min_months === undefined ||
        product.age_range.max_months === undefined
      ) {
        return false;
      }

      if (
        ageInMonths <
          product.age_range.min_months ||
        ageInMonths >
          product.age_range.max_months
      ) {
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