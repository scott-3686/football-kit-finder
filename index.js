const fs = require('fs');
const path = require('path');
const { getConnector } = require('./connectors');
const { normaliseProduct } = require('./normalisers/product');


const sources = JSON.parse(
  fs.readFileSync('./config/sources.json', 'utf8')
);



function dedupeProducts(products) {

  const seen = new Map();


  for (const product of products) {

   const key = [
  product.club,
  product.name,
  product.price
]
  .join("|")
  .toLowerCase();


    if (!seen.has(key)) {
      seen.set(key, product);
    }

  }


  return Array.from(seen.values());

}



async function run() {

  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
  }


  for (const source of sources) {

    const connector = getConnector(source.platform);


    if (!connector) {
      console.log(
        `No connector found for ${source.platform}`
      );
      continue;
    }


    console.log(
      `Fetching ${source.name} products`
    );


    const products = await connector.scrape(source);


    const normalised = products.map(product =>
      normaliseProduct(product)
    );


    const deduped = dedupeProducts(normalised);


    console.log(
      `${source.name}: ${products.length} raw products`
    );


    console.log(
      `${source.name}: ${deduped.length} after dedupe`
    );


    const filename =
      source.name
        .toLowerCase()
        .replace(/\s+/g, '-') + '.json';


    fs.writeFileSync(
      path.join('./output', filename),
      JSON.stringify(
        deduped,
        null,
        2
      )
    );


    console.log(
      `Saved to output/${filename}`
    );

  }

}


run().catch(console.error);