import React, { useState } from 'react';
import ProductCatalog from './pages/ProductCatalog';
import ProductAdmin from './pages/ProductAdmin';

function App() {
  const [currentView, setCurrentView] = useState('catalog');

  return (
    <div>
      <nav style={{ background: '#333', padding: '15px', color: '#fff', display: 'flex', gap: '20px' }}>
        <h3 style={{ margin: 0, color: '#ffc107' }}>E-Commerce App</h3>
        <button 
          onClick={() => setCurrentView('catalog')}
          style={{ background: currentView === 'catalog' ? '#007bff' : 'transparent', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Catalog & Shop
        </button>
        <button 
          onClick={() => setCurrentView('admin')}
          style={{ background: currentView === 'admin' ? '#007bff' : 'transparent', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Product Management
        </button>
      </nav>

      {currentView === 'catalog' ? <ProductCatalog /> : <ProductAdmin />}
    </div>
  );
}

export default App;