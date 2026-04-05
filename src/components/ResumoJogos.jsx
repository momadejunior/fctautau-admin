import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, 
  Target, 
  Minus, 
  TrendingUp, 
  Activity, 
  PieChart,
  Loader2,
  ChevronRight,
  Award
} from 'lucide-react';
import './ResumoJogos.css';

const ResumoJogos = () => {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumo();
  }, []);

  const fetchResumo = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch simplified summary if it exists, otherwise we'll calculate everything
      const { data: resumoBase } = await supabase
        .from('resumo_jogos')
        .select('*')
        .maybeSingle();

      // 2. Fetch all results to calculate goals and form
      const { data: todosResultados, error: resError } = await supabase
        .from('resultados')
        .select('*, jogos(data, equipe_b)')
        .order('jogos(data)', { ascending: false });

      if (resError) throw resError;

      // 3. Fetch goals to find top scorers
      const { data: todosGolos, error: golosError } = await supabase
        .from('golos')
        .select('*, jogadores(nome)')
        .eq('equipe', 'A'); // Only our team scorers

      if (golosError) throw golosError;

      // Calculate Stats
      const totalJogos = todosResultados.length;
      let vitorias = 0, empates = 0, derrotas = 0;
      let golosPró = 0, golosContra = 0;

      todosResultados.forEach(r => {
        golosPró += r.golos_nossos || 0;
        golosContra += r.golos_adversario || 0;
        if (r.golos_nossos > r.golos_adversario) vitorias++;
        else if (r.golos_nossos === r.golos_adversario) empates++;
        else derrotas++;
      });

      // Top Scorers calculation
      const scorersMap = {};
      todosGolos.forEach(g => {
        if (g.jogadores && g.jogadores.nome) {
          scorersMap[g.jogadores.nome] = (scorersMap[g.jogadores.nome] || 0) + 1;
        }
      });
      const topScorers = Object.entries(scorersMap)
        .map(([nome, golos]) => ({ nome, golos }))
        .sort((a, b) => b.golos - a.golos)
        .slice(0, 3);

      // Recent Form (last 5)
      const formaRecente = todosResultados.slice(0, 5).map(r => {
        if (r.golos_nossos > r.golos_adversario) return 'V';
        if (r.golos_nossos === r.golos_adversario) return 'E';
        return 'D';
      });

      setResumo({
        total_jogos: totalJogos,
        vitorias,
        empates,
        derrotas,
        golos_pro: golosPró,
        golos_contra: golosContra,
        top_scorers: topScorers,
        forma: formaRecente,
        ultimos_jogos: todosResultados.slice(0, 3)
      });

    } catch (error) {
      console.error('Error fetching resumo:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resumo-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>A carregar estatísticas...</p>
      </div>
    );
  }

  if (!resumo) {
    return (
      <div className="resumo-empty">
        <Trophy size={48} className="text-muted" />
        <p>Ainda não existem dados de jogos registados.</p>
      </div>
    );
  }

  const winRate = ((resumo.vitorias / resumo.total_jogos) * 100).toFixed(1);

  return (
    <div className="resumo-container">
      <div className="dashboard-title-section">
        <h1>Resumo de Jogos</h1>
        <p>Visão geral de desempenho e estatísticas da equipa.</p>
      </div>

      <div className="resumo-grid">
        {/* Main Stats Card */}
        <div className="resumo-card main-stats">
          <div className="card-header">
            <Activity size={20} />
            <span>Desempenho Geral</span>
          </div>
          <div className="total-games">
            <span className="value">{resumo.total_jogos}</span>
            <span className="label">Jogos Realizados</span>
          </div>
          <div className="win-rate-bar">
            <div className="bar-label">
              <span>Taxa de Vitória</span>
              <span>{winRate}%</span>
            </div>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${winRate}%` }}></div>
            </div>
          </div>
          
          <div className="forma-container" style={{ marginTop: '1.5rem' }}>
            <span className="sub-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Forma Recente</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {resumo.forma.length > 0 ? resumo.forma.map((f, i) => (
                <span key={i} className={`forma-badge ${f}`} style={{ 
                  width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'white',
                  background: f === 'V' ? '#10b981' : f === 'E' ? '#f59e0b' : '#ef4444'
                }}>{f}</span>
              )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem histórico</span>}
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="stats-breakdown">
          <div className="resumo-card stat-item vitorias">
            <div className="stat-icon"><Trophy size={22} /></div>
            <div className="stat-info">
              <span className="stat-label">Vitórias</span>
              <span className="stat-value">{resumo.vitorias}</span>
            </div>
          </div>

          <div className="resumo-card stat-item goals-pro">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><TrendingUp size={22} /></div>
            <div className="stat-info">
              <span className="stat-label">Golos Pro</span>
              <span className="stat-value">{resumo.golos_pro}</span>
            </div>
          </div>

          <div className="resumo-card stat-item goals-contra" style={{ borderLeftColor: '#ef4444' }}>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Target size={22} /></div>
            <div className="stat-info">
              <span className="stat-label">Golos Contra</span>
              <span className="stat-value">{resumo.golos_contra}</span>
            </div>
          </div>
        </div>

        {/* Top Scorers Card */}
        <div className="resumo-card top-scorers-view">
          <div className="card-header">
            <Award size={20} />
            <span>Melhores Marcadores</span>
          </div>
          <div className="scorers-ranking">
            {resumo.top_scorers.length > 0 ? resumo.top_scorers.map((s, i) => (
              <div key={i} className="scorer-rank-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: i === 0 ? '#fbbf24' : 'var(--text-muted)', fontSize: '1.2rem' }}>{i + 1}</span>
                  <span style={{ fontWeight: '600' }}>{s.nome}</span>
                </div>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{s.golos} G</span>
              </div>
            )) : <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Sem golos registados</div>}
          </div>
        </div>
      </div>

      <div className="resumo-card recent-results-detailed" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <span>Resultados Recentes</span>
          < ChevronRight size={18} />
        </div>
        <div className="results-history-list" style={{ marginTop: '1rem' }}>
          {resumo.ultimos_jogos.length > 0 ? resumo.ultimos_jogos.map((j, i) => (
            <div key={i} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-app)', borderRadius: '10px', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '80px' }}>{new Date(j.jogos.data).toLocaleDateString('pt-PT')}</div>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: '700' }}>
                Nós <span style={{ background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', margin: '0 0.5rem' }}>{j.golos_nossos} - {j.golos_adversario}</span> {j.jogos.equipe_b}
              </div>
              <div style={{ 
                color: j.golos_nossos > j.golos_adversario ? '#10b981' : j.golos_nossos === j.golos_adversario ? '#f59e0b' : '#ef4444',
                fontWeight: '900', fontSize: '0.8rem', width: '20px', textAlign: 'center'
              }}>
                {j.golos_nossos > j.golos_adversario ? 'V' : j.golos_nossos === j.golos_adversario ? 'E' : 'D'}
              </div>
            </div>
          )) : <p style={{ textAlign: 'center', padding: '1rem', opacity: 0.5 }}>Ainda não há resultados para mostrar.</p>}
        </div>
      </div>
    </div>
  );
};

export default ResumoJogos;
