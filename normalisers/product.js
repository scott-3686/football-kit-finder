function normaliseProduct(product = {}) {

  const name =
    product.name ||
    product.title ||
    "";

  const sizes =
    normaliseSizes(product.sizes || []);

  return {
    club:
      product.club ||
      product.team ||
      product.source ||
      "Unknown",

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

    age_range:
      extractAgeRange(sizes),

    size_type:
      product.size_type || null,

    price:
      Number(product.price || 0),

    sizes,

    url:
      product.url || null
  };

}


function normaliseSizes(sizes = []) {

  const cleaned = sizes
    .map(size => {

      const value =
        String(size).trim();

      if (!value) {
        return null;
      }

      if (value.toLowerCase() === "no colour") {
        return null;
      }

      if (value.includes(" / ")) {

        const parts =
          value.split(" / ");

        return parts[
          parts.length - 1
        ].trim();
      }

      return value;

    })
    .filter(Boolean);


  return [...new Set(cleaned)];

}


function extractAgeRange(sizes = []) {

  const ranges = [];


  for (const size of sizes) {

    const value =
      String(size)
        .trim()
        .toUpperCase();


    // Months: 3/6M, 6/9M, 9/12M
    const monthMatch =
      value.match(/^(\d+)\s*\/\s*(\d+)M$/);

    if (monthMatch) {
      ranges.push({
        min: Number(monthMatch[1]),
        max: Number(monthMatch[2])
      });

      continue;
    }


    // Years: 1/2Y, 3/4Y, 5/6Y
    const yearMatch =
      value.match(/^(\d+)\s*\/\s*(\d+)Y$/);

    if (yearMatch) {
      ranges.push({
        min: Number(yearMatch[1]) * 12,
        max: Number(yearMatch[2]) * 12
      });
    }

  }


  if (!ranges.length) {
    return null;
  }


  return {
    min_months:
      Math.min(...ranges.map(range => range.min)),

    max_months:
      Math.max(...ranges.map(range => range.max))
  };

}


function extractSeason(name = "") {

  const match =
    name.match(/\d{2}\/\d{2}/);

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

  const text =
    name.toLowerCase();

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


  if (
    text.includes("baby") ||
    text.includes("infant") ||
    text.includes("mini")
  ) {
    return "Baby / Infant";
  }


  if (
    text.includes("youth") ||
    text.includes("junior") ||
    text.includes("jnr") ||
    text.includes("kids")
  ) {
    return "Youth";
  }


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