function cleanText(text = '') {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&pound;/gi, '£')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


async function getHtml(url) {
  const response =
    await fetch(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
    );


  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText} - ${url}`
    );
  }


  return response.text();
}


function getProductLinks(
  html,
  baseUrl
) {
  return [
    ...new Set(
      [
        ...html.matchAll(
          /href=["']([^"']*\/item\/\d+\/[^"']+)["']/gi
        )
      ].map(match =>
        new URL(
          match[1],
          baseUrl
        ).href
      )
    )
  ];
}


function getSourceProductId(
  url
) {
  const match =
    String(url).match(
      /\/item\/(\d+)\//
    );


  return match
    ? match[1]
    : String(url);
}


function extractSizeOptions(html) {
  const sizeSelect =
    html.match(
      /<select\b[^>]*class=["'][^"']*itemSizes[^"']*["'][^>]*>([\s\S]*?)<\/select>/i
    );


  if (!sizeSelect) {
    return [];
  }


  return [
    ...sizeSelect[1]
      .matchAll(
        /<option\b([^>]*)>([\s\S]*?)<\/option>/gi
      )
  ]
    .map(match => {
      const attributes =
        match[1];

      const text =
        cleanText(
          match[2]
        );


      const valueMatch =
        attributes.match(
          /value=["']([^"']*)["']/i
        );


      if (
        !valueMatch ||
        !valueMatch[1] ||
        /select your size/i
          .test(text)
      ) {
        return null;
      }


      const size =
        text
          .replace(
            /\s*-\s*£[\d,.]+.*$/i,
            ''
          )
          .trim();


      return {
        size,
        id:
          valueMatch[1]
      };
    })
    .filter(Boolean);
}


function extractPrice(html) {
  const sizeSelect =
    html.match(
      /<select\b[^>]*class=["'][^"']*itemSizes[^"']*["'][^>]*>([\s\S]*?)<\/select>/i
    );


  if (sizeSelect) {
    const priceMatch =
      cleanText(
        sizeSelect[1]
      ).match(
        /£([\d,.]+)/
      );


    if (priceMatch) {
      return Number(
        priceMatch[1]
          .replace(',', '')
      );
    }
  }


  const generalPriceMatch =
    cleanText(html)
      .match(
        /£([\d,.]+)/
      );


  return generalPriceMatch
    ? Number(
        generalPriceMatch[1]
          .replace(',', '')
      )
    : 0;
}


function extractName(html) {
  const h1Match =
    html.match(
      /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
    );


  if (h1Match) {
    return cleanText(
      h1Match[1]
    );
  }


  const titleMatch =
    html.match(
      /<title\b[^>]*>([\s\S]*?)<\/title>/i
    );


  return titleMatch
    ? cleanText(
        titleMatch[1]
      )
    : '';
}


function extractImage(
  html,
  baseUrl
) {
  const ogImageMatch =
    html.match(
      /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    ) ||
    html.match(
      /<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );


  if (!ogImageMatch) {
    return null;
  }


  let imagePath =
    ogImageMatch[1]
      .trim();


  imagePath =
    imagePath.replace(
      /^https?:\/\/shop\.dundeeunitedfc\.co\.ukuploads\//i,
      'https://shop.dundeeunitedfc.co.uk/uploads/'
    );


  if (
    !imagePath.startsWith(
      'http://'
    ) &&
    !imagePath.startsWith(
      'https://'
    ) &&
    !imagePath.startsWith('/')
  ) {
    imagePath =
      `/${imagePath}`;
  }


  try {
    return new URL(
      imagePath,
      baseUrl
    ).href;

  } catch {
    return null;
  }
}


function getProductType(
  name = ''
) {
  const text =
    name.toLowerCase();


  if (
    text.includes(
      'infant kit'
    ) ||
    text.includes(
      'mini kit'
    ) ||
    text.includes(
      'baby kit'
    ) ||
    text.includes(
      'full kit'
    )
  ) {
    return 'Full Kit';
  }


  if (
    text.includes('shirt') ||
    text.includes('jersey') ||
    text.includes(' ss ') ||
    text.includes(' ls ') ||
    text.endsWith(' ss') ||
    text.endsWith(' ls')
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


  if (
    text.includes('glove')
  ) {
    return 'Gloves';
  }


  return 'Other';
}


function getKitType(
  name = ''
) {
  const text =
    name.toLowerCase();


  if (
    text.includes(
      'goalkeeper'
    ) ||
    text.includes(
      ' gk '
    )
  ) {
    return 'Goalkeeper Kit';
  }


  if (
    text.includes('home')
  ) {
    return 'Home Kit';
  }


  if (
    text.includes('away')
  ) {
    return 'Away Kit';
  }


  if (
    text.includes('third')
  ) {
    return 'Third Kit';
  }


  return null;
}


function getAgeGroup(
  name = '',
  sizeOptions = []
) {
  const sizeText =
    sizeOptions
      .map(option =>
        option.size
      )
      .join(' ');


  const text =
    `${name} ${sizeText}`
      .toLowerCase();


  if (
    text.includes('infant') ||
    text.includes('baby') ||
    /\b\d+\s*-\s*\d+m\b/i
      .test(text)
  ) {
    return 'Baby / Infant';
  }


  if (
    text.includes('junior') ||
    text.includes('youth') ||
    text.includes('kids') ||
    /\b\d+\s*-\s*\d+y\b/i
      .test(text)
  ) {
    return 'Youth';
  }


  if (
    text.includes('adult')
  ) {
    return 'Adult';
  }


  return 'Unknown';
}


function isRelevantKidsProduct(
  name,
  sizeOptions
) {
  const ageGroup =
    getAgeGroup(
      name,
      sizeOptions
    );


  const productType =
    getProductType(
      name
    );


  const isChildProduct =
    ageGroup === 'Youth' ||
    ageGroup ===
      'Baby / Infant';


  const isRelevantType =
    productType ===
      'Shirt' ||
    productType ===
      'Full Kit';


  return (
    isChildProduct &&
    isRelevantType
  );
}


async function scrapeProduct(
  url,
  source
) {
  const html =
    await getHtml(url);


  const name =
    extractName(html);


  const sizeOptions =
    extractSizeOptions(
      html
    );


  return {
    club:
      source.name,

    name,

    kit:
      getKitType(name),

    product:
      getProductType(name),

    age_group:
      getAgeGroup(
        name,
        sizeOptions
      ),

    price:
      extractPrice(html),

    sizes:
      sizeOptions.map(
        option =>
          option.size
      ),

    image:
      extractImage(
        html,
        source.url
      ),

    url,

    source:
      source.platform,

    source_product_id:
      getSourceProductId(
        url
      )
  };
}


async function scrape(source) {
  const listingUrl =
    source.listing
      ? new URL(
          source.listing,
          source.url
        ).href
      : new URL(
          '/browse/c-Replica-14/?view_all=true',
          source.url
        ).href;


  console.log(
    `Fetching Dundee United listing: ${listingUrl}`
  );


  const listingHtml =
    await getHtml(
      listingUrl
    );


  const links =
    getProductLinks(
      listingHtml,
      source.url
    );


  console.log(
    `Dundee United: ${links.length} product links found`
  );


  const products = [];


  for (const url of links) {
    try {
      const product =
        await scrapeProduct(
          url,
          source
        );


      if (
        isRelevantKidsProduct(
          product.name,
          product.sizes.map(
            size => ({
              size
            })
          )
        )
      ) {
        products.push(
          product
        );
      }

    } catch (error) {
      console.error(
        `Dundee United product failed: ${url}`
      );

      console.error(
        error.message
      );
    }
  }


  return products;
}


module.exports = {
  scrape
};