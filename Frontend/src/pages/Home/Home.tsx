import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header/Header'
import StatsPanel from '../../components/StatsPanel/StatsPanel'
import Filters from '../../components/Filters/Filters'
import SearchBar from '../../components/SearchBar/SearchBar'
import Legend from '../../components/Legend/Legend'
import WeekCalendar from '../../components/Calendar/WeekCalendar'
import MonthCalendar from '../../components/Calendar/MonthCalendar'
import WeatherPanel from '../../components/WeatherPanel/WeatherPanel'
import ChartsPanel from '../../components/ChartsPanel/ChartsPanel'
import ModalDialog from '../../components/ModalDialog/ModalDialog'
import { useServices } from '../../context/services'
import { useUsers } from '../../context/users'
import type {
  Service,
  ServiceForm,
  FilterType,
  ViewMode,
  WeatherDay,
  ServiceType,
} from '../../types'
import './Home.css'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const TIPOS: Record<ServiceType, string> = {
  Adesivo: 't-adesivo',
  Automativo: 't-automativo',
  'Fachada de ACM': 't-fachada-de-acm',
  'Letra caixa/acrilico': 't-letra-caixa-acrilico',
  'Lona c/ Ilhos': 't-lona-c-ilhos',
  'Painel de lona': 't-painel-de-lona',
  Outro: 't-outro',
}

const FILTER_TYPES: FilterType[] = [
  'Todos',
  'Adesivo',
  'Automativo',
  'Fachada de ACM',
  'Letra caixa/acrilico',
  'Lona c/ Ilhos',
  'Painel de lona',
  'Outro',
]

const FILTER_LABELS: Record<FilterType, string> = {
  Todos: 'Todos',
  Adesivo: 'Adesivo',
  Automativo: 'Automotivo',
  'Fachada de ACM': 'Fachada de ACM',
  'Letra caixa/acrilico': 'Letra Caixa / Acrílico',
  'Lona c/ Ilhos': 'Lona c/ Ilhós',
  'Painel de lona': 'Painel de Lona',
  Outro: 'Outro',
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const iso = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const toDateTimeLocalValue = (value: string | undefined | null) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const getEmptyForm = (defaultDate: string): ServiceForm => ({
  id: null,
  c: '',
  t: 'Adesivo',
  d: '',
  collaborator: '',
  start: `${defaultDate}T08:00`,
  end: `${defaultDate}T09:00`,
  img: null,
  done: false,
})

function isAtrasado(service: Service) {
  const endDate = service.end?.substring(0, 10)
  return Boolean(!service.done && endDate && endDate < iso(today))
}

function weekDays(offset: number) {
  const reference = new Date(today)
  const dow = reference.getDay()
  const monday = new Date(reference)
  monday.setDate(reference.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7)
  return Array.from({ length: 21 }, (_, index) => {
    const item = new Date(monday)
    item.setDate(monday.getDate() + index)
    return item
  })
}

function monthFirstDay(offset: number) {
  const now = new Date(today)
  return new Date(now.getFullYear(), now.getMonth() + offset, 1)
}

function buildMonthCells(base: Date) {
  const year = base.getFullYear()
  const month = base.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const startGrid = new Date(firstDay)
  startGrid.setDate(firstDay.getDate() - startDow)
  const todayIso = iso(today)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startGrid)
    date.setDate(startGrid.getDate() + index)
    const dateKey = iso(date)
    const isCurrentMonth = date.getMonth() === month

    return {
      date,
      dateKey,
      isToday: dateKey === todayIso,
      isCurrentMonth,
      services: [],
    }
  })
}

export default function Home() {
  const { services } = useServices()
  const { users } = useUsers()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const savedTheme = window.localStorage.getItem('agenda-theme')
    return savedTheme === 'light' ? 'light' : 'dark'
  })
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const [modalForm, setModalForm] = useState<ServiceForm>(
    getEmptyForm(iso(today))
  )
  const [weatherDays, setWeatherDays] = useState<WeatherDay[]>([])
  const [weatherError, setWeatherError] = useState('')

  const filteredByType = useMemo(() => {
    if (activeFilter === 'Todos') return services
    return services.filter((service) => service.t === activeFilter)
  }, [activeFilter, services])

  const searchedServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return filteredByType
    return filteredByType.filter((service) =>
      [
        service.c,
        service.t,
        typeof service.collaborator === 'string'
          ? service.collaborator
          : service.collaborator?.name,
        service.d,
        service.start,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [filteredByType, searchQuery])

  const weekDates = useMemo(() => weekDays(weekOffset), [weekOffset])

  const todayIso = iso(today)

  const statsSummary = useMemo(() => {
    const agendados = filteredByType.filter((service) => !service.done).length
    const concluidos = filteredByType.filter((service) => service.done).length
    const atrasados = filteredByType.filter(isAtrasado).length
    return {
      agendados,
      concluidos,
      atrasados,
    }
  }, [filteredByType])

  const monthBase = useMemo(() => monthFirstDay(monthOffset), [monthOffset])

  const formatDayMonth = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  const monthLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `${MESES[monthBase.getMonth()]} ${monthBase.getFullYear()}`
    }

    const first = weekDates[0]
    const last = weekDates[20]

    const monthText =
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()
        ? `${MESES[first.getMonth()]} ${first.getFullYear()}`
        : `${MESES[first.getMonth()]} / ${
            MESES[last.getMonth()]
          } ${last.getFullYear()}`

    return `${formatDayMonth(first)} – ${formatDayMonth(
      last
    )} · ${monthText}`
  }, [viewMode, monthBase, weekDates])

  const monthCells = useMemo(
    () => buildMonthCells(monthBase),
    [monthBase]
  )

  const searchResultCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    return searchedServices.length
  }, [searchQuery, searchedServices])

  const chartTypeServices = useMemo(() => services, [services])

  const openModal = (date: string, serviceId: string | null) => {
    if (serviceId) {
      const service = services.find((item) => item._id === serviceId)
      if (service) {
        setModalForm({
          id: service._id,
          c: service.c,
          t: service.t,
          d: service.d,
          collaborator:
            typeof service.collaborator === 'string'
              ? service.collaborator
              : service.collaborator?._id ?? '',
          start: toDateTimeLocalValue(service.start),
          end: toDateTimeLocalValue(service.end),
          img: service.image ?? null,
          done: service.done,
        })
      }
    } else {
      setModalForm(getEmptyForm(date || todayIso))
    }
    setModalOpen(true)
  }

  const COL_COLORS = useMemo(() => {
    const colors = [
      '#4ade80',
      '#60a5fa',
      '#f472b6',
      '#facc15',
      '#fb923c',
      '#a78bfa',
      '#048A81',
      '#06D6A0',
      '#54C6EB',
      '#8A89C0',
      '#CDA2AB'
    ]

    return users.reduce<Record<string, string>>((acc, user, index) => {
      const color = colors[index % colors.length]
      if (user.name) acc[user.name] = color
      if (user._id) acc[user._id] = color
      return acc
    }, {})
  }, [users])

  const closeModal = () => setModalOpen(false)

  const handleFormChange = <K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K]
  ) => {
    setModalForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    setModalForm((previous) => ({ ...previous, img: file }))
  }

  const changeFilter = (filter: FilterType) => setActiveFilter(filter)
  const changeView = (mode: ViewMode) => setViewMode(mode)

  const movePeriod = (direction: number) => {
    if (viewMode === 'week') {
      setWeekOffset((previous) => previous + direction)
    } else {
      setMonthOffset((previous) => previous + direction)
    }
  }

  const clearSearch = () => setSearchQuery('')

  const jumpToWeekOf = (dateKey: string) => {
    const target = new Date(`${dateKey}T12:00:00`)
    const startOfCurrentWeek = new Date(today)
    const currentDow =
      startOfCurrentWeek.getDay() === 0 ? 6 : startOfCurrentWeek.getDay() - 1
    startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - currentDow)
    const targetDow = target.getDay() === 0 ? 6 : target.getDay() - 1
    const startOfTargetWeek = new Date(target)
    startOfTargetWeek.setDate(target.getDate() - targetDow)
    const diff = Math.round(
      (startOfTargetWeek.getTime() - startOfCurrentWeek.getTime()) /
        (7 * 86400000)
    )
    setWeekOffset(diff)
    setViewMode('week')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('agenda-theme', theme)
  }, [theme])

  useEffect(() => {
    async function loadWeather() {
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast?latitude=-24.9578&longitude=-53.4595&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=America%2FSao_Paulo&forecast_days=14'
        const response = await fetch(url)
        const data = await response.json()
        const descs: Record<number, string> = {
          0: 'Céu limpo',
          1: 'Poucas nuvens',
          2: 'Parc. nublado',
          3: 'Nublado',
          45: 'Névoa',
          48: 'Névoa',
          51: 'Chuvisco',
          53: 'Chuvisco',
          55: 'Chuvisco',
          61: 'Chuva leve',
          63: 'Chuva mod.',
          65: 'Chuva forte',
          71: 'Neve leve',
          73: 'Neve',
          75: 'Neve forte',
          80: 'Pancadas',
          81: 'Pancadas',
          82: 'Tempestade',
          95: 'Trovoada',
          99: 'Trovoada',
        }
        const days = data.daily
        const nextDays: WeatherDay[] = days.time.map(
          (value: string, index: number) => {
            const dt = new Date(`${value}T12:00:00`)
            return {
              date: value,
              weekday: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][
                dt.getDay()
              ],
              tempMax: Math.round(days.temperature_2m_max[index]),
              tempMin: Math.round(days.temperature_2m_min[index]),
              weatherCode: days.weathercode[index],
              precipitation: Number(
                parseFloat(days.precipitation_sum[index]).toFixed(1)
              ),
              description: descs[days.weathercode[index]] || '',
            }
          }
        )
        setWeatherDays(nextDays)
      } catch (error) {
        setWeatherError('Não foi possível carregar. Verifique sua conexão.')
      }
    }

    loadWeather()
  }, [])

  return (
    <div className={`wrap theme-${theme}`}>
      <Header
        monthLabel={monthLabel}
        viewMode={viewMode}
        theme={theme}
        onPrev={() => movePeriod(-1)}
        onNext={() => movePeriod(1)}
        onViewChange={changeView}
        onAdd={() => openModal(todayIso, null)}
        onToggleTheme={() =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
        }
      />
      <div className="main-content">
        <StatsPanel data={statsSummary} />
        <Filters
          options={FILTER_TYPES}
          activeFilter={activeFilter}
          labels={FILTER_LABELS}
          onChange={changeFilter}
        />
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          resultCount={searchResultCount}
        />
        <Legend collaboratorColors={COL_COLORS} />
        <div className="view-container">
          {viewMode === 'week' ? (
            <WeekCalendar
              dates={weekDates}
              services={searchedServices}
              onAdd={openModal}
              onEdit={openModal}
              todayIso={todayIso}
              tipClasses={TIPOS}
              collaborators={COL_COLORS}
            />
          ) : (
            <MonthCalendar
              cells={monthCells}
              services={searchedServices}
              onAdd={openModal}
              onJumpToWeek={jumpToWeekOf}
              tipClasses={TIPOS}
              todayIso={todayIso}
            />
          )}
        </div>
      </div>
      <div className="outside">
        <WeatherPanel data={weatherDays} error={weatherError} />
        <ChartsPanel services={chartTypeServices} />
      </div>
      <ModalDialog
        open={modalOpen}
        form={modalForm}
        onClose={closeModal}
        onChange={handleFormChange}
        onFileChange={handleFileChange}
      />
    </div>
  )
}