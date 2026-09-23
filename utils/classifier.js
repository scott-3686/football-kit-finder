function getKitType(title = '') {
  const text =
    title.toLowerCase();


  if (
    text.includes('goalkeeper') ||
    /\bgk\b/.test(text)
  ) {
    return 'goalkeeper';
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


function getProductCategory(
  title = ''
) {
  const text =
    title.toLowerCase();


  if (
    text.includes('mini kit') ||
    text.includes('infant kit') ||
    text.includes('baby kit') ||
    text.includes('full kit') ||
    text.includes('kit set')
  ) {
    return 'full kit';
  }


  if (
    text.includes('jersey') ||
    text.includes('shirt')
  ) {
    return 'shirt';
  }


  if (
    text.includes('short')
  ) {
    return 'shorts';
  }


  if (
    text.includes('sock')
  ) {
    return 'socks';
  }


  return 'other';
}


function getAgeRange(title = '') {
  const text =
    title.toLowerCase();


  const yearRange =
    text.match(
      /(\d+)\s*(?:-|\/|to)\s*(\d+)\s*(?:y|yr|yrs|year|years)\b/i
    );


  if (yearRange) {
    return {
      min:
        Number(
          yearRange[1]
        ),

      max:
        Number(
          yearRange[2]
        )
    };
  }


  if (
    text.includes('jnr') ||
    text.includes('junior') ||
    text.includes('kids') ||
    text.includes('youth') ||
    text.includes('child')
  ) {
    return {
      min: null,
      max: null
    };
  }


  return null;
}


function getVariantAgeRange(
  variants = []
) {
  const ages = [];


  for (
    const variant
    of variants
  ) {
    const title =
      String(
        variant.title || ''
      );


    const range =
      title.match(
        /(\d+)\s*(?:-|\/|to)\s*(\d+)\s*(?:y|yr|yrs|year|years)\b/i
      );


    if (range) {
      ages.push({
        min:
          Number(
            range[1]
          ),

        max:
          Number(
            range[2]
          )
      });

      continue;
    }


    const singleAge =
      title.match(
        /\b(\d+)\s*(?:y|yr|yrs|year|years)\b/i
      );


    if (singleAge) {
      const age =
        Number(
          singleAge[1]
        );


      ages.push({
        min: age,
        max: age
      });
    }
  }


  if (!ages.length) {
    return null;
  }


  return {
    min:
      Math.min(
        ...ages.map(
          age => age.min
        )
      ),

    max:
      Math.max(
        ...ages.map(
          age => age.max
        )
      )
  };
}


function getAgeGroup(
  title = '',
  variants = []
) {
  const text =
    title.toLowerCase();


  if (
    text.includes('baby') ||
    text.includes('infant') ||
    text.includes('toddler') ||
    text.includes('mini kit')
  ) {
    return 'baby / infant';
  }


  if (
    text.includes('jnr') ||
    text.includes('junior') ||
    text.includes('kids') ||
    text.includes('youth') ||
    text.includes('child')
  ) {
    return 'junior';
  }


  const variantText =
    variants
      .map(
        variant =>
          variant.title || ''
      )
      .join(' ')
      .toLowerCase();


  if (
    /\b\d+\s*(?:-|\/|to)\s*\d+\s*(?:y|yr|yrs|year|years)\b/i
      .test(variantText) ||
    /\b\d+\s*(?:yr|yrs|year|years)\b/i
      .test(variantText)
  ) {
    return 'junior';
  }


  return 'adult';
}


module.exports = {
  getKitType,
  getProductCategory,
  getAgeRange,
  getVariantAgeRange,
  getAgeGroup
};