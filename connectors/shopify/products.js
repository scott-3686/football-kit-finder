const puppeteer = require('puppeteer');
const Product = require('../../models/product');

async function scrapeProducts(source) {

  console.log(`Fetching Shopify products for ${source.name}`);

  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(
    `${source.url}/collections/all`,
    {
      waitUntil: 'networkidle2'
    }
  );

  const products = await page.evaluate(() => {

    const cards = Array.from(
      document.querySelectorAll('a[href*="/products/"]')
    );

    return cards.map(card => {

      const text = card.innerText
        .replace(/\s+/g, ' ')
        .trim();

      const price = text.match(/£\d+\.\d+/);

      return {
        name: text
          .replace(/£\d+\.\d+/g, '')
          .trim(),

        price: price ? price[0] : null,

        url: card.href,

        image: card.querySelector('img')?.src || null
      };

    }).filter(product => product.name);

  });

  await browser.close();

  return products.map(product => new Product({
    ...product,
    club: source.name,
    source: source.platform
  }));

}

module.exports = scrapeProducts;