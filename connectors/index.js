const shopify = require('./shopify');
const afc = require('./afc');
const dundeeUnited = require('./dundee_united');
const woocommerce = require('./woocommerce');


const connectors = {
  shopify,
  afc,
  dundee_united: dundeeUnited,
  woocommerce
};


function getConnector(platform) {
  return connectors[platform];
}


module.exports = {
  getConnector
};