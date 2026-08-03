const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto(
    'https://www.stmirrendirect.co.uk/products/jnr-smfc-26-27-home-jersey-s-s',
    {
      waitUntil: 'networkidle2'
    }
  );

  await new Promise(resolve => setTimeout(resolve, 3000));

  const data = await page.evaluate(() => {

    const sizeElements = Array.from(document.querySelectorAll('*'))
      .filter(el =>
        ['3XS', 'XXS'].some(size => el.innerText?.trim() === size)
      )
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.innerText
      }));

    return sizeElements;

  });

  console.log(data);

  await browser.close();

})();