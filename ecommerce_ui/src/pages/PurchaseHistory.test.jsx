import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurchaseHistory from './PurchaseHistory';
import api from '../services/api';

jest.mock('../services/api');

describe('PurchaseHistory Component', () => {

  const mockPurchases = [
    {
      id: 1,
      customerEmail: 'customer1@example.com',
      totalAmount: 150.00,
      createdAt: '2026-06-01 10:00:00'
    },
    {
      id: 2,
      customerEmail: 'customer2@example.com',
      totalAmount: 250.00,
      createdAt: '2026-06-02 12:00:00'
    }
  ];

  const mockPurchaseDetail = {
    id: 1,
    customerEmail: 'customer1@example.com',
    totalAmount: 150.00,
    createdAt: '2026-06-01 10:00:00',
    items: [
      { sku: 'SKU-LAPTOP', quantity: 1, price: 150.00 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders purchase history and fetches purchases on mount', async () => {
    api.get.mockResolvedValueOnce({ data: mockPurchases });

    render(<PurchaseHistory />);

    expect(screen.getByText('Purchase History')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('customer1@example.com')).toBeInTheDocument();
      expect(screen.getByText('customer2@example.com')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/purchases');
  });

  test('fetches and displays purchase details when clicking View Details', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/purchases') {
        return Promise.resolve({ data: mockPurchases });
      }
      if (url === '/purchases/1') {
        return Promise.resolve({ data: mockPurchaseDetail });
      }
      return Promise.reject(new Error('not found'));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('customer1@example.com')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/purchases/1');
      expect(screen.getByText('SKU: SKU-LAPTOP')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1 | Price: $150')).toBeInTheDocument();
    });
  });

  test('closes details view when clicking Close Details', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/purchases') {
        return Promise.resolve({ data: mockPurchases });
      }
      if (url === '/purchases/1') {
        return Promise.resolve({ data: mockPurchaseDetail });
      }
      return Promise.reject(new Error('not found'));
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('customer1@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /View Details/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('SKU: SKU-LAPTOP')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Close Details/i }));

    expect(screen.queryByText('SKU: SKU-LAPTOP')).not.toBeInTheDocument();
    expect(screen.getByText('Select a purchase to view its details.')).toBeInTheDocument();
  });

  test('displays empty message when no purchases are found', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText('No purchases found.')).toBeInTheDocument();
    });
  });

});