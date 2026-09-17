const fs = require("fs");
const path = require("path");
const { searchProducts } = require("./search/index.js");


function loadProducts() {

  const outputDirectory =
    path.join(__dirname, "output");

  if (!fs.existsSync(outputDirectory)) {
    throw new Error(
      "No output directory found. Run node index.js first."
    );
  }


  const files =
    fs.readdirSync(outputDirectory)
      .filter(file =>
        file.endsWith(".json")
      );


  const products = [];


  for (const file of files) {

    const filePath =
      path.join(outputDirectory, file);

    const data =
      JSON.parse(
        fs.readFileSync(
          filePath,
          "utf8"
        )
      );

    products.push(...data);
  }


  return products;
}


function parseArguments(args = []) {

  const filters = {};


  for (
    let index = 0;
    index < args.length;
    index++
  ) {

    const argument =
      args[index];

    const value =
      args[index + 1];


    if (!argument.startsWith("--")) {
      continue;
    }


    if (
      value === undefined ||
      value.startsWith("--")
    ) {
      continue;
    }


    switch (argument) {

      case "--club":
        filters.club = value;
        break;

      case "--age":
        filters.age = Number(value);
        break;

      case "--product":
        filters.product = value;
        break;

      case "--kit":
        filters.kit = value;
        break;

      case "--max-price":
        filters.maxPrice = Number(value);
        break;

    }


    index++;
  }


  return filters;
}


function printResults(results = []) {

  if (!results.length) {
    console.log(
      "\nNo matching products found.\n"
    );

    return;
  }


  console.log(
    `\nFound ${results.length} matching product(s):\n`
  );


  for (const product of results) {

    console.log(
      `${product.club} — ${product.name}`
    );

    console.log(
      `£${product.price}`
    );

    console.log(
      `Kit: ${product.kit || "Unknown"}`
    );

    console.log(
      `Product: ${product.product}`
    );

    console.log(
      `Sizes: ${
        product.sizes?.join(", ") ||
        "Unknown"
      }`
    );

    console.log(
      product.url || ""
    );

    console.log("");
  }

}


function run() {

  const products =
    loadProducts();

  const filters =
    parseArguments(
      process.argv.slice(2)
    );


  if (!Object.keys(filters).length) {

    console.log(`
Football Kit Finder

Example:

node search.js --club "Aberdeen FC" --age 5 --product "Full Kit" --max-price 70

Available filters:

--club
--age
--product
--kit
--max-price
`);

    return;
  }


  const results =
    searchProducts(
      products,
      filters
    );


  printResults(results);
}


run();