const shopify = require('./shopify/products');

const connectors = {
  shopify
};

function getConnector(platform) {
  return connectors[platform];
}

module.exports = {
  getConnector
};