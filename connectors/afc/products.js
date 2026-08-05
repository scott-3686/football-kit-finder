const Product = require('../../models/product');

async function scrapeProducts(source) {

  console.log(`Fetching Aberdeen products`);

  const body =
    "id=8&star_shirt=Y&display_oos=N&websales_brch=300&listing_type=234&quickview=Y&start=0";


  const response = await fetch(
    "https://shop.afc.co.uk/api/product/catalogue/list/getdetails.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );


  if (!response.ok) {
    throw new Error(
      `Aberdeen request failed (${response.status})`
    );
  }


  const data = await response.json();


  return data.results.docs.map(product => {

    return new Product({

      team: source.name,

      title: product.title,

      category: product.main_category,

      ageGroup:
        product.category?.toLowerCase().includes('youth')
          ? 'junior'
          : 'adult',

      price:
        Number(product.price.rrp),

      currency: "GBP",

      url: product.link,

      image: null,

      sizes:
        product.item_catalogue?.map(
          item => item.label
        ) || [],

      source: source.platform

    });

  });

}


module.exports = {
  scrape: scrapeProducts
};