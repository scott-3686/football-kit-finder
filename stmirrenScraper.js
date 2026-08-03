const puppeteer = require('puppeteer');
const fs = require('fs');

const collections = [
  'https://www.stmirrendirect.co.uk/collections/home-kit?active=filter-Junior',
  'https://www.stmirrendirect.co.uk/collections/away-kit?active=filter-Junior',
  'https://www.stmirrendirect.co.uk/collections/third-kit?active=filter-Junior',
  'https://www.stmirrendirect.co.uk/collections/sale'
];

(async () => {

  const browser = await puppeteer.launch({
    headless: false
  });

  const allProducts = [];

  for (const url of collections) {

    console.log(`Scraping ${url}`);

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle2'
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

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
            .replace(/View/g, '')
            .replace(/£\d+\.\d+/g, '')
            .trim(),
          price: price ? price[0] : null,
          url: card.href,
          image: card.querySelector('img')?.src
        };

      }).filter(product => product.price);

    });

    allProducts.push(...products);

    await page.close();
  }

  // remove duplicates
  const uniqueProducts = [
    ...new Map(
      allProducts.map(p => [p.url, p])
    ).values()
  ];

  fs.writeFileSync(
    'stmirren-junior-kits.json',
    JSON.stringify(uniqueProducts, null, 2)
  );

  console.log(`Saved ${uniqueProducts.length} products`);

  await browser.close();

})();