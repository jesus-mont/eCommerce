import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCatalog from './ProductCatalog';
import api from '../services/api';

jest.mock('../services/api');

describe('ProductCatalog Component', () => {

  const mockProducts = [
    {
      id: 1,
      name: 'Laptop',
      sku: 'SKU-LAPTOP',
      category: 'Electronics',
      description: 'Gaming laptop',
      price: 1000,
      stock: 2,
      weightKg: 2.0
    },
    {
      id: 2,
      name: 'Headphones',
      sku: 'SKU-HEADPHONES',
      category: 'Audio',
      description: 'Wireless headphones',
      price: 150,
      stock: 0,
      weightKg: 0.3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    api.get.mockResolvedValue({ data: mockProducts });
  });

  test('renders catalog and fetches products on mount', async () => {
    render(<ProductCatalog />);

    expect(screen.getByText('Product Catalog')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Headphones')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/products');
  });

  test('filters products table when typing in search input', async () => {
    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Headphones')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or SKU...');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.queryByText('Headphones')).not.toBeInTheDocument();
  });

  test('adds product to cart when clicking Add to Cart', async () => {
    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('1 x $1000')).toBeInTheDocument();
    expect(screen.getByText('Total: $1000.00')).toBeInTheDocument();
  });

  test('shows alert when exceeding stock limit', async () => {
    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add to Cart/i });
    
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(window.alert).toHaveBeenCalledWith('Cannot add more units. Stock limit reached.');
  });

  test('removes item from cart when clicking Remove', async () => {
    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(screen.getByText('1 x $1000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  test('processes checkout successfully when email and cart are valid', async () => {
    api.post.mockResolvedValue({ data: { id: 101 } });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    const emailInput = screen.getByPlaceholderText('customer@example.com');
    fireEvent.change(emailInput, { target: { value: 'customer@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/purchases', {
        customerEmail: 'customer@example.com',
        items: [{ productId: 1, quantity: 1 }]
      });
      expect(window.alert).toHaveBeenCalledWith('Order successfully created! ID: 101');
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
  });

});