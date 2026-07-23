import './Users.css'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaAngleLeft, FaTrash } from "react-icons/fa"
import { useUsers } from '../../context/users'
import { useAuth } from '../../context/auth'
import type { User } from '../../types'
import AlertDialog from '../../components/AlertDialog/AlertDialog' // Ajuste o caminho do import conforme seu projeto

export default function Users() {
    const { getUsers, updateUser, deleteUser } = useUsers()
    const { userData } = useAuth()
    const navigate = useNavigate()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Estado para controlar a modal de confirmação
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const loadUsers = useCallback(async () => {
        setLoading(true)

        const response = await getUsers()

        if (response) {
            setUsers(response.users)
        }

        setLoading(false)
    }, [getUsers])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    async function handleToggleAdmin(user: User) {
        if (!user._id) return

        setSavingId(user._id)

        const updated = await updateUser(user._id, {
            admin: !user.admin
        })

        if (updated) {
            setUsers(prev =>
                prev.map(u =>
                    u._id === user._id
                        ? { ...u, admin: updated.admin }
                        : u
                )
            )
        }
        setSavingId(null)
    }

    function handleOpenDeleteModal(user: User) {
        if (!user._id) return
        setUserToDelete(user)
    }

    async function handleConfirmDelete() {
        if (!userToDelete?._id) return

        const idToDelete = userToDelete._id
        
        setUserToDelete(null)
        setDeletingId(idToDelete)

        try {
            const success = await deleteUser(idToDelete)

            if (success) {
                setUsers(prev => prev.filter(u => u._id !== idToDelete))
            }
        } catch (error) {
            console.error("Erro ao deletar usuário:", error)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="users-page">

            <div className="users-header glass">
                <div className="users-title">
                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <FaAngleLeft />
                    </button>

                    <div>
                        <h1>Usuários</h1>
                        <span>{users.length} usuários cadastrados</span>
                    </div>
                </div>
            </div>

            <div className="users-list glass">

                <div className="users-row users-row-header">
                    <div>Nome</div>
                    <div>E-mail</div>
                    <div>Administrador</div>
                    <div style={{ marginLeft: '15px'}}>Ações</div>
                </div>

                {loading ? (
                    <div className="users-empty">
                        Carregando...
                    </div>
                ) : users.length === 0 ? (
                    <div className="users-empty">
                        Nenhum usuário encontrado.
                    </div>
                ) : (
                    users.map(user => {
                        const isCurrentUser = user.email === userData?.email;
                        const isProcessing = savingId === user._id || deletingId === user._id;

                        return (
                            <div
                                className="users-row"
                                key={user._id}
                            >
                                <div className="user-name">
                                    {user.name}
                                    {isCurrentUser && <span className="user-you"> - (Você)</span>}
                                </div>

                                <div className="user-email">
                                    {user.email}
                                </div>

                                <div className="user-admin">
                                    <input
                                        type="checkbox"
                                        checked={user.admin}
                                        disabled={isProcessing || isCurrentUser}
                                        onChange={() => handleToggleAdmin(user)}
                                    />
                                </div>

                                <div className="user-actions">
                                    <button
                                        className="delete-btn"
                                        disabled={isProcessing || isCurrentUser}
                                        onClick={() => handleOpenDeleteModal(user)}
                                        title={isCurrentUser ? "Você não pode deletar sua própria conta" : "Excluir usuário"}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}

            </div>

            {/* Modal de confirmação customizada */}
            <AlertDialog
                open={!!userToDelete}
                title="Excluir Usuário"
                message={`Tem certeza que deseja excluir o usuário ${userToDelete?.name}? Essa ação não poderá ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setUserToDelete(null)}
            />
        </div>
    )
}