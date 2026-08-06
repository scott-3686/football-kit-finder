const LISTINGS = [
  {
    category: "Home Kit",
    id: 8,
    subids: [11, 12]
  },
  {
    category: "Away Kit",
    id: 26,
    subids: [100, 101, 345]
  },
  {
    category: "Goalkeeper Kit",
    id: 19,
    subids: [52, 53]
  }
];


async function fetchListing(id, subid = "") {

  const body =
    `id=${id}` +
    `&subid=${subid}` +
    `&star_shirt=Y` +
    `&display_oos=N` +
    `&websales_brch=300` +
    `&listing_type=234` +
    `&quickview=Y` +
    `&start=0`;


  const response = await fetch(
    "https://shop.afc.co.uk/api/product/catalogue/list/getdetails.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );


  const text = await response.text();


  if (!text.startsWith("{")) {
    console.log("Skipping invalid AFC response");
    return null;
  }


  return JSON.parse(text);

}



function mapProduct(product, category) {

  const name = product.title || product.altText || "";

  let productType = "Other";

  if (name.toLowerCase().includes("jersey")) {
    productType = "Jersey";
  } else if (name.toLowerCase().includes("short")) {
    productType = "Shorts";
  } else if (name.toLowerCase().includes("sock")) {
    productType = "Socks";
  }


  let ageGroup = "Unknown";

  if (name.toLowerCase().includes("adult")) {
    ageGroup = "Adult";
  } else if (name.toLowerCase().includes("youth")) {
    ageGroup = "Youth";
  } else if (name.toLowerCase().includes("baby") || name.toLowerCase().includes("infant")) {
    ageGroup = "Baby / Infant";
  }


  const sizes = (product.item_catalogue || [])
    .map(item => item.label)
    .filter(Boolean);


  return {
    club: "Aberdeen FC",
    season: name.substring(0, 4),
    kit: category,
    product: productType,
    age_group: ageGroup,
    name,
    price: Number(product.price?.rrp || 0),
    sizes: [...new Set(sizes)],
    url: product.link
  };

}



async function scrape() {

  const products = [];


  for (const listing of LISTINGS) {

    for (const subid of listing.subids) {

      console.log(
        `Fetching AFC ${listing.category} ${subid}`
      );


      const data = await fetchListing(
        listing.id,
        subid
      );


      if (!data?.results?.docs) {
        continue;
      }


      for (const product of data.results.docs) {

        products.push(
          mapProduct(product, listing.category)
        );

      }

    }

  }


  return products;

}


module.exports = {
  scrape
};