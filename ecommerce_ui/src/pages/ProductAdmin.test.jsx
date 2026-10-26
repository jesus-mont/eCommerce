import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductAdmin from './ProductAdmin';
import api from '../services/api';

jest.mock('../services/api');

// Mock Pagination to allow direct testing of boundary cases in handlePageChange
jest.mock('../components/Pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
      <div data-testid="pagination-controls">
        <span>Page {currentPage + 1} de {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)}>next</button>
        <button onClick={() => onPageChange(currentPage - 1)}>Previos</button>
        <button onClick={() => onPageChange(-1)}>Invalid Lower Bound</button>
        <button onClick={() => onPageChange(totalPages)}>Invalid Upper Bound</button>
      </div>
    );
  };
});

describe('ProductAdmin Component', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Laptop',
      sku: 'SKU-LAPTOP',
      category: 'ELECTRONICS',
      description: 'High-end gaming laptop',
      price: 1200,
      stock: 5,
      weightKg: 2.5
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      sku: 'SKU-MOUSE',
      category: 'ELECTRONICS',
      description: 'Ergonomic wireless mouse',
      price: 25,
      stock: 50,
      weightKg: 0.2
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders product admin view and fetches products on mount', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    expect(screen.getByText('Product Administration')).toBeInTheDocument();
    expect(screen.getByText('Create New Product')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Product/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/products?page=0&size=20');
  });

  test('renders empty state message when no products are found', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [],
        totalPages: 0,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('No products found in the database.')).toBeInTheDocument();
    });
  });

  test('filters products table when typing in the search input', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[1]],
        totalPages: 1,
        number: 0
      }
    });

    const searchInput = screen.getByPlaceholderText('Search by name or SKU...');
    fireEvent.change(searchInput, { target: { value: 'Mouse' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products/search?q=Mouse&page=0&size=20');
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    });
  });

  test('submits form to create a new product successfully', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [],
        totalPages: 0,
        number: 0
      }
    });
    api.post.mockResolvedValueOnce({ status: 201 });
    api.get.mockResolvedValueOnce({
      data: {
        content: [{ id: 3, name: 'Keyboard', sku: 'SKU-KEYBOARD', price: '45', stock: '30', weightKg: '0.8', category: 'ELECTRONICS', description: 'RGB' }],
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Keyboard' } });
    fireEvent.change(screen.getByPlaceholderText('SKU'), { target: { value: 'SKU-KEYBOARD' } });
    fireEvent.change(screen.getByPlaceholderText('Price ($)'), { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Weight (kg)'), { target: { value: '0.8' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ELECTRONICS' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'RGB' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/products', {
        id: null,
        name: 'Keyboard',
        sku: 'SKU-KEYBOARD',
        price: '45',
        stock: '30',
        weightKg: '0.8',
        category: 'ELECTRONICS',
        description: 'RGB'
      });
      expect(screen.getByText('Product created successfully!')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name').value).toBe('');
    });
  });

  test('displays error message when product creation fails with server response', async () => {
    api.get.mockResolvedValueOnce({
      data: { content: [], totalPages: 0, number: 0 }
    });
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'SKU already exists'
        }
      }
    });

    render(<ProductAdmin />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Keyboard' } });
    fireEvent.change(screen.getByPlaceholderText('SKU'), { target: { value: 'SKU-EXISTING' } });
    fireEvent.change(screen.getByPlaceholderText('Price ($)'), { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Weight (kg)'), { target: { value: '0.8' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ELECTRONICS' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(screen.getByText('Error: SKU already exists')).toBeInTheDocument();
    });
  });

  test('displays error message when product creation fails with generic error', async () => {
    api.get.mockResolvedValueOnce({
      data: { content: [], totalPages: 0, number: 0 }
    });
    api.post.mockRejectedValueOnce(new Error('Network error'));

    render(<ProductAdmin />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Keyboard' } });
    fireEvent.change(screen.getByPlaceholderText('SKU'), { target: { value: 'SKU-KEYBOARD' } });
    fireEvent.change(screen.getByPlaceholderText('Price ($)'), { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Weight (kg)'), { target: { value: '0.8' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ELECTRONICS' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  test('loads product data into form when clicking edit button and updates successfully', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.put.mockResolvedValueOnce({ status: 200 });
    api.get.mockResolvedValueOnce({
      data: {
        content: [{ ...mockProducts[0], name: 'Laptop Pro', price: 1500 }],
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name').value).toBe('Laptop');
    expect(screen.getByPlaceholderText('SKU').value).toBe('SKU-LAPTOP');
    expect(screen.getByRole('combobox').value).toBe('ELECTRONICS');

    // Update name and price
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Laptop Pro' } });
    fireEvent.change(screen.getByPlaceholderText('Price ($)'), { target: { value: '1500' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Product/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/products/1', expect.objectContaining({
        id: 1,
        name: 'Laptop Pro',
        price: '1500'
      }));
      expect(screen.getByText('Product updated successfully!')).toBeInTheDocument();
      expect(screen.getByText('Create New Product')).toBeInTheDocument();
    });
  });

  test('loads product data when clicking on the product name', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    // Click on product name span
    fireEvent.click(screen.getByText('Laptop'));

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name').value).toBe('Laptop');
  });

  test('cancels edit mode and resets the form when clicking cancel button', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name').value).toBe('Laptop');

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByText('Create New Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name').value).toBe('');
    expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
  });

  test('deletes a product successfully after user confirmation', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.delete.mockResolvedValueOnce({ status: 200 });
    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[1]],
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
      expect(api.delete).toHaveBeenCalledWith('/products/1');
      expect(screen.getByText('Product deleted successfully!')).toBeInTheDocument();
    });
  });

  test('cancels product deletion when user cancels confirmation', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
  });

  test('displays error message when product deletion fails', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.delete.mockRejectedValueOnce(new Error('Delete error'));

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Error deleting product')).toBeInTheDocument();
    });
  });

  test('handles pagination navigation and validates boundary checks', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[0]],
        totalPages: 2,
        number: 0
      }
    });

    render(<ProductAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Page 1 de 2')).toBeInTheDocument();
    });

    // Test out of bounds: negative page index (ignored by handlePageChange)
    const invalidLowerBtn = screen.getByRole('button', { name: /Invalid Lower Bound/i });
    fireEvent.click(invalidLowerBtn);
    expect(api.get).toHaveBeenCalledTimes(1);

    // Test out of bounds: newPage >= totalPages (ignored by handlePageChange)
    const invalidUpperBtn = screen.getByRole('button', { name: /Invalid Upper Bound/i });
    fireEvent.click(invalidUpperBtn);
    expect(api.get).toHaveBeenCalledTimes(1);

    // Navigate to page 1
    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[1]],
        totalPages: 2,
        number: 1
      }
    });

    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products?page=1&size=20');
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Page 2 de 2')).toBeInTheDocument();
    });

    // Navigate back to page 0
    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[0]],
        totalPages: 2,
        number: 0
      }
    });

    const prevBtn = screen.getByRole('button', { name: /Previos/i });
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products?page=0&size=20');
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });
});
