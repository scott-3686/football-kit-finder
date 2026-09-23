import SearchClient
  from './SearchClient';

import {
  loadProducts
} from '../lib/products';


export default function Home() {
  const products =
    loadProducts();


  return (
    <SearchClient
      products={products}
    />
  );
}