class Product {
  constructor({
    team,
    title,
    category,
    ageGroup,
    price,
    url,
    image,
    sizes,
    source
  }) {
    this.team = team;
    this.title = title;
    this.category = category;
    this.ageGroup = ageGroup;
    this.price = price;
    this.url = url;
    this.image = image;
    this.sizes = sizes;
    this.source = source;
  }
}

module.exports = Product;