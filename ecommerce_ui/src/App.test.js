import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders e-commerce navigation brand', () => {
  render(<App />);
  const brandElement = screen.getByText('E-Commerce App');
  expect(brandElement).toBeInTheDocument();
});