import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import './ChartsPanel.css'
import type { Service } from '../../types'

interface ChartsPanelProps {
  services: Service[]
}

const STATUS_LABELS = ['Agendados', 'Concluídos', 'Atrasados']
const STATUS_COLORS = [
  'rgba(96,165,250,0.7)',
  'rgba(74,222,128,0.7)',
  'rgba(248,113,113,0.7)',
]
const STATUS_BORDER = ['#60a5fa', '#4ade80', '#f87171']

const TYPE_LABELS = [
  'Adesivo',
  'Automativo',
  'Fachada de ACM',
  'Letra caixa/acrilico',
  'Lona c/ Ilhos',
  'Painel de lona',
  'Outro',
]

const TYPE_COLORS = [
  '#3b82f6',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#eab308',
  '#10b981',
  '#94a3b8', 
]

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()

function isoToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function ChartsPanel({ services }: ChartsPanelProps) {
  const [themeVersion, setThemeVersion] = useState(0)

  const statusCanvas = useRef<HTMLCanvasElement | null>(null)
  const typeCanvas = useRef<HTMLCanvasElement | null>(null)

  const statusChart = useRef<Chart | null>(null)
  const typeChart = useRef<Chart | null>(null)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((v) => v + 1)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const chartCanvasColor = cssVar('--text-chart-canvas')

    const todayIso = isoToday()

    const agendados = services.filter(
      (service) => !service.done && service.end >= todayIso
    ).length

    const concluidos = services.filter(
      (service) => service.done
    ).length

    const atrasados = services.filter(
      (service) => !service.done && service.end < todayIso
    ).length

    if (statusChart.current) {
      statusChart.current.destroy()
    }

    if (statusCanvas.current) {
      statusChart.current = new Chart(statusCanvas.current, {
        type: 'bar',
        data: {
          labels: STATUS_LABELS,
          datasets: [
            {
              data: [agendados, concluidos, atrasados],
              backgroundColor: STATUS_COLORS,
              borderColor: STATUS_BORDER,
              borderWidth: 1,
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: STATUS_COLORS.map((color) =>
                color.replace('0.7', '0.95')
              ),
            },
          ],
        },
        options: {
          animation: {
            duration: 900,
            easing: 'easeOutQuart',
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(15,15,25,0.95)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: 'rgba(255,255,255,0.7)',
              callbacks: {
                label: (ctx: any) => `${ctx.parsed.y} serviço(s)`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: chartCanvasColor,
              },
              grid: {
                color: chartCanvasColor,
              },
              border: {
                color: 'transparent',
              },
            },
            x: {
              ticks: {
                color: chartCanvasColor,
              },
              grid: {
                display: false,
              },
              border: {
                color: 'transparent',
              },
            },
          },
        },
      })
    }

    if (typeChart.current) {
      typeChart.current.destroy()
    }

    if (typeCanvas.current) {
      // Contagem direta sem checagens extras
      const counts = TYPE_LABELS.map((label) =>
        services.filter((service) => service.t === label).length
      )

      typeChart.current = new Chart(typeCanvas.current, {
        type: 'doughnut',
        data: {
          labels: TYPE_LABELS,
          datasets: [
            {
              data: counts,
              backgroundColor: TYPE_COLORS,
              borderColor: 'rgba(255,255,255,0.08)',
              borderWidth: 2,
              hoverOffset: 12,
              hoverBorderColor: 'rgba(255,255,255,0.3)',
            },
          ],
        },
        options: {
          animation: {
            duration: 900,
            easing: 'easeOutQuart',
            animateRotate: true,
            animateScale: true,
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 16,
                font: {
                  size: 11,
                },
                color: chartCanvasColor,
                boxWidth: 12,
                borderRadius: 6,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(15,15,25,0.95)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: 'rgba(255,255,255,0.7)',
              callbacks: {
                label: (ctx: any) =>
                  `${ctx.label}: ${ctx.parsed} serviço(s)`,
              },
            },
          },
          cutout: '62%',
        },
      })
    }
    return () => {
      statusChart.current?.destroy()
      typeChart.current?.destroy()
    }
  }, [services, themeVersion])

  return (
    <div className="charts-row">
      <div className="chart-panel">
        <div className="chart-title">
          <i className="ti ti-chart-bar" /> Status dos agendamentos
        </div>
        <canvas
          className="chart-canvas"
          ref={statusCanvas}
          height={160}
        />
      </div>

      <div className="chart-panel">
        <div className="chart-title">
          <i className="ti ti-chart-donut" /> Serviços por tipo
        </div>
        <canvas
          ref={typeCanvas}
          height={160}
        />
      </div>
    </div>
  )
}