import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles.css';

const queryClient = new QueryClient();

async function fetchProducts(search = '') {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const trimmed = search.trim();
  const endpoint = trimmed
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmed)}&limit=20`
    : 'https://dummyjson.com/products?limit=20';

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  const result = await res.json();
  return (result.products || []).slice(0, 20);
}

function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');

  const queryKey = searchTerm.trim()
    ? ['products', { search: searchTerm.trim() }]
    : ['products'];

  const {
    data: products = [],
    isPending,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <section>
      <div className="search">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh Products'}
        </button>
      </div>

      <div className="meta">
        {isFetching && !isPending && (
          <div className="fetching">Updating products in background...</div>
        )}
        {isSuccess && (
          <div className="success">Loaded {products.length} products successfully.</div>
        )}
      </div>

      {isPending && <div className="status">Loading products...</div>}

      {isError && (
        <div className="error">
          Error: {error?.message || 'Unable to load products.'}
        </div>
      )}

      {isSuccess && (
        <div className="grid">
          {products.map((product) => (
            <article key={product.id} className="card">
              <h2>{product.title}</h2>
              <p style={{ color: '#667085', fontSize: '14px', margin: '8px 0' }}>
                {product.category} &bull; ${product.price}
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.4 }}>{product.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function App() {
  const [showProducts, setShowProducts] = useState(true);

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Exercise 1: Product Listing</h1>
          <p className="hint">
            Demonstrating caching, loading states, background fetching, and query keys.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowProducts((prev) => !prev)}
          style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccd3df', background: '#fff' }}
        >
          {showProducts ? 'Navigate Away (Unmount)' : 'Return to Products (Remount)'}
        </button>
      </header>

      {showProducts ? (
        <ProductList />
      ) : (
        <div className="status" style={{ margin: '30px 0' }}>
          Navigated away from product view. Click above to return within 30 seconds and observe the cached data.
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
