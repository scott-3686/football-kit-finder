const fs = require('fs');
const { getConnector } = require('./connectors');


const sources = JSON.parse(
  fs.readFileSync('./config/sources.json')
);


async function run() {

  for (const source of sources) {

    const connector = getConnector(source.platform);

    if (!connector) {
      console.log(
        `No connector found for ${source.platform}`
      );
      continue;
    }

    const products = await connector.scrape(source);

    console.log(
      `${source.name}: ${products.length} products found`
    );

  }

}


run();