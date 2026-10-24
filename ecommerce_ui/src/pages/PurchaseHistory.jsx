import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/purchases');
      const data = response.data;
      const purchaseList = Array.isArray(data) ? data : (data.content || []);
      setPurchases(purchaseList);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
    }
  };

  const fetchPurchaseDetail = async (id) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      setSelectedPurchase(response.data);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px' }}>
      
      <div style={{ flex: 2 }}>
        <h2>Purchase History</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Amount</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{purchase.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{purchase.customerEmail}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>${purchase.totalAmount}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button 
                      onClick={() => fetchPurchaseDetail(purchase.id)}
                      style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', height: 'fit-content' }}>
        <h3>Purchase Details</h3>
        {selectedPurchase ? (
          <div>
            <p><strong>ID:</strong> {selectedPurchase.id}</p>
            <p><strong>Email:</strong> {selectedPurchase.customerEmail}</p>
            <p><strong>Total:</strong> ${selectedPurchase.totalAmount}</p>
            <p><strong>Date:</strong> {selectedPurchase.createdAt || 'N/A'}</p>
            
            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {selectedPurchase.items && selectedPurchase.items.map((item, index) => (
                <li key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>SKU: {item.sku}</span>
                  <br />
                  <small>Quantity: {item.quantity} | Price: ${item.price}</small>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => setSelectedPurchase(null)}
              style={{ width: '100%', marginTop: '20px', padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close Details
            </button>
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>Select a purchase to view its details.</p>
        )}
      </div>

    </div>
  );
}