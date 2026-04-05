import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Users, Calendar, Trash2, PlusCircle, 
  Loader2, ArrowUpRight, Plus, Video, 
  CheckCircle2, Clock, MoreHorizontal, UserPlus,
  Zap, TrendingUp, BarChart3, MapPin, Award
} from 'lucide-react';
import './GolosDashboard.css';

const GolosDashboard = ({ onNavigate }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jogadores, setJogadores] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [stats, setStats] = useState({ total: 0, distinctJogadores: 0, distinctJogos: 0 });
  const [newGoal, setNewGoal] = useState({
    jogo_id: '',
    jogador_id: '',
    quantidade: 1,
    equipe: 'A'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchGoals(),
      fetchJogadores(),
      fetchJogos(),
      calculateOverallStats()
    ]);
    setLoading(false);
  };

  const calculateOverallStats = async () => {
    try {
      const { count: jogadoresCount } = await supabase.from('jogadores').select('*', { count: 'exact', head: true });
      const { count: jogosCount } = await supabase.from('jogos').select('*', { count: 'exact', head: true });
      const { data: golosData } = await supabase.from('golos').select('quantidade').eq('equipe', 'A');
      
      const totalGolos = golosData?.reduce((acc, curr) => acc + (curr.quantidade || 0), 0) || 0;
      
      setStats({
        total: totalGolos,
        distinctJogadores: jogadoresCount || 0,
        distinctJogos: jogosCount || 0
      });
    } catch (e) {
      console.error('Error calculating overall stats:', e);
    }
  };

  const fetchJogadores = async () => {
    const { data } = await supabase.from('jogadores').select('*').order('nome');
    setJogadores(data || []);
  };

  const fetchJogos = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('jogos').select('*').order('data', { ascending: true });
    setJogos(data || []);
    
    // Find next match
    const upcoming = (data || []).find(j => j.data >= today);
    setNextMatch(upcoming);
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('golos')
        .select(`
          *,
          jogadores(nome),
          jogos(data, local, equipe_a, equipe_b)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setGoals(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error.message);
    }
  };

  const calculateStats = (data) => {
    const total = data.reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
    const jogadoresSet = new Set(data.map(g => g.jogador_id)).size;
    const jogosSet = new Set(data.map(g => g.jogo_id)).size;
    setStats({ total, distinctJogadores: jogadoresSet, distinctJogos: jogosSet });
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('golos').insert([newGoal]);
      if (error) throw error;
      setNewGoal({ jogo_id: '', jogador_id: '', quantidade: 1 });
      fetchGoals();
    } catch (error) {
      if (error.message.includes('row-level security policy')) {
        alert('Erro de permissão: A política de segurança do Supabase (RLS) está a impedir o registo do golo. Por favor, verifique se as políticas RLS foram configuradas corretamente no painel do Supabase.');
      } else {
        alert('Erro ao registar golo: ' + error.message);
      }
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const { error } = await supabase.from('golos').delete().eq('id', id);
      if (error) throw error;
      fetchGoals();
    } catch (error) {
      alert('Error deleting goal: ' + error.message);
    }
  };

  return (
    <div className="golos-dashboard">
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Dashboard iMatch</h1>
            <p>Gerencie sua equipe, agende partidas e acompanhe o desempenho em tempo real.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Quick stats badges */}
            <div className="badge-group" style={{ display: 'flex', gap: '0.5rem' }}>
               <div className="badge primary" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                 Temporada 2024
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column: Stats Cards */}
        <div className="stats-cards-section">
          <div className="card stat-card primary">
            <div className="stat-header">
              <span className="stat-label">Total de Golos</span>
              <div className="arrow-icon">
                <Trophy size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-trend">
              <span>Golos marcados pela sua equipe</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-label">Jogadores Ativos</span>
              <div className="arrow-icon">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.distinctJogadores}</div>
            <div className="stat-trend up">
              <span>Plantel registado no sistema</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-label">Jogos Registados</span>
              <div className="arrow-icon">
                <Calendar size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.distinctJogos}</div>
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Entre agendados e concluídos</span>
          </div>
        </div>

        {/* Center: Top Scorers Table */}
        <div className="card analytics-card top-scorers-widget">
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={18} /> Top 5 Marcadores</span>
            <TrendingUp size={18} className="text-muted" />
          </div>
          <div className="scorers-list-compact" style={{ marginTop: '1rem' }}>
            {goals.length > 0 ? (
               // Group and count
               Object.entries(goals.reduce((acc, g) => {
                 if (g.equipe === 'A' && g.jogadores?.nome) {
                   acc[g.jogadores.nome] = (acc[g.jogadores.nome] || 0) + (g.quantidade || 1);
                 }
                 return acc;
               }, {})).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([nome, score], i) => (
                 <div key={nome} className="scorer-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '20px', fontWeight: '800', color: i === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{i+1}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>{nome[0]}</div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{nome}</span>
                    </div>
                    <span style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>{score} Golos</span>
                 </div>
               ))
            ) : <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Sem dados de marcadores.</p>}
          </div>
        </div>

        {/* Right: Next Match & Quick Actions */}
        <div className="dashboard-sidebar-widgets">
          <div className="card reminder-card next-match-widget" style={{ background: 'var(--primary)', color: 'white' }}>
            <div className="section-title" style={{ color: 'white' }}>Próximo Jogo</div>
            {nextMatch ? (
              <div className="next-match-content" style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>{nextMatch.equipe_a} <span style={{ opacity: 0.7, fontWeight: '400' }}>vs</span> {nextMatch.equipe_b}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.9 }}>
                  <Calendar size={14} /> {new Date(nextMatch.data).toLocaleDateString('pt-PT')} às {nextMatch.hora}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  <MapPin size={14} /> {nextMatch.campo}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Nenhum jogo agendado brevemente.</div>
            )}
            <button 
              className="start-btn" 
              style={{ background: 'white', color: 'var(--primary)', marginTop: '1.25rem', width: '100%' }}
              onClick={() => onNavigate?.('jogos-proximos')}
            >
              <Video size={18} /> Ver Detalhes
            </button>
          </div>

          <div className="card quick-actions-card">
            <div className="section-title">Ações Rápidas</div>
            <div className="actions-grid">
               <button 
                 className="action-btn" 
                 onClick={() => onNavigate?.('jogos-agendar')}
               >
                 <div className="icon-box"><Calendar size={22} /></div>
                 <span>Agendar Jogo</span>
               </button>
               <button 
                 className="action-btn" 
                 onClick={() => onNavigate?.('jogadores-add')}
               >
                 <div className="icon-box"><Users size={22} /></div>
                 <span>Novo Jogador</span>
               </button>
               <button 
                 className="action-btn" 
                 onClick={() => onNavigate?.('resumo')}
               >
                 <div className="icon-box"><Zap size={22} /></div>
                 <span>Estatísticas</span>
               </button>
               <button 
                 className="action-btn" 
                 onClick={() => onNavigate?.('jogos-proximos')}
               >
                 <div className="icon-box"><BarChart3 size={22} /></div>
                 <span>Resultados</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GolosDashboard;
