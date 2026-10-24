import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock de las vistas secundarias para aislar la prueba de navegación del componente App
jest.mock('./pages/ProductCatalog', () => () => <div data-testid="product-catalog">Product Catalog View</div>);
jest.mock('./pages/ProductAdmin', () => () => <div data-testid="product-admin">Product Admin View</div>);
jest.mock('./pages/PurchaseHistory', () => () => <div data-testid="purchase-history">Purchase History View</div>);

describe('App Component Navigation', () => {
  
  test('renders catalog view by default', () => {
    render(<App />);
    expect(screen.getByTestId('product-catalog')).toBeInTheDocument();
  });

  test('switches to product management view when clicking Product Management button', () => {
    render(<App />);
    const adminButton = screen.getByText('Product Management');
    fireEvent.click(adminButton);
    expect(screen.getByTestId('product-admin')).toBeInTheDocument();
  });

  test('switches to purchase history view when clicking Purchase History button', () => {
    render(<App />);
    const purchaseButton = screen.getByText('Purchase History');
    fireEvent.click(purchaseButton);
    expect(screen.getByTestId('purchase-history')).toBeInTheDocument();
  });

});