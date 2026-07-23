import './Stats.css'

interface StatsPanelProps {
  data: {
    agendados: number
    concluidos: number
    atrasados: number
  }
}

export default function StatsPanel({ data }: StatsPanelProps) {
  return (
    <div className="stats">
      <div className="sc ag">
        <div className="sc-n bl">{data.agendados}</div>
        <div className="sc-l">AGENDADOS</div>
      </div>
      <div className="sc co">
        <div className="sc-n gr">{data.concluidos}</div>
        <div className="sc-l">CONCLUÍDOS</div>
      </div>
      <div className="sc at">
        <div className="sc-n rd">{data.atrasados}</div>
        <div className="sc-l">ATRASADOS</div>
      </div>
    </div>
  )
}
