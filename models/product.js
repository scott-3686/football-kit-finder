class Product {
  constructor({
    team,
    title,
    category,
    ageGroup,
    price,
    currency,
    url,
    image,
    sizes,
    variants,
    source
  }) {
    this.team = team;
    this.title = title;
    this.category = category;
    this.ageGroup = ageGroup;
    this.price = price;
    this.currency = currency;
    this.url = url;
    this.image = image;
    this.sizes = sizes;
    this.variants = variants;
    this.source = source;
  }
}

module.exports = Product;