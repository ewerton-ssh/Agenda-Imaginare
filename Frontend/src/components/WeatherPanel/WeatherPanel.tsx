import './WeatherPanel.css'
import type { WeatherDay } from '../../types'

interface WeatherPanelProps {
  data: WeatherDay[]
  error: string
}

function renderWeatherScene(code: number) {
  if (code === 0) {
    return (
      <div className="w-scene">
        <div className="sun">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="sun-ray"
              style={{ transform: `rotate(${index * 45}deg) translateX(-50%)` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (code === 1 || code === 2) {
    return (
      <div className="w-scene cloudy">
        <div className="sun-sm">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="sun-ray"
              style={{ transform: `rotate(${index * 45}deg) translateX(-50%)` }}
            />
          ))}
        </div>
        <div className="cloud-main" />
      </div>
    )
  }

  if (code === 3) {
    return (
      <div className="w-scene">
        <div className="cloud-big" />
      </div>
    )
  }

  if (code === 45 || code === 48) {
    return (
      <div className="w-scene foggy">
        <div className="fog-line" />
        <div className="fog-line" />
        <div className="fog-line" />
      </div>
    )
  }

  if ([51, 53, 55, 61, 80].includes(code)) {
    const drops: Array<[number, number, number, string]> = [
      [10, 22, 1.2, '0s'],
      [18, 26, 1.0, '.2s'],
      [26, 22, 1.4, '.4s'],
      [34, 26, 1.1, '.1s'],
      [42, 22, 1.3, '.3s'],
    ]

    return (
      <div className="w-scene">
        <div className="rain-wrap">
          <div className="rain-cloud" />
          {drops.map(([left, top, speed, delay], index) => (
            <div
              key={index}
              className="drop"
              style={{
                left,
                top,
                height: Math.round(speed * 8),
                animationDuration: `${speed}s`,
                animationDelay: delay,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if ([63, 65, 81, 82].includes(code)) {
    const drops: Array<[number, number, number, string]> = [
      [6, 22, 0.9, '0s'],
      [14, 26, 0.7, '.15s'],
      [22, 22, 1.0, '.3s'],
      [30, 26, 0.8, '.05s'],
      [38, 22, 0.9, '.2s'],
      [46, 26, 0.7, '.35s'],
    ]

    return (
      <div className="w-scene">
        <div className="rain-wrap">
          <div className="rain-cloud" />
          {drops.map(([left, top, speed, delay], index) => (
            <div
              key={index}
              className="drop"
              style={{
                left,
                top,
                height: Math.round(speed * 10),
                animationDuration: `${speed}s`,
                animationDelay: delay,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if ([95, 96, 99].includes(code)) {
    const drops: Array<[number, number, number, string]> = [
      [8, 22, 0.8, '0s'],
      [20, 26, 0.7, '.2s'],
      [34, 22, 0.9, '.1s'],
      [44, 26, 0.8, '.3s'],
    ]

    return (
      <div className="w-scene">
        <div className="rain-wrap">
          <div className="rain-cloud" />
          {drops.map(([left, top, speed, delay], index) => (
            <div
              key={index}
              className="drop"
              style={{
                left,
                top,
                height: 8,
                animationDuration: `${speed}s`,
                animationDelay: delay,
              }}
            />
          ))}
          <div className="bolt">⚡</div>
        </div>
      </div>
    )
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return (
      <div className="w-scene">
        <div className="rain-wrap">
          <div className="rain-cloud snow-cloud" />
          {[
            [8, 0, '1.8s', '0s'],
            [20, 4, '2.2s', '.4s'],
            [32, 0, '1.9s', '.2s'],
            [44, 4, '2.0s', '.6s'],
          ].map((item, index) => (
            <div
              key={index}
              className="flake"
              style={{
                left: item[0],
                top: item[1],
                animationDuration: String(item[2]),
                animationDelay: String(item[3]),
              }}
            >
              ❄
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-scene" style={{ fontSize: 26 }}>
      🌡️
    </div>
  )
}

export default function WeatherPanel({ data, error }: WeatherPanelProps) {
  return (
    <div className="weather-panel glass">
      <div className="weather-title">
        <i className="ti ti-cloud-bolt" style={{ fontSize: 14 }} />
        {' '}
        Previsão do Tempo • Próximas 2 semanas
      </div>

      <div className="weather-grid" id="weather-grid">
        {error && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            {error}
          </div>
        )}

        {!error && data.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            Carregando...
          </div>
        )}

        {!error &&
          data
            .slice(0, 21)
            .map((day) => {
              const date = new Date(`${day.date}T00:00:00`)

              const weekday = date.toLocaleDateString('pt-BR', {
                weekday: 'short',
              })

              const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })

              return (
                <div key={day.date} className="wcard">
                  <div className="wday">
                    {weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '')}
                    <br />
                    <span style={{ fontSize: 8, opacity: 0.4 }}>
                      {formattedDate}
                    </span>
                  </div>

                  {renderWeatherScene(day.weatherCode)}

                  <div className="wtemp">{day.tempMax}°</div>

                  <div className="wmin">
                    ↓ {day.tempMin}°
                  </div>

                  <div className="wdesc">{day.description}</div>

                  {day.precipitation > 0 && (
                    <div
                      style={{
                        fontSize: 9,
                        color: '#60a5fa',
                        marginTop: 3,
                      }}
                    >
                      💧 {day.precipitation} mm
                    </div>
                  )}
                </div>
              )
            })}
      </div>

      <div className="weather-src">
        Open-Meteo.com • Cascavel/PR • Previsão para até 3 semanas
      </div>
    </div>
  )
}