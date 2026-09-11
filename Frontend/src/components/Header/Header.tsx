import { useEffect, useRef, useState } from 'react'
import './Header.css'
import type { ViewMode } from '../../types'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { FaAngleLeft, FaAngleRight, FaMoon, FaSun } from "react-icons/fa"
import { IoMenu } from "react-icons/io5"
import { useAuth } from '../../context/auth'

type ThemeMode = 'dark' | 'light'

interface HeaderProps {
  monthLabel: string
  viewMode: ViewMode
  theme: ThemeMode
  onPrev: () => void
  onNext: () => void
  onViewChange: (mode: ViewMode) => void
  onAdd: () => void
  onToggleTheme: () => void
}

export default function Header({ monthLabel, viewMode, theme, onPrev, onNext, onViewChange, onAdd, onToggleTheme }: HeaderProps) {
  const { isAuthenticated, userData, logOut } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  return (
    <div className="header glass">
      <div className="brand-block">
        <div className="brand-logo">
          <img src={logo} alt="Logo Agenda de Produção" />
        </div>
      </div>
      <div className="header-right">
        <div className="month-container">
          <button className="nav-btn" type="button" onClick={onPrev}>
            <FaAngleLeft />
          </button>
          <span className="month-label">{monthLabel}</span>
          <button className="nav-btn" type="button" onClick={onNext}>
            <FaAngleRight />
          </button>
        </div>
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
        <div className="view-toggle">
          <button
            className={`vt-btn ${viewMode === 'week' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('week')}
          >
            <i className="ti ti-calendar-week" style={{ fontSize: 13 }} /> Semana (x3)
          </button>
          <button
            className={`vt-btn ${viewMode === 'month' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('month')}
          >
            <i className="ti ti-calendar-month" style={{ fontSize: 13 }} /> Mês
          </button>
        </div>
        {isAuthenticated && userData?.admin &&
          <button className="btn-novo" type="button" onClick={onAdd} aria-label="Novo Agendamento" title="Novo Agendamento">
            <i className="ti ti-plus" /> Novo Agendamento
          </button>
        }
        <div className="menu-wrapper" ref={menuRef}>
          <button
            className="btn-menu"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IoMenu size={24} />
          </button>

          {menuOpen && (
            <div className="menu-dropdown">
              {isAuthenticated &&
                <span className='menu-item'>{userData?.name} - ({userData?.email})</span>
              }
              {isAuthenticated && userData?.admin &&
                <NavLink className="menu-item" to="/users" >Usuários</NavLink>
              }
              {isAuthenticated ?
                <span className="menu-item danger" onClick={logOut} >Logout</span>
                :
                <NavLink className="menu-item" to="/login" >Login</NavLink>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
