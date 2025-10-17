import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Checkout.css';

function Checkout({ user, onNavigate, localCart, setLocalCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
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
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return displayItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0).toFixed(2);
  };


  const handleSubmit = async () => {
    setError('');
    setProcessing(true);

    try {
      if (!user) {
        alert('Payment processed successfully! Thank you for your purchase.');
        setLocalCart([]);
        onNavigate('home');
        return;
      }

      const totalAmount = parseFloat(calculateTotal());

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'paid'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = displayItems.map(item => ({
        order_id: orderData.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      alert('Order placed successfully! Thank you for your purchase.');
      onNavigate('home');

    } catch (err) {
      setError(err.message || 'Failed to process order');
    } finally {
      setProcessing(false);
    }
  };

  const displayItems = user ? cartItems : localCart.map(item => ({
    id: item.id,
    quantity: item.quantity,
    products: {
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock
    }
  }));

  if (loading) {
    return <div className="loading">Loading checkout...</div>;
  }

  if (displayItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products to checkout</p>
        <button onClick={() => onNavigate('home')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Payment</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-content">

        <div className="order-summary">
          <h3>Order Summary</h3>

          <div className="summary-items">
            {displayItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.products.name} x {item.quantity}</span>
                <span>${(item.products.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          <button onClick={handleSubmit} className="place-order-btn" disabled={processing}>
            {processing ? 'Processing...' : `Complete Payment - $${calculateTotal()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
