import { useUsers } from '../../context/users'
import './Legend.css'

const SERVICE_CATEGORIES = [
  { label: 'Adesivo', color: '#60a5fa' },
  { label: 'Fachada', color: '#FFFF00' },
  { label: 'Automotivo', color: '#FF8000' },
  { label: 'ACM', color: '#c084fc' },
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