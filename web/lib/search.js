function unique(values = []) {
  return [
    ...new Set(
      values.filter(Boolean)
    )
  ];
}


function matchesText(
  value,
  expected
) {
  if (!expected) {
    return true;
  }


  if (!value) {
    return false;
  }


  return (
    String(value)
      .trim()
      .toLowerCase() ===
    String(expected)
      .trim()
      .toLowerCase()
  );
}


function rangeMatchesAge(
  range,
  ageMonths
) {
  if (!range) {
    return false;
  }


  return (
    Number(ageMonths) >=
      Number(range.min_months) &&
    Number(ageMonths) <=
      Number(range.max_months)
  );
}


function getMatchingRanges(
  product,
  age
) {
  if (
    age === '' ||
    age === null ||
    age === undefined
  ) {
    return (
      product.age_ranges ||
      []
    );
  }


  const ageMonths =
    Number(age) * 12;


  return (
    product.age_ranges ||
    []
  ).filter(range =>
    rangeMatchesAge(
      range,
      ageMonths
    )
  );
}


function getMatchingVariants(
  product,
  age,
  matchingSizes
) {
  const variants =
    product.variants ||
    [];


  if (!variants.length) {
    return [];
  }


  if (
    age === '' ||
    age === null ||
    age === undefined
  ) {
    return variants.filter(
      variant =>
        variant.available !== false
    );
  }


  const ageMonths =
    Number(age) * 12;


  return variants.filter(
    variant => {
      if (
        variant.available === false
      ) {
        return false;
      }


      if (variant.age_range) {
        return rangeMatchesAge(
          variant.age_range,
          ageMonths
        );
      }


      if (
        variant.size &&
        matchingSizes.includes(
          variant.size
        )
      ) {
        return true;
      }


      return false;
    }
  );
}


function getAvailability(
  product,
  matchingVariants
) {
  if (
    matchingVariants.length
  ) {
    return 'in_stock';
  }


  if (
    product.available === true
  ) {
    return 'in_stock';
  }


  if (
    product.available === false
  ) {
    return 'out_of_stock';
  }


  return 'unknown';
}


function getEffectivePrice(
  product,
  matchingVariants
) {
  const variantPrices =
    matchingVariants
      .map(variant =>
        Number(
          variant.price
        )
      )
      .filter(price =>
        Number.isFinite(
          price
        )
      );


  if (variantPrices.length) {
    return Math.min(
      ...variantPrices
    );
  }


  return Number(
    product.price || 0
  );
}


function getSaving(
  product,
  effectivePrice
) {
  const regularPrice =
    Number(
      product.regular_price
    );


  if (
    !Number.isFinite(
      regularPrice
    ) ||
    regularPrice <=
      effectivePrice
  ) {
    return 0;
  }


  return (
    regularPrice -
    effectivePrice
  );
}


function buildResult(
  product,
  filters
) {
  const matchingRanges =
    getMatchingRanges(
      product,
      filters.age
    );


  const matchingSizes =
    unique(
      matchingRanges.map(
        range =>
          range.label
      )
    );


  const matchingVariants =
    getMatchingVariants(
      product,
      filters.age,
      matchingSizes
    );


  const effectivePrice =
    getEffectivePrice(
      product,
      matchingVariants
    );


  return {
    product,

    matchingSizes,

    matchingVariants,

    effectivePrice,

    saving:
      getSaving(
        product,
        effectivePrice
      ),

    availability:
      getAvailability(
        product,
        matchingVariants
      )
  };
}


export function searchProducts(
  products = [],
  filters = {}
) {
  let results =
    products
      .filter(product => {
        if (
          filters.club &&
          !matchesText(
            product.club,
            filters.club
          )
        ) {
          return false;
        }


        if (
          filters.country &&
          !matchesText(
            product.country,
            filters.country
          )
        ) {
          return false;
        }


        if (
          filters.league &&
          !matchesText(
            product.league,
            filters.league
          )
        ) {
          return false;
        }


        if (
          filters.kit &&
          !matchesText(
            product.kit,
            filters.kit
          )
        ) {
          return false;
        }


        if (
          filters.product &&
          !matchesText(
            product.product,
            filters.product
          )
        ) {
          return false;
        }


        if (
          filters.age !== '' &&
          filters.age !== null &&
          filters.age !== undefined
        ) {
          const matches =
            getMatchingRanges(
              product,
              filters.age
            );


          if (!matches.length) {
            return false;
          }
        }


        return true;
      })
      .map(product =>
        buildResult(
          product,
          filters
        )
      );


  if (
    filters.maxPrice !== '' &&
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined
  ) {
    results =
      results.filter(
        result =>
          result.effectivePrice <=
          Number(
            filters.maxPrice
          )
      );
  }


  if (
    filters.inStockOnly
  ) {
    results =
      results.filter(
        result =>
          result.availability ===
          'in_stock'
      );
  }


  switch (filters.sort) {
    case 'price_desc':

      results.sort(
        (a, b) =>
          b.effectivePrice -
          a.effectivePrice
      );

      break;


    case 'saving_desc':

      results.sort(
        (a, b) =>
          b.saving -
          a.saving
      );

      break;


    case 'club':

      results.sort(
        (a, b) =>
          a.product.club
            .localeCompare(
              b.product.club
            )
      );

      break;


    case 'price_asc':
    default:

      results.sort(
        (a, b) =>
          a.effectivePrice -
          b.effectivePrice
      );

      break;
  }


  return results;
}