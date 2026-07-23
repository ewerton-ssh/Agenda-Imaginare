import './Register.css'
import { useState } from 'react'
import { useAuth } from '../../context/auth'
import toast from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        try {
            await register(name, email, password)
        } catch (error) {
            toast.error("Erro ao realizar cadastro.")
        }
    }

    return (
        <div className="register">
            <main className='register-container'>
                <div className="register-card glass">

                    <h1>Registrar</h1>
                    <p>Cadastre sua conta</p>

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
                            <label>Nome</label>
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
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

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirme sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn-register">
                            <i />
                            Registrar
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}