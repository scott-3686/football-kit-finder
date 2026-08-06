const Product = require('../../models/product');

const {
  getKitType,
  getProductCategory,
  getAgeRange
} = require('../../utils/classifier');


const LISTINGS = [
  {
    id: 8,
    subid: 11
  },
  {
    id: 26,
    subid: 100
  },
  {
    id: 20,
    subid: ""
  }
];

async function fetchListing(listing) {

  const body =
    `id=${listing.id}` +
    `&subid=${listing.subid}` +
    `&star_shirt=Y` +
    `&display_oos=N` +
    `&websales_brch=300` +
    `&listing_type=234` +
    `&quickview=Y` +
    `&start=0`;

  const response = await fetch(
    "https://shop.afc.co.uk/api/product/catalogue/list/getdetails.php",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body
    }
  );

  return response.json();
}

async function scrapeProducts(source) {

  const products = [];

  for (const listing of LISTINGS) {

    const data = await fetchListing(listing);

    for (const product of data.results.docs) {

      products.push(
        mapProduct(product, source)
      );

    }

  }

  return products;
}


function mapProduct(product, source) {

  return new Product({
    team: source.name,
    title: product.title,
    category: product.main_category || 'other',
    price: Number(product.price.rrp),
    currency: 'GBP',
    url: product.link,
    image: null,
    sizes: product.item_catalogue
      ? product.item_catalogue.map(item => item.label)
      : [],
    source: source.platform,
    kitType: getKitType(product.title),
    productCategory: getProductCategory(product.title),
    ageRange: getAgeRange(product.title)
  });

}

module.exports = {
  scrape: scrapeProducts
};