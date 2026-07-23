import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Service } from '../../types'
import backendUrl from '../../services/backendUrl'
import './ServicePreviewTooltip.css'

type ExtendedService = Service & Record<string, any>

interface Props {
  service: ExtendedService
  collaboratorName: string
  children: React.ReactNode
}

export function ServicePreviewTooltip({ service, collaboratorName, children }: Props) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const rawImage =
    service.img || service.image || service.photo || service.imageUrl || service.foto
  const imagePath = Array.isArray(rawImage) ? rawImage[0] : rawImage

  const imageUrl = imagePath
    ? imagePath.startsWith('blob:') || imagePath.startsWith('http')
      ? imagePath
      : `${backendUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
    : null

  const handleMouseMove = (e: React.MouseEvent) => {
    setCoords({
      x: e.clientX + 14,
      y: e.clientY + 14,
    })
  }

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {isVisible &&
        createPortal(
          <div
            className="service-tooltip-card glass"
            style={{
              top: `${coords.y}px`,
              left: `${coords.x}px`,
            }}
          >
            <div className="tooltip-thumb-container">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={service.c || 'Preview do serviço'}
                  className="tooltip-thumb-img"
                />
              ) : (
                <div className="tooltip-thumb-placeholder">
                  <span>Sem imagem</span>
                </div>
              )}
            </div>

            <div className="tooltip-header">
              <strong>{service.c || 'Serviço sem cliente'}</strong>
              <span className={`status-tag ${service.done ? 'done' : 'pending'}`}>
                {service.done ? 'Concluído' : 'Em andamento'}
              </span>
            </div>

            <div className="tooltip-body">
              {service.t && (
                <p>
                  <strong>Tipo:</strong> {service.t}
                </p>
              )}
              <p>
                <strong>Colaborador:</strong> {collaboratorName || 'Não atribuído'}
              </p>
              {service.d && (
                <p className="tooltip-obs">
                  <strong>Obs:</strong> {service.d}
                </p>
              )}

              {service.start && (
                <p>
                  <strong>Início:</strong>{' '}
                  {new Date(service.start).toLocaleDateString('pt-BR')}
                </p>
              )}
              {service.end && (
                <p>
                  <strong>Fim:</strong>{' '}
                  {new Date(service.end).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}