import React, { useState } from 'react';
import api from '../services/api';
import ProductSearchBar from '../components/ProductSearchBar';
import Pagination from '../components/Pagination';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
  const [message, setMessage] = useState(null);

  const handleResultsFetched = ({ products, totalPages, number }) => {
    setProducts(products);
    setTotalPages(totalPages);
    setCurrentPage(number);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      setRefreshTrigger(prev => prev + 1); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Error: ${errorMsg}` });
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setRefreshTrigger(prev => prev + 1); 
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Product Administration</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', color: message.type === 'success' ? 'green' : 'red', background: '#f9f9f9', border: '1px solid #ccc' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{isEditing ? 'Edit Product' : 'Create New Product'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} required readOnly={isEditing} title={isEditing ? 'SKU cannot be changed after creation' : undefined} style={{ padding: '8px', background: isEditing ? '#e9ecef' : '#fff' }} />
          <input type="number" step="0.01" name="price" placeholder="Price ($)" value={formData.price} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="number" step="0.01" name="weightKg" placeholder="Weight (kg)" value={formData.weightKg} onChange={handleChange} required style={{ padding: '8px' }} />
          
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            style={{ 
              padding: '8px', 
              width: '100%', 
              boxSizing: 'border-box', 
              borderRadius: '2px', 
              border: '1px solid #767676', 
              background: '#fff',
              color: formData.category ? '#000' : '#757575' 
            }}
            required
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} style={{ color: '#000' }}>
                {cat.label}
              </option>
            ))}
          </select>

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

      <ProductSearchBar 
        currentPage={currentPage}
        size={20}
        refreshTrigger={refreshTrigger}
        onResultsFetched={handleResultsFetched}
      />

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
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span 
                    onClick={() => handleEdit(product)} 
                    style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Click to edit product"
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
                No products found in the database.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}
