import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import GolosDashboard from './components/GolosDashboard'
import JogosDashboard from './components/JogosDashboard'
import JogadoresDashboard from './components/JogadoresDashboard'
import ResumoJogos from './components/ResumoJogos'
import Classificacao from './components/Classificacao'
import AdministracaoDashboard from './components/AdministracaoDashboard'
import MediaDashboard from './components/MediaDashboard'
import Login from './components/Login'
import NotificationComponent from './components/NotificationComponent'
import { useAuth } from './contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('golos')
  const auth = useAuth()
  const user = auth?.user
  const loading = auth?.loading

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0c0e12',
        color: 'white'
      }}>
        <Loader2 className="spinner" size={48} style={{ animation: 'rotate 1s linear infinite' }} />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="app-layout">
      <NotificationComponent />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-viewport">
        <Header onNavigate={setActiveTab} />
        <div className="content-area">
          {activeTab === 'golos' && <GolosDashboard onNavigate={setActiveTab} />}
          {activeTab === 'jogos' && <JogosDashboard />}
          {activeTab === 'jogos-proximos' && <JogosDashboard initialView="list" />}
          {activeTab === 'jogos-agendar' && <JogosDashboard initialView="add" />}
          {activeTab === 'resumo' && <ResumoJogos />}
          {activeTab === 'jogadores-list' && <JogadoresDashboard initialView="list" />}
          {activeTab === 'jogadores-add' && <JogadoresDashboard initialView="add" />}
          {activeTab === 'classificacao' && <Classificacao />}
          {activeTab === 'administracao' && <AdministracaoDashboard />}
          {activeTab === 'media' && <MediaDashboard />}
          {!['golos', 'jogos', 'jogos-proximos', 'jogos-agendar', 'resumo', 'jogadores-list', 'jogadores-add', 'classificacao', 'administracao', 'media'].includes(activeTab) && (
            <div className="empty-view"></div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
