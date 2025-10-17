import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Nav from './components/Nav';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [localCart, setLocalCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Check user session on load
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCartCount(session.user.id);
      } else {
        setUser(null);
        setCartCount(0);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchCartCount(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch cart count for the user
  const fetchCartCount = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', userId);

      if (error) throw error;
      setCartCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // 🟢 Sign In function with admin detection
  const handleSignIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const loggedUser = data.user;
      setUser(loggedUser);

      // ✅ Check if the signed-in user is admin
      if (email === 'bed-com-24-23@unima.ac.mw') {
        alert('Welcome, Admin!');
        setCurrentPage('admin-dashboard');
      } else {
        alert('Welcome, user!');
        setCurrentPage('home');
      }
    } catch (error) {
      alert('Sign in failed: ' + error.message);
    }
  };

  // 🟢 Sign Up new user
  const handleSignUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setUser(data.user);
      alert('Sign up successful! Please sign in.');
      setCurrentPage('signin');
    } catch (error) {
      alert('Sign up failed: ' + error.message);
    }
  };

  // 🟢 Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCartCount(0);
    setCurrentPage('signin');
  };

  // 🟢 Add to Cart
  const handleAddToCart = async (product) => {
    if (!user) {
      // Local cart (guest)
      const existingItem = localCart.find(item => item.id === product.id);
      if (existingItem) {
        setLocalCart(prev =>
          prev.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setLocalCart(prev => [...prev, { ...product, quantity: 1 }]);
      }
      setCartCount(prev => prev + 1);
      alert('Product added to cart!');
      return;
    }

    // Logged-in user cart
    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
        if (error) throw error;
      }

      await fetchCartCount(user.id);
      alert('Product added to cart!');
    } catch (error) {
      alert('Error adding to cart: ' + error.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="app">
      <Nav
        onNavigate={setCurrentPage}
        cartCount={cartCount}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="main-content">
        {/* 🟢 Sign In */}
        {currentPage === 'signin' && !user && (
          <SignIn
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setCurrentPage('signup')}
          />
        )}

        {/* 🟢 Sign Up */}
        {currentPage === 'signup' && !user && (
          <SignUp
            onSignUp={handleSignUp}
            onSwitchToSignIn={() => setCurrentPage('signin')}
          />
        )}

        {/* 🟢 Admin Dashboard */}
        {user?.email === 'bed-com-24-23@unima.ac.mw' && currentPage === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {/* 🟢 Products for normal users */}
        {(currentPage === 'home' || currentPage === 'items') && (
          <ProductList
            category="all"
            onAddToCart={handleAddToCart}
            user={user}
          />
        )}

        {/* 🟢 Cart */}
        {currentPage === 'cart' && (
          <Cart
            user={user}
            onNavigate={setCurrentPage}
            onCartUpdate={setCartCount}
            localCart={localCart}
            setLocalCart={setLocalCart}
          />
        )}

        {/* 🟢 Checkout */}
        {currentPage === 'payment' && (
          <Checkout
            user={user}
            onNavigate={setCurrentPage}
            localCart={localCart}
            setLocalCart={setLocalCart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
