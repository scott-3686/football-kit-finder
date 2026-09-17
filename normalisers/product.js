function normaliseProduct(product = {}) {

  const name =
    product.name ||
    product.title ||
    "";

  return {
    club: product.club || product.source || "Unknown",

    name,

    season:
      product.season ||
      extractSeason(name),

    kit:
      product.kit ||
      extractKit(product, name),

    product:
      product.product ||
      extractProductType(name),

    age_group:
      product.age_group ||
      extractAgeGroup(product, name),

    size_type:
      product.size_type || null,

    price: Number(product.price || 0),

    sizes:
      product.sizes || [],

    url:
      product.url || null
  };

}


function extractSeason(name = "") {

  const match = name.match(/\d{2}\/\d{2}/);

  if (!match) {
    return null;
  }

  return `${match[0]}`;

}


function extractKit(product = {}, name = "") {

  const text =
    JSON.stringify(product).toLowerCase() +
    name.toLowerCase();

  if (text.includes("home")) {
    return "Home Kit";
  }

  if (text.includes("away")) {
    return "Away Kit";
  }

  if (
    text.includes("goalkeeper") ||
    text.includes("gk")
  ) {
    return "Goalkeeper Kit";
  }

  return null;

}


function extractProductType(name = "") {

  const text = name.toLowerCase();

  // Bundles first - these are actual complete kits
  if (
    text.includes("mini kit") ||
    text.includes("infant kit") ||
    text.includes("baby kit") ||
    text.includes("toddler kit") ||
    text.includes("full kit") ||
    text.includes("kit set") ||
    text.includes("bundle")
  ) {
    return "Full Kit";
  }

  // Individual items
  if (
    text.includes("jersey") ||
    text.includes("shirt") ||
    text.includes("top")
  ) {
    return "Shirt";
  }

  if (text.includes("short")) {
    return "Shorts";
  }

  if (text.includes("sock")) {
    return "Socks";
  }

  return "Other";

}


function extractAgeGroup(product = {}, name = "") {

  const text =
    JSON.stringify(product).toLowerCase() +
    name.toLowerCase();

  const sizes =
    JSON.stringify(
      product.sizes ||
      product.item_catalogue ||
      product.size ||
      ""
    ).toLowerCase();


  // Baby / Infant
  if (
    text.includes("baby") ||
    text.includes("infant") ||
    text.includes("mini")
  ) {
    return "Baby / Infant";
  }


  // Youth / Junior
  if (
    text.includes("youth") ||
    text.includes("junior") ||
    text.includes("jnr") ||
    text.includes("kids")
  ) {
    return "Youth";
  }


  // Sock size ranges are a useful AFC clue
  if (
    sizes.includes("10.5") ||
    sizes.includes("2.5") ||
    sizes.includes("5.5")
  ) {
    return "Youth";
  }


  if (text.includes("adult")) {
    return "Adult";
  }


  return "Unknown";

}


module.exports = {
  normaliseProduct
};