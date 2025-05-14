// src/App.jsx
import { useEffect, useState } from 'react'
import './App.css'
import LoginButton  from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react'

export default function App() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

  const [token, setToken]     = useState(null)
  const [tarefas, setTarefas] = useState([])
  const [titulo, setTitulo]   = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('')

  // lê direto dessas claims
  const email = user?.['https://musica-insper.com/email'] || ''
  const roles = user?.['https://musica-insper.com/roles'] || []
  const isAdmin = roles.includes('ADMIN') || email === 'admin@curso.com'

  // 1) Carrega o token uma única vez (usa audience+scope do Provider)
  useEffect(() => {
    if (!isAuthenticated) return

    getAccessTokenSilently()
      .then(tok => setToken(tok))
      .catch(err => console.error('Erro ao buscar token:', err))
  }, [isAuthenticated, getAccessTokenSilently])

  // 2) Carrega as tarefas assim que tiver token
  useEffect(() => {
    if (!token) return
      const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('PAYLOAD DO TOKEN:', payload);

    fetch('http://18.231.27.99:8080/tarefa', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar tarefas')
        return res.json()
      })
      .then(data => setTarefas(data))
      .catch(err => {
        console.error(err)
        alert(err.message)
      })
  }, [token])

  if (isLoading)       return <div>Loading…</div>
  if (!isAuthenticated) return <LoginButton />

  const criarTarefa = () => {
    fetch('http://18.231.27.99:8080/tarefa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, descricao, prioridade, email })
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao criar tarefa')
        return res.json()
      })
      .then(nova => {
        setTarefas(prev => [...prev, nova])
        setTitulo(''); setDescricao(''); setPrioridade('')
      })
      .catch(err => {
        console.error(err)
        alert(err.message)
      })
  }

  const deletarTarefa = (id) => {
    fetch(`http://18.231.27.99:8080/tarefa/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) return res.text().then(txt => { throw new Error(txt) })
        setTarefas(prev => prev.filter(t => t.id !== id))
      })
      .catch(err => {
        console.error(err)
        alert(err.message)
      })
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
            {isAdmin && <button onClick={() => deletarTarefa(t.id)}>Deletar</button>}
          </li>
        ))}
      </ul>

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
