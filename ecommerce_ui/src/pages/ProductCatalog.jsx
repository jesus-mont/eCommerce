import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]); 
  const [customerEmail, setCustomerEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 0) => {
    setLoading(true);
    try {
        const response = await api.get(`/products?page=${page}&size=20`);
        const data = response.data;

        // Validamos si viene en formato paginado de Spring (Page) o como lista plana
        if (data.content) {
            setProducts(data.content);
            setTotalPages(data.totalPages);   
            setCurrentPage(data.number);     
        } else if (Array.isArray(data)) {
            setProducts(data);
            setTotalPages(1);
            setCurrentPage(0);
        } else {
            setProducts([]);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
    } finally {
        setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          alert('Cannot add more units. Stock limit reached.');
          return prevCart;
        }
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerEmail) {
      alert('Please enter your customer email.');
      return;
    }

    const orderPayload = {
      customerEmail: customerEmail,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await api.post('/purchases', orderPayload);
      
      alert('Order successfully created! ID: ' + (response.data.id || 'Confirmed'));
      setCart([]);
      setCustomerEmail('');
      fetchProducts();
    } catch (error) {
      console.error('Error processing checkout:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Error processing order: ${errorMsg}`);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);


  const filteredProducts = Array.isArray(products) 
    ? products.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      ) 
    : [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px' }}>
      
      <div style={{ flex: 2 }}>
        <h2>Product Catalog</h2>

        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', width: '300px', boxSizing: 'border-box' }}
          />
        </div>

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
            <p><strong>SKU:</strong> {selectedProduct.sku}</p>
            <p><strong>Category:</strong> {selectedProduct.category || 'N/A'}</p>
            <p><strong>Description:</strong> {selectedProduct.description || 'No description available.'}</p>
            <p><strong>Price:</strong> ${selectedProduct.price}</p>
            <p><strong>Stock Available:</strong> {selectedProduct.stock}</p>
            <p><strong>Weight:</strong> {selectedProduct.weightKg} kg</p>
          </div>
        )}

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
                    <button 
                      onClick={() => addToCart(product)} 
                      disabled={product.stock <= 0}
                      style={{ 
                        padding: '6px 12px', 
                        background: product.stock > 0 ? '#28a745' : '#ccc', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed' 
                      }}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>
                  No products found.
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

      <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', height: 'fit-content' }}>
        <h3>Shopping Cart</h3>
        {cart.length === 0 ? (
          <p style={{ color: '#6c757d' }}>Your cart is empty.</p>
        ) : (
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              {cart.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                    <br />
                    <small>{item.quantity} x ${item.price}</small>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Customer Email:</label>
              <input 
                type="email" 
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <hr style={{ border: '0', borderTop: '1px solid #ccc', marginBottom: '15px' }} />
            <h4>Total: ${totalPrice}</h4>
            <button 
              onClick={handleCheckout}
              style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

    </div>
  );
}