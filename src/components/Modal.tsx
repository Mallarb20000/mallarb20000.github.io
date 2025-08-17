import React from 'react';

interface ModalButton {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  iconColor?: 'warning' | 'danger' | 'success' | 'info';
  children: React.ReactNode;
  buttons: ModalButton[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  iconColor = 'warning',
  children,
  buttons
}) => {
  if (!isOpen) return null;

  const getIconBackground = () => {
    switch (iconColor) {
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
      case 'danger':
        return 'linear-gradient(135deg, #ef4444, #f87171)';
      case 'success':
        return 'linear-gradient(135deg, #16a34a, #4ade80)';
      case 'info':
        return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
      default:
        return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
    }
  };

  const getHeaderBackground = () => {
    switch (iconColor) {
      case 'warning':
        return 'linear-gradient(135deg, #fef3c7, rgba(245, 158, 11, 0.05))';
      case 'danger':
        return 'linear-gradient(135deg, #fef2f2, rgba(239, 68, 68, 0.05))';
      case 'success':
        return 'linear-gradient(135deg, #f0fdf4, rgba(22, 163, 74, 0.05))';
      case 'info':
        return 'linear-gradient(135deg, #eff6ff, rgba(59, 130, 246, 0.05))';
      default:
        return 'linear-gradient(135deg, #fef3c7, rgba(245, 158, 11, 0.05))';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: getHeaderBackground() }}>
          {icon && (
            <div className="modal-icon" style={{ background: getIconBackground() }}>
              {icon}
            </div>
          )}
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          {buttons.map((button, index) => (
            <button
              key={index}
              className={`btn ${button.variant === 'primary' ? 'btn-primary btn-gradient' : 'btn-secondary'}`}
              onClick={button.onClick}
              disabled={button.disabled || button.loading}
            >
              {button.loading ? 'Loading...' : button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;