import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Cart.css';

function Cart({ user, onNavigate, onCartUpdate, localCart, setLocalCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState({});

  useEffect(() => {
    if (user) fetchCartItems();
    else setLoading(false);
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
      onCartUpdate(data?.length || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayItems = user
    ? cartItems
    : localCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        products: {
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          stock: item.stock || 10
        }
      }));

  const calculateTotal = () => {
    if (!displayItems || displayItems.length === 0) return 0;
    return displayItems
      .reduce((total, item) => total + item.products.price * item.quantity, 0)
      .toFixed(2);
  };

  const updateLocalQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setLocalCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
    const totalItems = localCart.reduce(
      (sum, item) => (item.id === productId ? sum + newQuantity - item.quantity : sum),
      0
    );
    onCartUpdate(totalItems);
  };

  const removeLocalItem = (productId) => {
    const newCart = localCart.filter(item => item.id !== productId);
    setLocalCart(newCart);
    onCartUpdate(newCart.length);
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {error && <div className="error-message">{error}</div>}

      {displayItems.length === 0 ? (
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started</p>
          <button className="shop-btn" onClick={() => onNavigate('home')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {displayItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.products.image_url} alt={item.products.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.products.name}</h3>
                  <p className="cart-item-price">K{item.products.price}</p>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          user
                            ? null
                            : updateLocalQuantity(item.products.id, item.quantity - 1)
                        }
                        disabled={updatingItems[item.id]}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() =>
                          user
                            ? null
                            : updateLocalQuantity(item.products.id, item.quantity + 1)
                        }
                        disabled={updatingItems[item.id]}
                      >
                        +
                      </button>
                    </div>
                    <p className="item-total">
                      K{(item.products.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        user ? null : removeLocalItem(item.products.id)
                      }
                      disabled={updatingItems[item.id]}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>K{calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>K{calculateTotal()}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={() => onNavigate('payment')}
            >
              Proceed to Payment
            </button>
            <button
              className="continue-shopping-btn"
              onClick={() => onNavigate('home')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
