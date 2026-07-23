import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  resultCount: number
}

export default function SearchBar({ value, onChange, onClear, resultCount }: SearchBarProps) {
  return (
    <div className="search-wrap">
      <i className="ti ti-search search-icon" />
      <input
        className="search-input"
        type="text"
        placeholder="Pesquisar card por cliente, tipo, colaborador..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button className="search-clear" type="button" onClick={onClear} style={{ display: value ? 'block' : 'none' }}>
        ✕
      </button>
      <div className="search-results-bar">
        {value ? `${resultCount} ${resultCount === 1 ? 'card encontrado' : 'cards encontrados'}` : ''}
      </div>
    </div>
  )
}
