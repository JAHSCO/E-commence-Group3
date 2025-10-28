import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminDashbord.css';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch registered users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles') // assuming profiles table exists
        .select('id, email, role, created_at');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add Product
  const addProduct = async (e) => {
    e.preventDefault();
    if (!name || !quantity) return;

    setLoadingProducts(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert([{ name, quantity }]); // adapt fields to your table
      if (error) throw error;

      setProducts(prev => [...prev, { name, quantity }]);
      setName('');
      setQuantity('');
      alert('Product added!');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage products and view registered users</p>
      </div>

      {/* Add Product Section */}
      <div className="admin-card">
        <h2>Add Product</h2>
        <form className="admin-form" onSubmit={addProduct}>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <button type="submit" disabled={loadingProducts}>
            {loadingProducts ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* View Users Section */}
      <div className="admin-card">
        <h2>Registered Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty">No users registered yet.</p>
        ) : (
          <ul className="product-list">
            {users.map(user => (
              <li key={user.id}>
                <span>{user.email}</span>
                <span className="quantity">{user.role || 'user'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
