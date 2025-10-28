import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Checkout.css';

function Checkout({ user, onNavigate, localCart, setLocalCart }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // simple phone validation: digits only, length 7-15 (adjust as needed)
  const validatePhone = (p) => {
    const cleaned = p.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (digits only).');
      return;
    }

    setProcessing(true);

    // simulate payment processing delay
    setTimeout(async () => {
      try {
        // If logged-in user, clear their cart in Supabase
        if (user?.id) {
          const { error: delError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
          if (delError) {
            // don't block success for minor DB errors, but log
            console.error('Error clearing cart_items:', delError);
          }
        } else {
          // guest: clear local cart
          setLocalCart([]);
        }

        setSuccess(true);
        setProcessing(false);

        // Small delay so user sees success UI then navigate home
        setTimeout(() => {
          // go home and optionally show an alert
          onNavigate('home');
          alert('Payment successful — thank you!');
        }, 1200);
      } catch (err) {
        console.error(err);
        setProcessing(false);
        setError('Payment failed (simulated). Please try again.');
      }
    }, 1400); // 1.4s fake processing time
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-card">
        <h2>Payment</h2>

        {!success ? (
          <>
            <p className="checkout-instruction">
              Enter your phone number to simulate payment.
            </p>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <label className="field-label">
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+260 96 000 0000"
                  className="phone-input"
                  required
                />
              </label>

              {error && <div className="checkout-error">{error}</div>}

              <div className="checkout-actions">
                <button
                  type="submit"
                  className="pay-btn"
                  disabled={processing}
                >
                  {processing ? 'Processing…' : 'Pay (Fake)'}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => onNavigate('cart')}
                  disabled={processing}
                >
                  Back to Cart
                </button>
              </div>
            </form>

            {processing && (
              <div className="processing-row">
                <div className="loader-dot" />
                <div className="loader-dot" />
                <div className="loader-dot" />
                <span className="processing-text">Processing payment…</span>
              </div>
            )}
          </>
        ) : (
          <div className="success-box">
            <h3>Payment Successful 🎉</h3>
            <p>Your order has been placed (simulated).</p>
            <button onClick={() => onNavigate('home')} className="done-btn">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
