const BASE_URL = 'https://shop.dundeeunitedfc.co.uk';

const categoryUrls = [
  'https://shop.dundeeunitedfc.co.uk/browse/c-Replica-14/?view_all=true'
];

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
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText} - ${url}`
    );
  }

  return response.text();
}

async function getProductLinks(categoryUrl) {
  const html = await getHtml(categoryUrl);

  return [
    ...new Set(
      [
        ...html.matchAll(
          /href=["']([^"']*\/item\/\d+\/[^"']+)["']/gi
        )
      ].map(match => new URL(match[1], BASE_URL).href)
    )
  ];
}

function extractSizes(html) {
  const sizeSelect = html.match(
    /<select\b[^>]*class=["'][^"']*itemSizes[^"']*["'][^>]*>([\s\S]*?)<\/select>/i
  );

  if (!sizeSelect) {
    return [];
  }

  return [
    ...sizeSelect[1].matchAll(
      /<option\b([^>]*)>([\s\S]*?)<\/option>/gi
    )
  ]
    .map(match => {
      const attributes = match[1];
      const text = cleanText(match[2]);

      const valueMatch = attributes.match(
        /value=["']([^"']*)["']/i
      );

      if (
        !valueMatch ||
        !valueMatch[1] ||
        /select your size/i.test(text)
      ) {
        return null;
      }

      const size = text
        .replace(/\s*-\s*£[\d,.]+.*$/i, '')
        .trim();

      return {
        size,
        id: valueMatch[1]
      };
    })
    .filter(Boolean);
}

function extractPrice(html) {
  const sizeSelect = html.match(
    /<select\b[^>]*class=["'][^"']*itemSizes[^"']*["'][^>]*>([\s\S]*?)<\/select>/i
  );

  if (sizeSelect) {
    const cleaned = cleanText(sizeSelect[1]);
    const priceMatch = cleaned.match(/£([\d,.]+)/);

    if (priceMatch) {
      return Number(
        priceMatch[1].replace(',', '')
      );
    }
  }

  const generalPriceMatch = cleanText(html).match(
    /£([\d,.]+)/
  );

  return generalPriceMatch
    ? Number(generalPriceMatch[1].replace(',', ''))
    : null;
}

function extractName(html) {
  const h1Match = html.match(
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
  );

  if (h1Match) {
    return cleanText(h1Match[1]);
  }

  const titleMatch = html.match(
    /<title\b[^>]*>([\s\S]*?)<\/title>/i
  );

  return titleMatch
    ? cleanText(titleMatch[1])
    : null;
}

function extractImage(html) {
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

  let imagePath = ogImageMatch[1].trim();

  /*
   * Dundee United currently outputs malformed URLs such as:
   *
   * https://shop.dundeeunitedfc.co.ukuploads/images/...
   *
   * Fix that before doing anything else.
   */
  imagePath = imagePath.replace(
    /^https?:\/\/shop\.dundeeunitedfc\.co\.ukuploads\//i,
    `${BASE_URL}/uploads/`
  );

  /*
   * Also handle a plain relative path such as:
   *
   * uploads/images/...
   */
  if (
    !imagePath.startsWith('http://') &&
    !imagePath.startsWith('https://') &&
    !imagePath.startsWith('/')
  ) {
    imagePath = `/${imagePath}`;
  }

  try {
    return new URL(imagePath, BASE_URL).href;
  } catch {
    return null;
  }
}

function getProductType(name = '') {
  const text = name.toLowerCase();

  if (
    text.includes('infant kit') ||
    text.includes('mini kit')
  ) {
    return 'kit';
  }

  if (
    text.includes('shirt') ||
    text.includes(' ss ') ||
    text.includes(' ls ') ||
    text.endsWith(' ss') ||
    text.endsWith(' ls')
  ) {
    return 'shirt';
  }

  if (text.includes('short')) {
    return 'shorts';
  }

  if (text.includes('sock')) {
    return 'socks';
  }

  if (text.includes('glove')) {
    return 'gloves';
  }

  return 'other';
}

function getKitType(name = '') {
  const text = name.toLowerCase();

  if (text.includes('goalkeeper')) {
    return 'goalkeeper';
  }

  if (text.includes('away')) {
    return 'away';
  }

  if (text.includes('home')) {
    return 'home';
  }

  if (text.includes('third')) {
    return 'third';
  }

  return 'other';
}

function isKidsProduct(name, sizes) {
  const sizeText = sizes
    .map(item => item.size)
    .join(' ');

  const text =
    `${name || ''} ${sizeText}`.toLowerCase();

  const isKids =
    text.includes('junior') ||
    text.includes('infant') ||
    /\b\d+\s*-\s*\d+y\b/i.test(text) ||
    /\b\d+y\b/i.test(text) ||
    /\b\d+\s*-\s*\d+m\b/i.test(text);

  const productType = getProductType(name);

  const isRelevantProduct =
    productType === 'shirt' ||
    productType === 'kit';

  return isKids && isRelevantProduct;
}

async function scrapeProduct(url) {
  const html = await getHtml(url);

  const name = extractName(html);
  const sizeOptions = extractSizes(html);

  return {
    club: 'Dundee United',
    name,
    kitType: getKitType(name),
    productType: getProductType(name),
    price: extractPrice(html),
    sizes: sizeOptions.map(item => item.size),
    sizeOptions,
    image: extractImage(html),
    url
  };
}

async function main() {
  const allLinks = new Set();

  for (const categoryUrl of categoryUrls) {
    console.log(
      `Checking category: ${categoryUrl}`
    );

    const links =
      await getProductLinks(categoryUrl);

    links.forEach(link => {
      allLinks.add(link);
    });
  }

  console.log(
    `\nProducts found: ${allLinks.size}\n`
  );

  const products = [];

  for (const url of allLinks) {
    try {
      console.log(`Scraping: ${url}`);

      const product =
        await scrapeProduct(url);

      if (
        isKidsProduct(
          product.name,
          product.sizeOptions
        )
      ) {
        products.push(product);
      }
    } catch (error) {
      console.error(
        `Failed: ${url}`
      );

      console.error(
        error.message
      );
    }
  }

  console.log(
    '\n--- KIDS SHIRTS / KITS ---\n'
  );

  console.log(
    JSON.stringify(products, null, 2)
  );

  console.log(
    `\nKids shirts/kits found: ${products.length}`
  );
}

main().catch(console.error);