import './Filters.css'
import type { FilterType } from '../../types'

interface FiltersProps {
  options: FilterType[]
  labels: Record<FilterType, string>
  activeFilter: FilterType
  onChange: (filter: FilterType) => void
}

export default function Filters({ options, labels, activeFilter, onChange }: FiltersProps) {
  return (
    <div className="filters">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`fb ${activeFilter === option ? 'on' : ''}`}
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}
