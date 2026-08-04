const fs = require('fs');
const path = require('path');
const { getConnector } = require('./connectors');

const sources = JSON.parse(
  fs.readFileSync('./config/sources.json', 'utf8')
);

async function run() {

  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
  }

  for (const source of sources) {

    const connector = getConnector(source.platform);

    if (!connector) {
      console.log(`No connector found for ${source.platform}`);
      continue;
    }

    const products = await connector.scrape(source);

    console.log(`${source.name}: ${products.length} products found`);

    const filename =
      source.name
        .toLowerCase()
        .replace(/\s+/g, '-') + '.json';

    fs.writeFileSync(
      path.join('./output', filename),
      JSON.stringify(products, null, 2)
    );

    console.log(`Saved to output/${filename}`);
  }

}

run().catch(console.error);