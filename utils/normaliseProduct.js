function normaliseCategory(title) {

  const text = title.toLowerCase();

  if (
    text.includes('home') &&
    (text.includes('shirt') ||
     text.includes('jersey') ||
     text.includes('kit') ||
     text.includes('top'))
  ) {
    return 'home_kit';
  }

  if (
    text.includes('away') &&
    (text.includes('shirt') ||
     text.includes('jersey') ||
     text.includes('kit') ||
     text.includes('top'))
  ) {
    return 'away_kit';
  }

  if (text.includes('third')) {
    return 'third_kit';
  }

  if (
    text.includes('short') ||
    text.includes('sock')
  ) {
    return 'kit_component';
  }

  if (
    text.includes('training')
  ) {
    return 'training';
  }

  return 'other';
}


function normaliseAgeGroup(title) {

  const text = title.toLowerCase();

  if (
    text.includes('jnr') ||
    text.includes('junior') ||
    text.includes('kids') ||
    text.includes('youth')
  ) {
    return 'junior';
  }

  return 'adult';
}


module.exports = {
  normaliseCategory,
  normaliseAgeGroup
};
