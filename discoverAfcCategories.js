const categories = [
  "https://shop.afc.co.uk/kits/home/adult/",
  "https://shop.afc.co.uk/kits/home/youth/",
  "https://shop.afc.co.uk/kits/home/babyinfant/",

  "https://shop.afc.co.uk/kits/away-kit/adults/",
  "https://shop.afc.co.uk/kits/away-kit/youth/",
  "https://shop.afc.co.uk/kits/away-kit/babyinfant/",

  "https://shop.afc.co.uk/kits/gk-kit/adult/",
  "https://shop.afc.co.uk/kits/gk-kit/youth/"
];


async function getListingId(url) {

  const response = await fetch(url);
  const html = await response.text();

  const match = html.match(
    /var dataString = 'id=' \+ '(\d+)'/
  );

  return {
    url,
    id: match ? Number(match[1]) : null
  };
}


async function run() {

  for (const category of categories) {

    const result = await getListingId(category);
    console.log(result);

  }

}


run().catch(console.error);
