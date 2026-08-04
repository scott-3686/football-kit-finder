const {
  getKitType,
  getProductCategory,
  getAgeRange
} = require('./utils/classifier');


const products = [
  'JNR SMFC 26/27 Home Jersey S/S',
  'Kids Away Shirt 5-6 Years',
  'Players Training 1/4 Zip',
  'SMFC Home Sock'
];


products.forEach(product => {

  console.log(product);

  console.log({
    kit: getKitType(product),
    category: getProductCategory(product),
    age: getAgeRange(product)
  });

});
