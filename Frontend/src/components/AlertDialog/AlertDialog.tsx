import './AlertDialog.css'

interface AlertDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'success'
  onConfirm: () => void
  onCancel: () => void
}

export default function AlertDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  if (!open) return null
  const defaultTitle = title ?? (variant === 'success' ? 'Confirmar Ação' : 'Atenção')
  const iconClass = variant === 'success' ? 'ti ti-circle-check' : 'ti ti-alert-triangle'
  return (
    <div className="alert-overlay show" onClick={onCancel}>
      <div className={`alert-modal is-${variant}`} onClick={(event) => event.stopPropagation()}>
        <h3>
          <i className={`${iconClass} alert-icon-badge`} />
          <span>{defaultTitle}</span>
        </h3>
        
        <p className="alert-message">{message}</p>

        <div className="alert-btn-row">
          <button className="alert-bc" type="button" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="alert-bs" type="button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}