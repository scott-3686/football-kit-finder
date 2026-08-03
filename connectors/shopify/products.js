const puppeteer = require('puppeteer');
const Product = require('../../models/product');

async function scrapeProducts(source) {

  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(source.url, {
    waitUntil: 'networkidle2'
  });

  const products = await page.evaluate(() => {

    return [];

  });

  await browser.close();

  return products.map(product => new Product({
    ...product,
    club: source.name,
    source: source.platform
  }));

}

module.exports = scrapeProducts;