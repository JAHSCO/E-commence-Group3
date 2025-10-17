import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ProductList.css';

function ProductList({ category, onAddToCart, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      await onAddToCart(product);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>
          {category === 'all' ? 'All Products' :
           category === 'phones' ? 'Phones' : 'PCs'}
        </h2>
        <p className="product-count">{products.length} products available</p>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image_url} alt={product.name} />
              {product.stock < 10 && product.stock > 0 && (
                <span className="low-stock-badge">Only {product.stock} left</span>
              )}
              {product.stock === 0 && (
                <span className="out-of-stock-badge">Out of Stock</span>
              )}
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>

              <div className="product-footer">
                <span className="product-price">K{product.price}</span>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0 || addingToCart[product.id]}
                >
                  {addingToCart[product.id] ? 'Adding...' :
                   product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                   
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>No products available in this category</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
