const LISTINGS = [
  {
    category: 'Home Kit',
    ageGroup: 'Youth',
    id: 8,
    subid: 12
  },
  {
    category: 'Home Kit',
    ageGroup: 'Baby / Infant',
    id: 8,
    subid: 344
  },
  {
    category: 'Away Kit',
    ageGroup: 'Youth',
    id: 26,
    subid: 101
  },
  {
    category: 'Away Kit',
    ageGroup: 'Baby / Infant',
    id: 26,
    subid: 345
  },
  {
    category: 'Third Kit',
    ageGroup: 'Youth',
    id: 35,
    subid: 119
  },
  {
    category: 'Third Kit',
    ageGroup: 'Baby / Infant',
    id: 35,
    subid: 346
  },
  {
    category: 'Goalkeeper Kit',
    ageGroup: 'Youth',
    id: 19,
    subid: 53
  }
];


async function fetchListing(
  id,
  subid
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


  const response = await fetch(
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
      `Skipping invalid AFC response for ${id}/${subid}`
    );

    return null;
  }


  return JSON.parse(text);
}


function getProductType(
  name = ''
) {
  const text =
    name.toLowerCase();


  if (
    text.includes('baby kit') ||
    text.includes('infant kit') ||
    text.includes('mini kit') ||
    text.includes('full kit')
  ) {
    return 'Full Kit';
  }


  if (
    text.includes('jersey') ||
    text.includes('shirt')
  ) {
    return 'Shirt';
  }


  if (
    text.includes('short')
  ) {
    return 'Shorts';
  }


  if (
    text.includes('sock')
  ) {
    return 'Socks';
  }


  return 'Other';
}


function parsePrice(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }


  if (
    typeof value === 'number'
  ) {
    return value;
  }


  const text =
    String(value)
      .replace(
        /&pound;/gi,
        '£'
      )
      .replace(
        /<[^>]+>/g,
        ' '
      );


  const match =
    text.match(
      /£?\s*([\d,.]+)/
    );


  if (!match) {
    return null;
  }


  const price =
    Number(
      match[1]
        .replace(',', '')
    );


  return Number.isNaN(price)
    ? null
    : price;
}


function getImageUrl(
  product,
  source
) {
  const imagePath =
    product.image?.listing;


  if (!imagePath) {
    return null;
  }


  try {
    return new URL(
      imagePath,
      `${
        source.url.replace(
          /\/$/,
          ''
        )
      }/`
    ).href;

  } catch {
    return null;
  }
}


function getPricing(product) {
  const regularPrice =
    parsePrice(
      product.price?.rrp
    );


  const currentPrice =
    parsePrice(
      product.price?.now_price
    ) ??
    regularPrice;


  const discount =
    Number(
      product.price?.discount ||
      0
    );


  const onSale =
    (
      currentPrice !== null &&
      regularPrice !== null &&
      currentPrice <
        regularPrice
    ) ||
    discount > 0;


  return {
    currentPrice,

    regularPrice,

    salePrice:
      onSale
        ? currentPrice
        : null,

    onSale
  };
}


function mapVariants(
  product,
  pricing
) {
  return (
    product.item_catalogue ||
    []
  )
    .map(item => {
      const stock =
        Number(
          item.avail || 0
        );


      const available =
        item.disabled !== true &&
        stock > 0;


      return {
        id:
          item.code ||
          `${product.id}-${item.size}`,

        size:
          item.label || null,

        price:
          pricing.currentPrice,

        regular_price:
          pricing.regularPrice,

        sale_price:
          pricing.salePrice,

        on_sale:
          pricing.onSale,

        available,

        age_range:
          null
      };
    })
    .filter(
      variant =>
        variant.size
    );
}


function mapProduct(
  product,
  listing,
  source
) {
  const name =
    product.title ||
    product.altText ||
    '';


  const pricing =
    getPricing(
      product
    );


  const variants =
    mapVariants(
      product,
      pricing
    );


  const availableVariants =
    variants.filter(
      variant =>
        variant.available
    );


  const sizes = [
    ...new Set(
      availableVariants
        .map(
          variant =>
            variant.size
        )
        .filter(Boolean)
    )
  ];


  return {
    club:
      source.name,

    name,

    kit:
      listing.category,

    product:
      getProductType(
        name
      ),

    age_group:
      listing.ageGroup,

    price:
      pricing.currentPrice,

    regular_price:
      pricing.regularPrice,

    sale_price:
      pricing.salePrice,

    on_sale:
      pricing.onSale,

    currency:
      'GBP',

    available:
      availableVariants.length > 0,

    sizes,

    variants,

    image:
      getImageUrl(
        product,
        source
      ),

    url:
      product.link ||
      null,

    source:
      source.platform,

    source_product_id:
      product.id
  };
}


async function scrape(source) {
  const products = [];


  for (
    const listing
    of LISTINGS
  ) {
    console.log(
      `Fetching AFC ${listing.category} - ${listing.ageGroup}`
    );


    const data =
      await fetchListing(
        listing.id,
        listing.subid
      );


    const docs =
      data?.results?.docs ||
      [];


    console.log(
      `AFC ${listing.category} - ${listing.ageGroup}: ${docs.length} products`
    );


    for (
      const product
      of docs
    ) {
      products.push(
        mapProduct(
          product,
          listing,
          source
        )
      );
    }
  }


  return products;
}


module.exports = {
  scrape
};