import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

interface PermissionAlertProps {
  message?: string;
  onClose?: () => void;
}

export const showPermissionAlert = (message?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .swal2-container {
        z-index: 99999 !important;
      }

      .swal2-popup {
        border-radius: 12px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25) !important;
        padding: 2rem !important;
        background: white !important;
        animation: slideIn 0.25s ease-out !important;
      }

      .swal2-title {
        color: #3B4D3A !important;
        font-size: 24px !important;
        font-weight: 700 !important;
        margin-bottom: 0.5rem !important;
      }

      .swal2-html-container {
        color: #666 !important;
        font-size: 15px !important;
        line-height: 1.6 !important;
        margin: 1rem 0 !important;
      }

      .swal2-icon.swal2-warning {
        color: #f59e0b !important;
        border-color: #f59e0b !important;
      }

      .swal2-icon.swal2-warning [class*='swal2-icon-content'] {
        color: #f59e0b !important;
      }

      .swal2-confirm {
        background-color: #3B4D3A !important;
        border: none !important;
        color: white !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        padding: 10px 28px !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        min-width: auto !important;
      }

      .swal2-confirm:hover {
        background-color: #2d3a2c !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 8px 16px rgba(59, 77, 58, 0.25) !important;
      }

      .swal2-confirm:active {
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(styleEl);

    Swal.fire({
      title: 'Akses Ditolak',
      html: `<div>${message || 'Anda tidak memiliki izin untuk mengakses halaman ini.'}</div>`,
      icon: 'warning',
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3B4D3A',
      allowOutsideClick: true,
      allowEscapeKey: true,
      backdrop: 'rgba(0, 0, 0, 0.1)',
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.zIndex = '99999';
        }
      },
    }).then(() => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      resolve(true);
    });
  });
};

export default PermissionAlertProps;
