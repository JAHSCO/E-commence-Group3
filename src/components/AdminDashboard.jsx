import { useState } from 'react';
import './AdminDashbord.css'; // ✅ make sure filename matches exactly

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const addProduct = (e) => {
    e.preventDefault();
    if (!name || !quantity) return;
    setProducts([...products, { name, quantity }]);
    setName('');
    setQuantity('');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your store products here</p>
      </div>

      <div className="admin-card">
        <h2>Add Product</h2>
        <form onSubmit={addProduct} className="admin-form">
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
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Available Products</h2>
        {products.length === 0 ? (
          <p className="empty">No products added yet.</p>
        ) : (
          <ul className="product-list">
            {products.map((prod, index) => (
              <li key={index}>
                <span>{prod.name}</span>
                <span className="quantity">Qty: {prod.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
