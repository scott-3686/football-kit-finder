function getKitType(title) {

  const text = title.toLowerCase();

  const isKitProduct =
    text.includes('shirt') ||
    text.includes('jersey') ||
    text.includes('top') ||
    text.includes('short');

  if (!isKitProduct) {
    return null;
  }

  if (text.includes('home')) {
    return 'home';
  }

  if (text.includes('away')) {
    return 'away';
  }

  if (text.includes('third')) {
    return 'third';
  }

  return null;
}


function getProductCategory(title) {

  const text = title.toLowerCase();

  if (
    text.includes('shirt') ||
    text.includes('jersey') ||
    text.includes('top')
  ) {
    return 'shirt';
  }

  if (text.includes('short')) {
    return 'shorts';
  }

  if (text.includes('sock')) {
    return 'socks';
  }

  if (
    text.includes('training') ||
    text.includes('quarter zip') ||
    text.includes('1/4 zip')
  ) {
    return 'training';
  }

  if (
    text.includes('hoodie') ||
    text.includes('jacket') ||
    text.includes('coat')
  ) {
    return 'leisure';
  }

  return 'other';
}


function getAgeRange(title) {

  const text = title.toLowerCase();

  const match = text.match(
    /(\d+)[\s-]*(?:to|-)[\s-]*(\d+)/
  );

  if (match) {
    return {
      min: Number(match[1]),
      max: Number(match[2])
    };
  }

  if (
    text.includes('jnr') ||
    text.includes('junior') ||
    text.includes('kids') ||
    text.includes('youth')
  ) {
    return {
      min: null,
      max: null
    };
  }

  return null;
}


function getVariantAgeRange(variants = []) {

  const ages = [];

  variants.forEach(variant => {

    const match = variant.title.match(
      /(\d+)[\s-]*(?:to|-)[\s-]*(\d+)\s*Years?/i
    );

    if (match) {
      ages.push({
        min: Number(match[1]),
        max: Number(match[2])
      });
    }

  });

  if (!ages.length) {
    return null;
  }

  return {
    min: Math.min(...ages.map(a => a.min)),
    max: Math.max(...ages.map(a => a.max))
  };
}

module.exports = {
  getKitType,
  getProductCategory,
  getAgeRange,
  getVariantAgeRange
};
