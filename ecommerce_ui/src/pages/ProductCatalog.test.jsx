import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCatalog from './ProductCatalog';
import api from '../services/api';

jest.mock('../services/api');

jest.mock('../components/Pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
      <div data-testid="pagination-controls">
        <span>Page {currentPage + 1} of {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)}>next</button>
        <button onClick={() => onPageChange(currentPage - 1)}>Previos</button>
        <button onClick={() => onPageChange(-1)}>Invalid Lower Bound</button>
        <button onClick={() => onPageChange(totalPages)}>Invalid Upper Bound</button>
      </div>
    );
  };
});

describe('ProductCatalog Component', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Wireless Mouse',
      sku: 'SKU-MOUSE-01',
      category: 'Electronics',
      description: 'Ergonomic wireless mouse',
      price: 25.5,
      stock: 2,
      weightKg: 0.2
    },
    {
      id: 2,
      name: 'Mechanical Keyboard',
      sku: 'SKU-KB-02',
      category: 'Electronics',
      description: 'RGB mechanical keyboard',
      price: 75.0,
      stock: 5,
      weightKg: 1.1
    },
    {
      id: 3,
      name: 'USB-C Cable',
      sku: 'SKU-CABLE-03',
      category: '',
      description: '',
      price: 10.0,
      stock: 0,
      weightKg: 0.05
    }
  ];

  let alertSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('renders catalog title, search bar, table headers, and empty state', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [],
        totalPages: 0,
        number: 0
      }
    });

    render(<ProductCatalog />);

    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or SKU...')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No products found.')).toBeInTheDocument();
    });
  });

  test('renders fetched products correctly including in-stock and out-of-stock items', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('SKU-MOUSE-01')).toBeInTheDocument();
      expect(screen.getByText('$25.5')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('SKU-KB-02')).toBeInTheDocument();
      expect(screen.getByText('$75')).toBeInTheDocument();
      expect(screen.getByText('USB-C Cable')).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    expect(addToCartButtons).toHaveLength(2);

    const outOfStockButton = screen.getByRole('button', { name: /Out of Stock/i });
    expect(outOfStockButton).toBeInTheDocument();
    expect(outOfStockButton).toBeDisabled();
  });

  test('renders products when api returns a plain array instead of a page object', async () => {
    api.get.mockResolvedValueOnce({
      data: [mockProducts[0]]
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
  });

  test('displays product details on click and closes details on close button click', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Wireless Mouse'));

    expect(screen.getByText('Product Details: Wireless Mouse')).toBeInTheDocument();
    expect(screen.getAllByText('SKU-MOUSE-01')).toHaveLength(2);
    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    expect(screen.getByText(/Ergonomic wireless mouse/i)).toBeInTheDocument();
    expect(screen.getAllByText('$25.5')).toHaveLength(2);
    expect(screen.getByText(/0.2 kg/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Product Details: Wireless Mouse')).not.toBeInTheDocument();
  });

  test('displays fallback values for category and description when missing', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('USB-C Cable')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('USB-C Cable'));

    expect(screen.getByText('Product Details: USB-C Cable')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  test('adds multiple items to shopping cart, increments quantities, and calculates total price', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });

    fireEvent.click(addButtons[0]);

    expect(screen.queryByText('Your cart is empty.')).not.toBeInTheDocument();
    expect(screen.getByText('1 x $25.5')).toBeInTheDocument();
    expect(screen.getByText('Total: $25.50')).toBeInTheDocument();

    fireEvent.click(addButtons[1]);

    expect(screen.getByText('1 x $75')).toBeInTheDocument();
    expect(screen.getByText('Total: $100.50')).toBeInTheDocument();

    
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('2 x $25.5')).toBeInTheDocument();
    expect(screen.getByText('1 x $75')).toBeInTheDocument();
    expect(screen.getByText('Total: $126.00')).toBeInTheDocument();
  });

  test('alerts and prevents adding more items than available stock', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });

    fireEvent.click(addButtons[0]); 
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[0]); 

    expect(alertSpy).toHaveBeenCalledWith('Cannot add more units. Stock limit reached.');
    expect(screen.getByText('2 x $25.5')).toBeInTheDocument();
    expect(screen.getByText('Total: $51.00')).toBeInTheDocument();
  });

  test('removes items from cart and updates empty state', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]); 
    fireEvent.click(addButtons[1]); 

    expect(screen.getByText('Total: $100.50')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('1 x $25.5')).not.toBeInTheDocument();
    expect(screen.getByText('1 x $75')).toBeInTheDocument();
    expect(screen.getByText('Total: $75.00')).toBeInTheDocument();

    const remainingRemoveButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(remainingRemoveButton);

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Proceed to Checkout/i })).not.toBeInTheDocument();
  });

  test('shows alert when attempting checkout without email', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    const checkoutButton = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(checkoutButton);

    expect(alertSpy).toHaveBeenCalledWith('Please enter your customer email.');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('successfully processes checkout with returned order ID', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.post.mockResolvedValueOnce({
      data: { id: 999 }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    const emailInput = screen.getByPlaceholderText('customer@example.com');
    fireEvent.change(emailInput, { target: { value: 'buyer@test.com' } });

    const checkoutButton = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/purchases', {
        customerEmail: 'buyer@test.com',
        items: [{ productId: 1, quantity: 1 }]
      });
      expect(alertSpy).toHaveBeenCalledWith('Order successfully created! ID: 999');
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
  });

  test('successfully processes checkout when response has no ID (fallback "Confirmed")', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.post.mockResolvedValueOnce({
      data: {}
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    const emailInput = screen.getByPlaceholderText('customer@example.com');
    fireEvent.change(emailInput, { target: { value: 'buyer@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Order successfully created! ID: Confirmed');
    });
  });

  test('handles checkout failure with server response error message', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Insufficient stock in warehouse'
        }
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    const emailInput = screen.getByPlaceholderText('customer@example.com');
    fireEvent.change(emailInput, { target: { value: 'buyer@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error processing order: Insufficient stock in warehouse');
      expect(screen.getByText('1 x $25.5')).toBeInTheDocument();
    });
  });

  test('handles checkout failure with generic error message', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });
    api.post.mockRejectedValueOnce(new Error('Network failure'));

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    const emailInput = screen.getByPlaceholderText('customer@example.com');
    fireEvent.change(emailInput, { target: { value: 'buyer@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Error processing order: Network failure');
    });
  });

  test('filters catalog using ProductSearchBar search input', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: mockProducts,
        totalPages: 1,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[1]],
        totalPages: 1,
        number: 0
      }
    });

    const searchInput = screen.getByPlaceholderText('Search by name or SKU...');
    fireEvent.change(searchInput, { target: { value: 'Keyboard' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products/search?q=Keyboard&page=0&size=20');
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    });
  });

  test('handles pagination navigation and validates boundary conditions', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [mockProducts[0]],
        totalPages: 2,
        number: 0
      }
    });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    const invalidLowerBtn = screen.getByRole('button', { name: /Invalid Lower Bound/i });
    fireEvent.click(invalidLowerBtn);
    expect(api.get).toHaveBeenCalledTimes(1); 

    const invalidUpperBtn = screen.getByRole('button', { name: /Invalid Upper Bound/i });
    fireEvent.click(invalidUpperBtn);
    expect(api.get).toHaveBeenCalledTimes(1); 

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
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

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
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
  });
});
