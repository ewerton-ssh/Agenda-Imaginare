import './Calendar.css'
import type { Service, ServiceType } from '../../types'
import { GoGear } from 'react-icons/go'

const BORDER_COLOR_BY_CLASS: Record<string, string> = {
  't-adesivo': '#1f82fc',
  't-fachada': '#FFFF00',
  't-envelo': '#FF8000',
  't-acm': '#c084fc',
  't-outro': '#94a3b8',
}

interface MonthCell {
  date: Date
  dateKey: string
  isToday: boolean
  isCurrentMonth: boolean
  services: Service[]
}

interface MonthCalendarProps {
  cells: MonthCell[]
  services: Service[]
  onAdd: (date: string, id: string | null) => void
  onJumpToWeek: (date: string) => void
  tipClasses: Record<ServiceType, string>
  todayIso?: string
}

export default function MonthCalendar({
  cells,
  services,
  onAdd,
  onJumpToWeek,
  tipClasses,
  todayIso = new Date().toISOString().substring(0, 10),
}: MonthCalendarProps) {
  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

  // Divide o array plano de células (35 a 42 dias) em semanas de 7 dias
  const weeks: MonthCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className="month-grid-wrap glass">
      <div className="month-head">
        {dayNames.map((day) => (
          <div key={day} className="wh">
            {day}
          </div>
        ))}
      </div>

      <div className="month-body">
        {weeks.map((weekCells, weekIdx) => {
          const weekStartIso = weekCells[0].dateKey
          const weekEndIso = weekCells[6].dateKey

          // Filtra e calcula a posição das colunas no CSS Grid para a semana atual
          const weekServices = services
            .filter((service) => {
              const start = service.start?.substring(0, 10) || ''
              const end = service.end?.substring(0, 10) || start
              return start <= weekEndIso && end >= weekStartIso
            })
            .map((service) => {
              const startDateIso = service.start?.substring(0, 10) || ''
              const endDateIso = service.end?.substring(0, 10) || startDateIso

              let startCol =
                weekCells.findIndex((c) => c.dateKey === startDateIso) + 1
              if (startCol < 1) startCol = 1

              let endCol =
                weekCells.findIndex((c) => c.dateKey === endDateIso) + 2
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
            <div key={weekIdx} className="month-week-row">
              {/* Camada do Fundo: Grade de Dias */}
              <div className="month-grid-cells">
                {weekCells.map((cell) => (
                  <div
                    key={cell.dateKey}
                    className={`month-cell${cell.isToday ? ' today-m' : ''}${
                      cell.isCurrentMonth ? '' : ' other-month'
                    }`}
                  >
                    <div className="today-bar" />
                    <div className="month-cell-header">
                      <span className="month-day-num">
                        {cell.date.getDate()}
                      </span>
                      <button
                        className="month-jump-btn"
                        type="button"
                        onClick={() => onJumpToWeek(cell.dateKey)}
                        title="Ver semana"
                      >
                        semana
                      </button>
                    </div>

                    <button
                      className="add-lnk"
                      type="button"
                      onClick={() => onAdd(cell.dateKey, null)}
                    >
                      + add
                    </button>
                  </div>
                ))}
              </div>

              {/* Camada Superior: Eventos com Grid Column Span */}
              <div className="month-grid-events">
                {weekServices.map(
                  ({ service, startDateIso, startCol, endCol }) => {
                    const endDate = service.end?.substring(0, 10)
                    const isAtrasado =
                      !service.done && Boolean(endDate && endDate < todayIso)

                    const borderClass = tipClasses[service.t] || 't-outro'
                    const borderColor =
                      BORDER_COLOR_BY_CLASS[borderClass] || '#94a3b8'

                    return (
                      <button
                        key={service._id}
                        type="button"
                        className={`svc-mini ${borderClass}${
                          service.done ? ' concluido-m' : ''
                        }${isAtrasado ? ' atrasado-m' : ''}`}
                        style={{
                          gridColumn: `${startCol} / ${endCol}`,
                          borderLeftColor: borderColor,
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          onAdd(startDateIso, service._id)
                        }}
                        title={`${service.c} · ${service.t}${
                          isAtrasado ? ' (Atrasado)' : ''
                        }`}
                      >
                        <span className="svc-mini-title">{service.c}</span>
                        <GoGear className="mini-gear-icon" size={10} />
                      </button>
                    )
                  }
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}