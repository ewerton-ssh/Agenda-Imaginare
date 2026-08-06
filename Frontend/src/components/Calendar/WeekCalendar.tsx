import './Calendar.css'
import type { Service, ServiceType } from '../../types'
import { GoGear } from 'react-icons/go'
import { ServicePreviewTooltip } from '../ServicePreviewTooltip/ServicePreviewTooltip'

const BORDER_COLOR_BY_CLASS: Record<string, string> = {
  't-adesivo': '#3b82f6',              
  't-automativo': '#f97316',           
  't-fachada-de-acm': '#a855f7',       
  't-letra-caixa-acrilico': '#ec4899', 
  't-lona-c-ilhos': '#eab308',         
  't-painel-de-lona': '#10b981',       
  't-outro': '#94a3b8',               
}

const BG_COLOR_BY_CLASS: Record<string, string> = {
  't-adesivo': 'rgba(59, 130, 246, 0.18)',
  't-automativo': 'rgba(249, 115, 22, 0.18)',
  't-fachada-de-acm': 'rgba(168, 85, 247, 0.18)',
  't-letra-caixa-acrilico': 'rgba(236, 72, 153, 0.18)',
  't-lona-c-ilhos': 'rgba(234, 179, 8, 0.18)',
  't-painel-de-lona': 'rgba(16, 185, 129, 0.18)',
  't-outro': 'rgba(148, 163, 184, 0.18)',
}

interface WeekCalendarProps {
  dates: Date[]
  services: Service[]
  onAdd: (date: string, id: string | null) => void
  onEdit: (date: string, id: string | null) => void
  todayIso: string
  tipClasses: Record<ServiceType, string>
  collaborators: Record<string, string>
}

const iso = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function WeekCalendar({
  dates,
  services,
  onAdd,
  onEdit,
  todayIso,
  tipClasses,
  collaborators,
}: WeekCalendarProps) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

  const weeks: Date[][] = []
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  return (
    <div className="cal-wrap glass">
      <div className="wg-head">
        {dayNames.map((name, index) => (
          <div key={index} className="wh">
            {name}
          </div>
        ))}
      </div>

      <div className="wg-body-container">
        {weeks.map((weekDates, weekIdx) => {
          const weekStartIso = iso(weekDates[0])
          const weekEndIso = iso(weekDates[6])

          const weekServices = services
            .filter((service) => {
              const start = service.start?.substring(0, 10) || ''
              const end = service.end?.substring(0, 10) || start
              return start <= weekEndIso && end >= weekStartIso
            })
            .map((service) => {
              const startDateIso = service.start?.substring(0, 10) || ''
              const endDateIso = service.end?.substring(0, 10) || startDateIso
              let startCol = weekDates.findIndex((d) => iso(d) === startDateIso) + 1
              if (startCol < 1) startCol = 1
              let endCol = weekDates.findIndex((d) => iso(d) === endDateIso) + 2
              if (endCol > 8 || endDateIso > weekEndIso) endCol = 8
              const span = endCol - startCol
              return {
                service,
                startDateIso,
                startCol,
                endCol,
                span,
              }
            })
            .sort((a, b) => b.span - a.span)

          return (
            <div key={weekIdx} className="week-row">
              <div className="week-grid-cells">
                {weekDates.map((date) => {
                  const dateKey = iso(date)
                  const isToday = dateKey === todayIso

                  return (
                    <div key={dateKey} className={`wcol${isToday ? ' today' : ''}`}>
                      <div className="today-bar" />
                      <div className="wdate-badge">
                        {date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </div>
                      <button
                        className="add-lnk"
                        type="button"
                        onClick={() => onAdd(dateKey, null)}
                      >
                        + add
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="week-grid-events">
                {weekServices.map(({ service, startDateIso, startCol, endCol }) => {
                  const isAtrasado =
                    !service.done &&
                    Boolean(service.end && service.end.substring(0, 10) < todayIso)
                  const collaboratorId =
                    typeof service.collaborator === 'string'
                      ? service.collaborator
                      : service.collaborator?._id ?? ''
                  const collaboratorName =
                    typeof service.collaborator === 'string'
                      ? service.collaborator
                      : service.collaborator?.name ?? ''
                  const userColor =
                    collaborators[collaboratorName] ||
                    collaborators[collaboratorId] ||
                    '#aaa'
                  const borderClass = tipClasses[service.t] || 't-outro'
                  const borderColor = BORDER_COLOR_BY_CLASS[borderClass] || '#94a3b8'
                  const bgColor = BG_COLOR_BY_CLASS[borderClass] || 'rgba(148, 163, 184, 0.18)'
                  return (
                    <ServicePreviewTooltip
                      key={service._id}
                      service={service}
                      collaboratorName={collaboratorName}
                    >
                      <div
                        key={service._id}
                        className={`svc-wrap ${borderClass}`}
                        style={{ gridColumn: `${startCol} / ${endCol}` }}
                      >
                        <div
                          className={`svc${service.done ? ' concluido' : ''}${isAtrasado ? ' atrasado-card' : ''
                            }`}
                          style={
                            service.done || isAtrasado
                              ? undefined
                              : {
                                borderTopColor: borderColor,
                                backgroundColor: bgColor,
                              }
                          }
                        >
                          <button
                            type="button"
                            className="gear-btn"
                            aria-label={`Editar ${service.c}`}
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              onEdit(startDateIso, service._id)
                            }}
                          >
                            <GoGear size={12} />
                          </button>
                          <span className="sname">{service.c}</span>
                          <span
                            className="scolab"
                            style={{ color: userColor }}
                          >
                            <span
                              className="colab-dot"
                              style={{ background: userColor }}
                            />
                            {collaboratorName}
                            {service.done && ' ✓'}
                            {isAtrasado && ' ⚠'}
                          </span>
                        </div>
                      </div>
                    </ServicePreviewTooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}