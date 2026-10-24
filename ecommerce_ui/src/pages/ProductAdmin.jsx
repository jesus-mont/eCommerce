import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductAdmin() {
  const CATEGORIES = [
    { value: 'FOOTWEAR', label: 'Footwear' },
    { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage' },
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'OUTDOORS', label: 'Outdoors' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'HOME_AND_OFFICE', label: 'Home & Office' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'KITCHEN', label: 'Kitchen' },
    { value: 'BOOKS', label: 'Books' },
    { value: 'BEAUTY', label: 'Beauty' },
    { value: 'STATIONERY', label: 'Stationery' },
    { value: 'GAMES', label: 'Games' },
    { value: 'MISC', label: 'Misc' },
    { value: 'GIFTS', label: 'Gifts' },
    { value: 'PETS', label: 'Pets' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'TOOLS', label: 'Tools' }
  ];
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    weightKg: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data;
      setProducts(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) { 
        await api.put(`/products/${formData.id}`, formData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await api.post('/products', formData);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Error: ${errorMsg}` });
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
    setSelectedProduct(null);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(null);
      }
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting product' });
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      sku: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      weightKg: ''
    });
    setIsEditing(false);
  };

  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Product Administration</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', color: message.type === 'success' ? 'green' : 'red', background: '#f9f9f9', border: '1px solid #ccc' }}>
          {message.text}
        </div>
      )}

      {selectedProduct && (
        <div style={{ background: '#eef2f7', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Product Details: {selectedProduct.name}</h3>
            <button 
              onClick={() => setSelectedProduct(null)} 
              style={{ background: '#64748b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
          <p><strong>ID:</strong> {selectedProduct.id}</p>
          <p><strong>SKU:</strong> {selectedProduct.sku}</p>
          <p><strong>Category:</strong> {selectedProduct.category || 'N/A'}</p>
          <p><strong>Description:</strong> {selectedProduct.description || 'No description available.'}</p>
          <p><strong>Price:</strong> ${selectedProduct.price}</p>
          <p><strong>Stock:</strong> {selectedProduct.stock}</p>
          <p><strong>Weight:</strong> {selectedProduct.weightKg} kg</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{isEditing ? 'Edit Product' : 'Create New Product'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="number" step="0.01" name="price" placeholder="Price ($)" value={formData.price} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="number" step="0.01" name="weightKg" placeholder="Weight (kg)" value={formData.weightKg} onChange={handleChange} required style={{ padding: '8px' }} />
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
          </div>
        </div>
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isEditing ? 'Update Product' : 'Save Product'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Current Inventory</h3>
        <input 
          type="text" 
          placeholder="Search by name or SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>SKU</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Stock</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span 
                    onClick={() => setSelectedProduct(product)} 
                    style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Click to view details"
                  >
                    {product.name}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.sku}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>${product.price}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.stock}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(product)} style={{ marginRight: '8px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', color: '#666' }}>
                No products found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}