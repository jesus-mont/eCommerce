import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

describe('Pagination Component', () => {

  test('does not render anything if totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders current page and total pages correctly (1-based index display)', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    
    // El componente muestra "Page 2 de 5" porque currentPage es 1 (0-indexed)
    expect(screen.getByText('Page 2 de 5')).toBeInTheDocument();
  });

  test('disables "Previos" button when on the first page (currentPage === 0)', () => {
    render(
      <Pagination currentPage={0} totalPages={3} onPageChange={() => {}} />
    );

    const prevButton = screen.getByRole('button', { name: /previos/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  test('disables "next" button when on the last page', () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />
    );

    const prevButton = screen.getByRole('button', { name: /previos/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  test('calls onPageChange with previous page index when clicking "Previos"', () => {
    const handlePageChange = jest.fn(); // o vi.fn() si usas Vitest
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />
    );

    const prevButton = screen.getByRole('button', { name: /previos/i });
    fireEvent.click(prevButton);

    // Debe restar 1 a la página actual (2 - 1 = 1)
    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  test('calls onPageChange with next page index when clicking "next"', () => {
    const handlePageChange = jest.fn(); // o vi.fn() si usas Vitest
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Debe sumar 1 a la página actual (1 + 1 = 2)
    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

});