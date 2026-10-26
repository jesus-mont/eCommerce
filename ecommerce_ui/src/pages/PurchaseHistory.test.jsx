import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurchaseHistory from './PurchaseHistory';
import api from '../services/api';

// Mocks de la API
jest.mock('../services/api');

describe('PurchaseHistory Component - Complete Coverage', () => {
  const mockPurchases = [
    { id: 1, customerEmail: 'test1@example.com', totalAmount: '100.00' },
    { id: 2, customerEmail: 'test2@example.com', totalAmount: '250.00' }
  ];

  const mockDetailResponse = {
    id: 1,
    customerEmail: 'detail@example.com',
    status: 'COMPLETED',
    totalAmount: '150.00',
    createdAt: '2026-06-01',
    items: [
      { sku: 'ITEM-X', quantity: 3, price: '50.00' }
    ]
  };

  beforeAll(() => {
    // Silencia console.error para los tests de errores esperados
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders purchase history table when response is paginated content', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({
          data: {
            content: [
              { id: 1, customerEmail: 'test1@example.com', totalAmount: '100.00' }
            ],
            totalPages: 2,
            number: 0
          }
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    expect(screen.getByText('Purchase History')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Customer Email')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
  });

  test('renders purchase history correctly when response is a direct array', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({
          data: [
            { id: 2, customerEmail: 'arrayuser@example.com', totalAmount: '250.00' }
          ]
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('arrayuser@example.com')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument();
    });
  });

  test('renders empty state when response structure is invalid or unrecognized', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('No purchases found.')).toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully and sets empty purchases', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.reject(new Error('API Failure'));
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('No purchases found.')).toBeInTheDocument();
    });
  });

  test('fetches and displays purchase details, then closes them', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({
          data: {
            content: [{ id: 1, customerEmail: 'detail@example.com', totalAmount: '150.00' }],
            totalPages: 1,
            number: 0
          }
        });
      }
      if (url === '/purchases/1') {
        return Promise.resolve({ data: mockDetailResponse });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('detail@example.com')).toBeInTheDocument();
    });

    // Clic en "View Details"
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/purchases/1');
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('SKU: ITEM-X')).toBeInTheDocument();
      expect(screen.getByText(/Quantity: 3/i)).toBeInTheDocument();
      expect(screen.getByText('2026-06-01')).toBeInTheDocument();
    });

    // Clic en "Close Details"
    fireEvent.click(screen.getByRole('button', { name: /close details/i }));
    expect(screen.queryByText('COMPLETED')).not.toBeInTheDocument();
    expect(screen.getByText('Select a purchase to view its details.')).toBeInTheDocument();
  });

  test('displays "N/A" for Date when createdAt is null in purchase detail', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({
          data: {
            content: [{ id: 1, customerEmail: 'detail@example.com', totalAmount: '150.00' }],
            totalPages: 1,
            number: 0
          }
        });
      }
      if (url === '/purchases/1') {
        return Promise.resolve({
          data: {
            ...mockDetailResponse,
            createdAt: null
          }
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('detail@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  test('handles fetch purchase details error gracefully', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/purchases?page=')) {
        return Promise.resolve({
          data: {
            content: [{ id: 1, customerEmail: 'error@example.com', totalAmount: '150.00' }],
            totalPages: 1,
            number: 0
          }
        });
      }
      if (url === '/purchases/1') {
        return Promise.reject(new Error('Detail Error'));
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('error@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/purchases/1');
    });

    expect(screen.getByText('Select a purchase to view its details.')).toBeInTheDocument();
  });
});
