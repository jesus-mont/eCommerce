import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductSearchBar({ onResultsFetched, currentPage, size = 20, refreshTrigger }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 0, query = '') => {
    setLoading(true);
    try {
      let endpoint = `/products?page=${page}&size=${size}`;
      
      if (query && query.trim() !== '') {
        endpoint = `/products/search?q=${encodeURIComponent(query.trim())}&page=${page}&size=${size}`;
      }

      const response = await api.get(endpoint);
      const data = response.data;
      
      if (data.content) {
        onResultsFetched({
          products: data.content,
          totalPages: data.totalPages,
          number: data.number
        });
      } else if (Array.isArray(data)) {
        onResultsFetched({
          products: data,
          totalPages: 1,
          number: 0
        });
      } else {
        onResultsFetched({ products: [], totalPages: 0, number: 0 });
      }
    } catch (error) {
      console.error('Error fetching products from DB:', error);
      onResultsFetched({ products: [], totalPages: 0, number: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, searchTerm, refreshTrigger]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <h3 style={{ margin: 0 }}>Current Inventory {loading && <span style={{ fontSize: '12px', color: '#666' }}>(Searching...)</span>}</h3>
      <input 
        type="text" 
        placeholder="Search by name or SKU..." 
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ padding: '8px', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
}