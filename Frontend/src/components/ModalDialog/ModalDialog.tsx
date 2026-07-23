import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import './ModalDialog.css'

import type { ServiceForm } from '../../types'
import { useAuth } from '../../context/auth'
import { useUsers } from '../../context/users'
import { useServices } from '../../context/services'
import backendUrl from '../../services/backendUrl'
import AlertDialog from '../AlertDialog/AlertDialog'

interface ModalDialogProps {
  open: boolean
  form: ServiceForm
  onClose: () => void
  onChange: <K extends keyof ServiceForm>(field: K, value: ServiceForm[K]) => void
  onFileChange: (file: File | null) => void
}

export default function ModalDialog({
  open,
  form,
  onClose,
  onChange,
  onFileChange,
}: ModalDialogProps) {
  const { users } = useUsers()
  const { createService, updateService, deleteService, toggleDone } = useServices()
  const { userData, isAuthenticated } = useAuth()

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [alertType, setAlertType] = useState<'delete' | 'complete' | null>(null)

  const isEditing = form.id !== null
  const badgeText = isEditing ? 'EDITAR' : 'NOVO'

  const canEdit = Boolean(isAuthenticated && userData?.admin)
  const isDisabled = !canEdit

  useEffect(() => {
    if (!open) setAlertType(null)
  }, [open])

  useEffect(() => {
    if (!form.img) {
      setPreviewUrl(null)
      return
    }

    if (form.img instanceof File) {
      const url = URL.createObjectURL(form.img)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }

    if (typeof form.img === 'string') {
      setPreviewUrl(form.img)
    }
  }, [form.img])

  function handleClose() {
    onFileChange(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  async function handleSave() {
    if (isDisabled) return

    if (!form.c.trim()) {
      toast.error('Informe o nome do cliente.')
      return
    }

    if (!form.t) {
      toast.error('Selecione o tipo de serviço.')
      return
    }

    if (!form.collaborator) {
      toast.error('Selecione um colaborador.')
      return
    }

    if (!form.start) {
      toast.error('Informe a data de início.')
      return
    }

    if (!form.end) {
      toast.error('Informe a data de término.')
      return
    }

    if (new Date(form.end) <= new Date(form.start)) {
      toast.error('A data de término deve ser posterior ao início.')
      return
    }

    const payload = {
      c: form.c.trim(),
      t: form.t,
      d: form.d.trim(),
      collaborator: form.collaborator,
      start: form.start,
      end: form.end,
      img: form.img instanceof File ? form.img : null,
      done: form.done
    }

    try {
      if (isEditing && form.id) {
        await updateService(form.id, payload)
      } else {
        await createService(payload)
      }

      handleClose()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar serviço.')
    }
  }

  async function handleConfirmDelete() {
    if (!form.id || isDisabled) return
    await deleteService(form.id)
    setAlertType(null)
    handleClose()
  }

  async function handleConfirmComplete() {
    if (!form.id || isDisabled) return
    await toggleDone(form.id)
    setAlertType(null)
    handleClose()
  }

  return (
    <>
      <div
        className={`overlay${open ? ' show' : ''}`}
        onClick={(e) => e.currentTarget === e.target && handleClose()}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>
            <span>{isEditing ? 'Editar serviço' : 'Novo serviço'}</span>
            <span className="mbadge">{badgeText}</span>
          </h3>

          <div className="fr">
            <label>Cliente *</label>
            <input
              value={form.c}
              disabled={isDisabled}
              onChange={(e) => onChange('c', e.target.value)}
              placeholder="Ex: C-Forte, Studio KT..."
            />
          </div>

          <div className="fr">
            <label>Tipo de serviço *</label>
            <select
              value={form.t}
              disabled={isDisabled}
              onChange={(e) => onChange('t', e.target.value as ServiceForm['t'])}
            >
              <option value="">Selecione um tipo</option>
              <option value="Adesivo">Adesivo</option>
              <option value="Fachada">Fachada</option>
              <option value="Automativo">Automotivo</option>
              <option value="ACM">Fachada de ACM</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="fr">
            <label>Observação (opcional)</label>
            <textarea
              value={form.d}
              disabled={isDisabled}
              onChange={(e) => onChange('d', e.target.value)}
              placeholder="Detalhes do serviço..."
            />
          </div>

          <div className="fr">
            <label>Foto / Print *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isDisabled}
              onChange={(event) =>
                onFileChange(
                  event.target.files?.[0] ?? null
                )
              }
            />

            {previewUrl && (
              <img
                className="img-preview"
                src={previewUrl.startsWith('blob:') ? previewUrl : backendUrl + previewUrl}
                alt="Preview"
              />
            )}
          </div>

          <div className="fr">
            <label>Colaborador *</label>
            <select 
              value={form.collaborator} 
              disabled={isDisabled}
              onChange={(e) => onChange('collaborator', e.target.value)}
            >
              <option value="">Selecione um colaborador</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="datetime-grid">
            <div className="fr">
              <label>Data e hora de início *</label>
              <input
                type="datetime-local"
                value={form.start}
                disabled={isDisabled}
                onChange={(e) => onChange('start', e.target.value)}
              />
            </div>

            <div className="fr">
              <label>Data e hora de término *</label>
              <input
                type="datetime-local"
                value={form.end}
                min={form.start}
                disabled={isDisabled}
                onChange={(e) => onChange('end', e.target.value)}
              />
            </div>
          </div>

          <div className="btn-row">
            {canEdit && isEditing && (
              <button className="btn-del" type="button" onClick={() => setAlertType('delete')}>
                <i className="ti ti-trash" /> Excluir
              </button>
            )}

            <div className="btn-right" style={{ marginLeft: canEdit && isEditing ? 'auto' : '0' }}>
              {canEdit && isEditing && (
                <button
                  className="btn-concluir"
                  type="button"
                  disabled={form.done}
                  onClick={() => setAlertType('complete')}
                >
                  <i className={`ti ${form.done ? 'ti-check-double' : 'ti-check'}`} />{' '}
                  {form.done ? 'Concluído' : 'Marcar concluído'}
                </button>
              )}

              <button className="bc" type="button" onClick={handleClose}>
                {canEdit ? 'Cancelar' : 'Fechar'}
              </button>

              {canEdit && (
                <button className="bs" type="button" onClick={handleSave}>
                  Salvar
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <AlertDialog
        open={alertType === 'delete'}
        variant="danger"
        title="Excluir Agendamento"
        message="Deseja realmente excluir este agendamento?"
        confirmText="Sim, excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAlertType(null)}
      />

      <AlertDialog
        open={alertType === 'complete'}
        variant="success"
        title="Concluir Chamado"
        message={`Deseja marcar o serviço do cliente "${form.c || 'Cliente'}" como concluído?`}
        confirmText="Sim, concluir"
        cancelText="Não, voltar"
        onConfirm={handleConfirmComplete}
        onCancel={() => setAlertType(null)}
      />
    </>
  )
}