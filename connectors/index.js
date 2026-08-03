const shopify = require('./shopify');

const connectors = {
  shopify
};

function getConnector(platform) {
  return connectors[platform];
}

module.exports = {
  getConnector
};