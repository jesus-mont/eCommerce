import React from 'react';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null; 
    return (
        <div className="pagination-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 0}
                className="pagination-btn"
            >
                Previos
            </button>

            <span style={{ alignSelf: 'center' }}>
                Page {currentPage + 1} of {totalPages}
            </span>

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
            >
                next
            </button>
        </div>
    );
}
