// frontend/src/components/layout/Modal.js
import React from 'react';
import './layout.css';

function Modal({ active, closeModal, title, children }) {
  if (!active) return null;
  
  return (
    <div className="modal" style={{ display: active ? 'block' : 'none' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <span className="close-button" onClick={closeModal}>&times;</span>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;