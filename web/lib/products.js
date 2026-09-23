import fs from 'node:fs';
import path from 'node:path';

import {
  getClubMetadata
} from './clubs';


export function loadProducts() {
  const outputDirectory =
    path.resolve(
      process.cwd(),
      '..',
      'output'
    );


  if (
    !fs.existsSync(
      outputDirectory
    )
  ) {
    return [];
  }


  const files =
    fs.readdirSync(
      outputDirectory
    )
      .filter(file =>
        file.endsWith('.json')
      )
      .sort();


  const products = [];


  for (const file of files) {
    const filePath =
      path.join(
        outputDirectory,
        file
      );


    const data =
      JSON.parse(
        fs.readFileSync(
          filePath,
          'utf8'
        )
      );


    if (!Array.isArray(data)) {
      continue;
    }


    for (const product of data) {
      const metadata =
        getClubMetadata(
          product.club
        );


      products.push({
        ...product,

        country:
          metadata.country,

        league:
          metadata.league
      });
    }
  }


  return products;
}