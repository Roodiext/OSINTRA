import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

const PermissionDenied: React.FC = () => {
  const { props } = usePage<{ message?: string; redirect?: string }>();
  
  useEffect(() => {
    const message = props.message || 'Anda tidak memiliki izin untuk mengakses halaman ini.';
    const redirectUrl = props.redirect || '/dashboard';

    // Add custom styles untuk alert
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Animation untuk alert */
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Container backdrop - semi transparent dengan blur */
      .swal2-container.swal2-shown {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
      }

      /* Popup styling */
      .swal2-popup {
        border-radius: 16px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3) !important;
        padding: 2.5rem !important;
        max-width: 500px !important;
        background: white !important;
        animation: slideIn 0.3s ease-out !important;
      }

      .swal2-title {
        color: #3B4D3A !important;
        font-size: 28px !important;
        font-weight: 800 !important;
        margin-bottom: 1rem !important;
        margin-top: 0.5rem !important;
      }

      .swal2-html-container {
        color: #555 !important;
        font-size: 16px !important;
        line-height: 1.7 !important;
        margin: 1.5rem 0 !important;
        text-align: left !important;
      }

      /* Icon styling */
      .swal2-icon {
        margin-bottom: 1rem !important;
      }

      .swal2-icon.swal2-warning {
        color: #f59e0b !important;
        border-color: #f59e0b !important;
      }

      .swal2-icon.swal2-warning [class*='swal2-icon-content'] {
        color: #f59e0b !important;
      }

      /* Button styling */
      .swal2-confirm {
        background-color: #3B4D3A !important;
        border: none !important;
        color: white !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        padding: 12px 40px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        min-width: 180px !important;
        margin-top: 1rem !important;
      }

      .swal2-confirm:hover {
        background-color: #2d3a2c !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 25px rgba(59, 77, 58, 0.3) !important;
      }

      .swal2-confirm:active {
        transform: translateY(0) !important;
      }

      .swal2-confirm:focus {
        outline: none !important;
        box-shadow: 0 0 0 4px rgba(59, 77, 58, 0.1), 0 10px 25px rgba(59, 77, 58, 0.3) !important;
      }

      /* Disable scrollbar when alert is shown */
      html.swal2-shown {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Show alert
    Swal.fire({
      title: 'Akses Ditolak',
      html: `<div>${message}</div>`,
      icon: 'warning',
      confirmButtonText: 'Kembali',
      confirmButtonColor: '#3B4D3A',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      width: 'auto',
      padding: '2.5rem',
      didOpen: (modal) => {
        // Ensure popup has high z-index
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.zIndex = '99999';
        }
        // Ensure container has correct z-index
        const container = document.querySelector('.swal2-container');
        if (container) {
          (container as HTMLElement).style.zIndex = '99998';
        }
      },
    }).then((result) => {
      // Clean up styles
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }

      if (result.isConfirmed) {
        // Safe redirect
        try {
          if (redirectUrl && redirectUrl.length > 0) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = '/dashboard';
          }
        } catch (e) {
          window.location.href = '/dashboard';
        }
      }
    }).catch((error) => {
      // Clean up on error
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      console.error('Alert error:', error);
      // Fallback redirect
      window.location.href = '/dashboard';
    });

    // Cleanup function
    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      Swal.close();
    };
  }, [props.message, props.redirect]);

  // Invisible element - page content will show in background
  return <div style={{ display: 'none' }} />;
};

export default PermissionDenied;
