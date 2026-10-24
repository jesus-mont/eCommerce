import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductAdmin from './ProductAdmin';
import api from '../services/api';

jest.mock('../services/api');

describe('ProductAdmin Component', () => {

  const mockProducts = [
    {
      id: 1,
      name: 'Laptop',
      sku: 'SKU-LAPTOP',
      category: 'Electronics',
      description: 'High-end gaming laptop',
      price: 1200,
      stock: 5,
      weightKg: 2.5
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      sku: 'SKU-MOUSE',
      category: 'Electronics',
      description: 'Ergonomic wireless mouse',
      price: 25,
      stock: 50,
      weightKg: 0.2
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockProducts });
  });

  test('renders product admin view and fetches products on mount', async () => {
    render(<ProductAdmin />);

    expect(screen.getByText('Product Administration')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/products');
  });

  test('filters products table when typing in the search input', async () => {
    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or SKU...');
    fireEvent.change(searchInput, { target: { value: 'Mouse' } });

    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
  });

  test('submits form to create a new product successfully', async () => {
    api.post.mockResolvedValue({ status: 201 });

    render(<ProductAdmin />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Keyboard' } });
    fireEvent.change(screen.getByPlaceholderText('SKU'), { target: { value: 'SKU-KEYBOARD' } });
    fireEvent.change(screen.getByPlaceholderText('Price ($)'), { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Weight (kg)'), { target: { value: '0.8' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/products', expect.objectContaining({
        name: 'Keyboard',
        sku: 'SKU-KEYBOARD',
        price: '45'
      }));
      expect(screen.getByText('Product created successfully!')).toBeInTheDocument();
    });
  });

  test('loads product data into form when clicking edit', async () => {
    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('button', { name: /Update Product/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name').value).toBe('Laptop');
    expect(screen.getByPlaceholderText('SKU').value).toBe('SKU-LAPTOP');
  });

  test('deletes a product successfully after confirmation', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    api.delete.mockResolvedValue({ status: 200 });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalledWith('/products/1');
      expect(screen.getByText('Product deleted successfully!')).toBeInTheDocument();
    });
  });

});