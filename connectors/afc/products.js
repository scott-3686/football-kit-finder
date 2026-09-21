const LISTINGS = [
  {
    category: 'Home Kit',
    id: 8,
    subids: [11, 12]
  },
  {
    category: 'Away Kit',
    id: 26,
    subids: [100, 101, 345]
  },
  {
    category: 'Goalkeeper Kit',
    id: 19,
    subids: [52, 53]
  }
];


async function fetchListing(
  id,
  subid = ''
) {
  const body =
    `id=${id}` +
    `&subid=${subid}` +
    `&star_shirt=Y` +
    `&display_oos=N` +
    `&websales_brch=300` +
    `&listing_type=234` +
    `&quickview=Y` +
    `&start=0`;


  const response =
    await fetch(
      'https://shop.afc.co.uk/api/product/catalogue/list/getdetails.php',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body
      }
    );


  const text =
    await response.text();


  if (
    !text.startsWith('{')
  ) {
    console.log(
      'Skipping invalid AFC response'
    );

    return null;
  }


  return JSON.parse(text);
}


function getAgeGroup(subid) {
  if (
    [11, 100, 52]
      .includes(subid)
  ) {
    return 'Adult';
  }


  if (
    [12, 101, 53]
      .includes(subid)
  ) {
    return 'Youth';
  }


  if (subid === 345) {
    return 'Baby / Infant';
  }


  return 'Unknown';
}


function getSourceProductId(
  product = {}
) {
  const candidates = [
    product.id,
    product.product_id,
    product.productId,
    product.product_code,
    product.code,
    product.stockcode,
    product.stock_code,
    product.sku
  ];


  const explicitId =
    candidates.find(
      value =>
        value !== undefined &&
        value !== null &&
        value !== ''
    );


  if (
    explicitId !== undefined
  ) {
    return String(
      explicitId
    );
  }


  if (product.link) {
    return String(
      product.link
    );
  }


  return null;
}


function mapProduct(
  product,
  category,
  ageGroup,
  source
) {
  const name =
    product.title ||
    product.altText ||
    '';


  let productType =
    'Other';


  const lowerName =
    name.toLowerCase();


  if (
    lowerName.includes(
      'baby kit'
    ) ||
    lowerName.includes(
      'infant kit'
    ) ||
    lowerName.includes(
      'mini kit'
    ) ||
    lowerName.includes(
      'full kit'
    )
  ) {
    productType =
      'Full Kit';

  } else if (
    lowerName.includes(
      'jersey'
    )
  ) {
    productType =
      'Shirt';

  } else if (
    lowerName.includes(
      'short'
    )
  ) {
    productType =
      'Shorts';

  } else if (
    lowerName.includes(
      'sock'
    )
  ) {
    productType =
      'Socks';
  }


  const sizes =
    (
      product.item_catalogue ||
      []
    )
      .map(item =>
        item.label
      )
      .filter(Boolean);


  return {
    club:
      source.name,

    kit:
      category,

    product:
      productType,

    age_group:
      ageGroup,

    name,

    price:
      Number(
        product.price?.rrp ||
        0
      ),

    sizes:
      [
        ...new Set(sizes)
      ],

    url:
      product.link,

    source:
      source.platform,

    source_product_id:
      getSourceProductId(
        product
      )
  };
}


async function scrape(source) {
  const products = [];


  for (
    const listing
    of LISTINGS
  ) {
    for (
      const subid
      of listing.subids
    ) {
      console.log(
        `Fetching AFC ${listing.category} ${subid}`
      );


      const data =
        await fetchListing(
          listing.id,
          subid
        );


      if (
        !data?.results?.docs
      ) {
        continue;
      }


      const ageGroup =
        getAgeGroup(
          subid
        );


      for (
        const product
        of data.results.docs
      ) {
        products.push(
          mapProduct(
            product,
            listing.category,
            ageGroup,
            source
          )
        );
      }
    }
  }


  return products;
}


module.exports = {
  scrape
};