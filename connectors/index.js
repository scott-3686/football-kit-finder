const shopify = require('./shopify');
const afc = require('./afc');

const connectors = {
  shopify,
  afc
};

function getConnector(platform) {
  return connectors[platform];
}

module.exports = {
  getConnector
};