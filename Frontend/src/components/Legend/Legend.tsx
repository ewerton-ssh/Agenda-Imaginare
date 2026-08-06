import { useUsers } from '../../context/users'
import './Legend.css'

const SERVICE_CATEGORIES = [
  { label: 'Adesivo', color: '#3b82f6' },              
  { label: 'Automativo', color: '#f97316' },           
  { label: 'Fachada de ACM', color: '#a855f7' },       
  { label: 'Letra caixa/acrilico', color: '#ec4899' }, 
  { label: 'Lona c/ Ilhos', color: '#eab308' },        
  { label: 'Painel de lona', color: '#10b981' },       
  { label: 'Outro', color: '#94a3b8' },               
]

interface LegendProps {
  collaboratorColors?: Record<string, string>
}

export default function Legend({ collaboratorColors = {} }: LegendProps) {
  const { users } = useUsers()
  return (
    <div className="legend">
      {SERVICE_CATEGORIES.map(({ label, color }) => (
        <span key={label}>
          <span className="ld" style={{ background: color }} />
          {label}
        </span>
      ))}

      {users.length > 0 && (
        <div className="legend-users-group">
          {users.map((user) => (
            <span key={user._id || user.name}>
              <span
                className="ld"
                style={{
                  background: collaboratorColors[user.name] || collaboratorColors[user._id] || '#aaa',
                  borderRadius: 2,
                }}
              />
              {user.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}