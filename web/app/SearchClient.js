'use client';


import {
  useMemo,
  useState
} from 'react';

import {
  searchProducts
} from '../lib/search';


const INITIAL_FILTERS = {
  age: '',
  country: '',
  league: '',
  club: '',
  kit: '',
  product: '',
  maxPrice: '',
  inStockOnly: false,
  sort: 'price_asc'
};


function uniqueSorted(
  values = []
) {
  return [
    ...new Set(
      values.filter(Boolean)
    )
  ].sort();
}


function money(value) {
  return new Intl.NumberFormat(
    'en-GB',
    {
      style: 'currency',
      currency: 'GBP'
    }
  ).format(
    Number(value || 0)
  );
}


function availabilityLabel(
  availability
) {
  switch (availability) {
    case 'in_stock':
      return 'Confirmed in stock';

    case 'out_of_stock':
      return 'Out of stock';

    default:
      return 'Stock status unavailable';
  }
}


export default function SearchClient({
  products
}) {
  const [
    filters,
    setFilters
  ] =
    useState(
      INITIAL_FILTERS
    );


  const countries =
    useMemo(
      () =>
        uniqueSorted(
          products.map(
            product =>
              product.country
          )
        ),
      [products]
    );


  const leagues =
    useMemo(
      () =>
        uniqueSorted(
          products.map(
            product =>
              product.league
          )
        ),
      [products]
    );


  const clubs =
    useMemo(
      () =>
        uniqueSorted(
          products
            .filter(product => {
              if (
                filters.country &&
                product.country !==
                  filters.country
              ) {
                return false;
              }


              if (
                filters.league &&
                product.league !==
                  filters.league
              ) {
                return false;
              }


              return true;
            })
            .map(
              product =>
                product.club
            )
        ),
      [
        products,
        filters.country,
        filters.league
      ]
    );


  const kits =
    useMemo(
      () =>
        uniqueSorted(
          products.map(
            product =>
              product.kit
          )
        ),
      [products]
    );


  const productTypes =
    useMemo(
      () =>
        uniqueSorted(
          products.map(
            product =>
              product.product
          )
        ),
      [products]
    );


  const results =
    useMemo(
      () =>
        searchProducts(
          products,
          filters
        ),
      [
        products,
        filters
      ]
    );


  function updateFilter(
    name,
    value
  ) {
    setFilters(
      current => ({
        ...current,
        [name]: value
      })
    );
  }


  function resetFilters() {
    setFilters(
      INITIAL_FILTERS
    );
  }


  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">
            Football Kit Finder
          </p>

          <h1>
            Find a kids&apos;
            football kit
          </h1>

          <p className="intro">
            Search club shops by
            age, price and kit type.
          </p>
        </div>

        <div className="coverage">
          <strong>
            {products.length}
          </strong>

          <span>
            products indexed
          </span>
        </div>
      </header>


      <section className="searchPanel">
        <div className="field">
          <label htmlFor="age">
            Child&apos;s age
          </label>

          <input
            id="age"
            type="number"
            min="0"
            max="17"
            step="0.5"
            placeholder="e.g. 5"
            value={filters.age}
            onChange={event =>
              updateFilter(
                'age',
                event.target.value
              )
            }
          />
        </div>


        <div className="field">
          <label htmlFor="country">
            Country
          </label>

          <select
            id="country"
            value={
              filters.country
            }
            onChange={event => {
              updateFilter(
                'country',
                event.target.value
              );

              updateFilter(
                'club',
                ''
              );
            }}
          >
            <option value="">
              All countries
            </option>

            {countries.map(
              country => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              )
            )}
          </select>
        </div>


        <div className="field">
          <label htmlFor="league">
            League
          </label>

          <select
            id="league"
            value={
              filters.league
            }
            onChange={event => {
              updateFilter(
                'league',
                event.target.value
              );

              updateFilter(
                'club',
                ''
              );
            }}
          >
            <option value="">
              All leagues
            </option>

            {leagues.map(
              league => (
                <option
                  key={league}
                  value={league}
                >
                  {league}
                </option>
              )
            )}
          </select>
        </div>


        <div className="field">
          <label htmlFor="club">
            Club
          </label>

          <select
            id="club"
            value={
              filters.club
            }
            onChange={event =>
              updateFilter(
                'club',
                event.target.value
              )
            }
          >
            <option value="">
              All clubs
            </option>

            {clubs.map(
              club => (
                <option
                  key={club}
                  value={club}
                >
                  {club}
                </option>
              )
            )}
          </select>
        </div>


        <div className="field">
          <label htmlFor="kit">
            Kit
          </label>

          <select
            id="kit"
            value={
              filters.kit
            }
            onChange={event =>
              updateFilter(
                'kit',
                event.target.value
              )
            }
          >
            <option value="">
              All kits
            </option>

            {kits.map(
              kit => (
                <option
                  key={kit}
                  value={kit}
                >
                  {kit}
                </option>
              )
            )}
          </select>
        </div>


        <div className="field">
          <label htmlFor="product">
            Product
          </label>

          <select
            id="product"
            value={
              filters.product
            }
            onChange={event =>
              updateFilter(
                'product',
                event.target.value
              )
            }
          >
            <option value="">
              All products
            </option>

            {productTypes.map(
              productType => (
                <option
                  key={
                    productType
                  }
                  value={
                    productType
                  }
                >
                  {productType}
                </option>
              )
            )}
          </select>
        </div>


        <div className="field">
          <label htmlFor="price">
            Maximum price
          </label>

          <input
            id="price"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={
              filters.maxPrice
            }
            onChange={event =>
              updateFilter(
                'maxPrice',
                event.target.value
              )
            }
          />
        </div>


        <div className="field">
          <label htmlFor="sort">
            Sort
          </label>

          <select
            id="sort"
            value={
              filters.sort
            }
            onChange={event =>
              updateFilter(
                'sort',
                event.target.value
              )
            }
          >
            <option value="price_asc">
              Price: low to high
            </option>

            <option value="price_desc">
              Price: high to low
            </option>

            <option value="saving_desc">
              Biggest saving
            </option>

            <option value="club">
              Club
            </option>
          </select>
        </div>


        <label className="checkbox">
          <input
            type="checkbox"
            checked={
              filters.inStockOnly
            }
            onChange={event =>
              updateFilter(
                'inStockOnly',
                event.target.checked
              )
            }
          />

          Confirmed in stock only
        </label>


        <button
          type="button"
          className="resetButton"
          onClick={
            resetFilters
          }
        >
          Reset filters
        </button>
      </section>


      <section className="resultsHeader">
        <div>
          <h2>
            {results.length}{' '}
            {results.length === 1
              ? 'result'
              : 'results'}
          </h2>

          {filters.age && (
            <p>
              Showing products with
              known sizing for age{' '}
              {filters.age}.
            </p>
          )}
        </div>
      </section>


      {!results.length && (
        <div className="emptyState">
          <h2>
            No matching kits
          </h2>

          <p>
            This may mean there are
            genuinely no matches, or
            that we do not yet have
            enough sizing data for
            that club.
          </p>
        </div>
      )}


      <section className="resultsGrid">
        {results.map(
          ({
            product,
            matchingSizes,
            effectivePrice,
            saving,
            availability
          }) => (
            <article
              className="productCard"
              key={
                product.source_product_id
                  ? `${
                      product.source
                    }-${
                      product.source_product_id
                    }`
                  : product.url
              }
            >
              <div className="imageWrap">
                {product.image ? (
                  <img
                    src={
                      product.image
                    }
                    alt={
                      product.name
                    }
                  />
                ) : (
                  <div className="noImage">
                    No image
                  </div>
                )}
              </div>


              <div className="cardBody">
                <div className="cardMeta">
                  <span>
                    {product.club}
                  </span>

                  {product.season && (
                    <span>
                      {product.season}
                    </span>
                  )}
                </div>


                <h3>
                  {product.name}
                </h3>


                <div className="badges">
                  {product.kit && (
                    <span>
                      {product.kit}
                    </span>
                  )}

                  {product.product && (
                    <span>
                      {product.product}
                    </span>
                  )}
                </div>


                <div className="priceRow">
                  <strong>
                    {money(
                      effectivePrice
                    )}
                  </strong>

                  {saving > 0 && (
                    <span className="saving">
                      Save{' '}
                      {money(
                        saving
                      )}
                    </span>
                  )}
                </div>


                <div className="detail">
                  <span className="detailLabel">
                    Suitable sizes
                  </span>

                  <strong>
                    {matchingSizes.length
                      ? matchingSizes.join(
                          ', '
                        )
                      : filters.age
                        ? 'No mapped size'
                        : product.sizes
                            ?.length
                          ? product.sizes.join(
                              ', '
                            )
                          : 'Unknown'}
                  </strong>
                </div>


                <div className="detail">
                  <span className="detailLabel">
                    Availability
                  </span>

                  <strong
                    className={`availability ${availability}`}
                  >
                    {availabilityLabel(
                      availability
                    )}
                  </strong>
                </div>


                <div className="detail secondary">
                  {product.country}
                  {' · '}
                  {product.league}
                </div>


                {product.url && (
                  <a
                    className="shopLink"
                    href={
                      product.url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View at retailer
                  </a>
                )}
              </div>
            </article>
          )
        )}
      </section>
    </main>
  );
}