// src/App.jsx
import { useEffect, useState } from 'react'
import './App.css'
import LoginButton  from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react'

// Esse audience deve ser o Identifier da sua API no Auth0 → APIs
const audience = 'https://seu-dominio.com/tasks'

export default function App() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

  const [token, setToken]       = useState(null)
  const [tarefas, setTarefas]   = useState([])
  const [titulo, setTitulo]     = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('')

  // Lê direto das claims do usuário
  const email = user?.['https://musica-insper.com/email'] || ''
  const roles = user?.['https://musica-insper.com/roles'] || []
  // Se quiser burlar no front, considera admin quem tiver "admin@curso.com"
  const isAdmin = roles.includes('ADMIN') || email === 'admin@curso.com'

  // 1) Obtém o token com as scopes necessárias
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience,
            scope: 'read:tasks create:tasks delete:tasks'
          }
        })
        setToken(accessToken)
      } catch (e) {
        console.error('Erro ao buscar token:', e)
      }
    }

    fetchToken()
  }, [isAuthenticated, getAccessTokenSilently])

  // 2) Carrega as tarefas assim que o token estiver disponível
  useEffect(() => {
    if (!token) return

    const fetchTarefas = async () => {
      try {
        const res = await fetch('http://18.231.27.99:8080/tarefa', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Erro ao carregar tarefas')
        const data = await res.json()
        setTarefas(data)
      } catch (e) {
        console.error(e)
        alert(e.message)
      }
    }

    fetchTarefas()
  }, [token])

  if (isLoading)       return <div>Loading…</div>
  if (!isAuthenticated) return <LoginButton />

  // Cria uma nova tarefa
  const criarTarefa = async () => {
    try {
      const res = await fetch('http://18.231.27.99:8080/tarefa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descricao, prioridade, email })
      })
      if (!res.ok) throw new Error('Erro ao criar tarefa')
      const nova = await res.json()
      setTarefas(prev => [...prev, nova])
      setTitulo(''); setDescricao(''); setPrioridade('')
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  // Deleta uma tarefa (204 No Content)
  const deletarTarefa = async (id) => {
    try {
      const res = await fetch(`http://18.231.27.99:8080/tarefa/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Erro ao deletar: ${res.status} ${text}`)
      }
      setTarefas(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  return (
    <>
      <header className="user-info">
        <img src={user.picture} alt={user.name} />
        <div>
          <h2>{user.name}</h2>
          <p>{email}</p>
        </div>
        <LogoutButton />
      </header>

      <h2>Tarefas</h2>
      <ul className="task-list">
        {tarefas.map(t => (
          <li key={t.id}>
            <strong>{t.title || t.titulo}</strong> — <em>{t.priority || t.prioridade}</em>
            <p>{t.description || t.descricao}</p>
            <small>Criado por: {t.creatorEmail || t.email}</small>
            {isAdmin && (
              <button onClick={() => deletarTarefa(t.id)}>Deletar</button>
            )}
          </li>
        ))}
      </ul>

      {/* Form de criação sempre visível para admin */}
      {isAdmin && (
        <section className="task-form">
          <h3>Nova Tarefa</h3>
          <input
            placeholder="Título"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          <input
            placeholder="Descrição"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
          <input
            placeholder="Prioridade"
            value={prioridade}
            onChange={e => setPrioridade(e.target.value)}
          />
          <button onClick={criarTarefa}>Criar</button>
        </section>
      )}
    </>
  )
}
