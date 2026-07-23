import './Login.css'
import logo from '../../assets/logo.png'
import { useState } from 'react'
import { useAuth } from '../../context/auth'
import { NavLink } from 'react-router-dom'

export default function Login() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await logIn(email, password)
  }

  return (
    <div className="login">
      <main className='login-container'>
        <div className="login-card glass">
          <img src={logo} alt="Logo" className="login-logo" />

          <h1>Entrar</h1>
          <p>Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-login">
              <i />
              Entrar
            </button>
            <div className='login-navlink'>
              <NavLink className='login-navlink' to='/register'>Criar nova conta</NavLink>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}