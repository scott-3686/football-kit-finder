function normaliseCategory(title) {

  const text = title.toLowerCase();

  // Accessories / non-wearables first
  // (prevents "kit" in car kit, cushion etc. being misclassified)
  if (
    text.includes('mug') ||
    text.includes('cushion') ||
    text.includes('coaster') ||
    text.includes('bar runner') ||
    text.includes('car kit') ||
    text.includes('flag') ||
    text.includes('scarf')
  ) {
    return 'accessory';
  }

  if (
    text.includes('home') &&
    (
      text.includes('shirt') ||
      text.includes('jersey') ||
      text.includes('top')
    )
  ) {
    return 'home_kit';
  }

  if (
    text.includes('away') &&
    (
      text.includes('shirt') ||
      text.includes('jersey') ||
      text.includes('top')
    )
  ) {
    return 'away_kit';
  }

  if (
    text.includes('third') &&
    (
      text.includes('shirt') ||
      text.includes('jersey') ||
      text.includes('top')
    )
  ) {
    return 'third_kit';
  }

  if (
    text.includes('training')
  ) {
    return 'training';
  }

  if (
    text.includes('sock') ||
    text.includes('short')
  ) {
    return 'kit_component';
  }

  if (
    text.includes('hoodie') ||
    text.includes('jacket') ||
    text.includes('coat') ||
    text.includes('polo') ||
    text.includes('t-shirt')
  ) {
    return 'clothing';
  }

  return 'other';
}

function normaliseAgeGroup(title) {

  const text = title.toLowerCase();

  if (
    text.includes('jnr') ||
    text.includes('junior') ||
    text.includes('kids') ||
    text.includes('youth') ||
    text.includes('child')
  ) {
    return 'junior';
  }

  if (
    text.includes('mens') ||
    text.includes("men's") ||
    text.includes('adult')
  ) {
    return 'adult';
  }

  return 'unknown';
}


module.exports = {
  normaliseCategory,
  normaliseAgeGroup
};