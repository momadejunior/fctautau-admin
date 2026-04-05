import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, Loader2, User, Trash2, Search, ArrowUpRight, Award, Footprints } from 'lucide-react';
import './JogadoresDashboard.css';

const JogadoresDashboard = ({ initialView = 'list' }) => {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, positions: {} });
  const [newJogador, setNewJogador] = useState({
    nome: '',
    numero: '',
    posicao: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJogadores();
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jogadores')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setJogadores(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching jogadores:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const positions = data.reduce((acc, curr) => {
      const pos = curr.posicao || 'Não Definida';
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});
    setStats({ total: data.length, positions });
  };

  const handleAddJogador = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase.from('jogadores').insert([
        {
          nome: newJogador.nome,
          numero: newJogador.numero ? parseInt(newJogador.numero) : null,
          posicao: newJogador.posicao
        }
      ]);

      if (error) throw error;

      setNewJogador({ nome: '', numero: '', posicao: '' });
      setView('list');
      fetchJogadores();
    } catch (error) {
      alert('Erro ao adicionar jogador: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJogador = async (id) => {
    if (!confirm('Deseja realmente remover este jogador?')) return;
    try {
      const { error } = await supabase.from('jogadores').delete().eq('id', id);
      if (error) throw error;
      fetchJogadores();
    } catch (error) {
      alert('Erro ao remover jogador: ' + error.message);
    }
  };

  const filteredJogadores = jogadores.filter(j => 
    j.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (j.posicao && j.posicao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.numero && j.numero.toString().includes(searchTerm))
  );

  return (
    <div className="jogadores-dashboard">
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Gestão de Plantel</h1>
            <p>Gerencie os jogadores, posições e números da equipa.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setView('list')} 
              className={`submit-btn ${view === 'list' ? '' : 'outline'}`}
              style={{ background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Users size={18} /> Ver Plantel
            </button>
            <button 
              onClick={() => setView('add')} 
              className={`submit-btn ${view === 'add' ? '' : 'outline'}`}
              style={{ background: view === 'add' ? 'var(--primary)' : 'transparent', color: view === 'add' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Plus size={18} /> Novo Jogador
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card primary">
          <div className="stat-header">
            <span className="stat-label">Total de Jogadores</span>
            <div className="arrow-icon"><Users size={20} /></div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-trend">
            <span className="trend-icon"><ArrowUpRight size={12} /></span>
            <span>Plantel completo e ativo</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Mais Utilizado</span>
            <div className="arrow-icon"><Award size={20} color="var(--primary)" /></div>
          </div>
          <div className="stat-value">--</div>
          <div className="stat-trend up">
            <span>Baseado nos jogos realizados</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Posições Ativas</span>
            <div className="arrow-icon"><Footprints size={20} color="var(--primary)" /></div>
          </div>
          <div className="stat-value">{Object.keys(stats.positions).length}</div>
          <div className="stat-trend">
            <span>Diversidade tática no plantel</span>
          </div>
        </div>
      </div>

      <div className="jogadores-main-content">
        {view === 'add' ? (
          <section className="form-card card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title"><User size={20} /> Adicionar Novo Jogador</h2>
            <form onSubmit={handleAddJogador} className="jogadores-form">
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Cristiano Ronaldo" 
                  value={newJogador.nome} 
                  onChange={(e) => setNewJogador({...newJogador, nome: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Número</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 7" 
                    value={newJogador.numero} 
                    onChange={(e) => setNewJogador({...newJogador, numero: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Posição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Avançado" 
                    value={newJogador.posicao} 
                    onChange={(e) => setNewJogador({...newJogador, posicao: e.target.value})} 
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '1rem', width: '100%' }} disabled={saving}>
                {saving ? <><Loader2 className="animate-spin" size={18} /> A guardar...</> : 'Confirmar Registo'}
              </button>
            </form>
          </section>
        ) : (
          <section className="jogadores-list-section">
            <div className="list-controls">
              <h2 className="section-title" style={{ margin: 0 }}><Users size={20} /> Membros ({filteredJogadores.length})</h2>
              <div className="search-bar-container">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome, posição ou número..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state"><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <div className="jogadores-grid-display">
                {filteredJogadores.length === 0 ? (
                  <div className="empty-state">
                    <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Nenhum jogador encontrado para "{searchTerm}".</p>
                    <button onClick={() => {setSearchTerm(''); setView('add');}} className="text-btn">Adicionar Novo</button>
                  </div>
                ) : (
                  filteredJogadores.map((jogador) => (
                    <div key={jogador.id} className="player-card">
                      <div className="player-card-header">
                        <div className="player-avatar-large">
                          {jogador.nome[0].toUpperCase()}
                        </div>
                        <button onClick={() => handleDeleteJogador(jogador.id)} className="delete-btn-mini">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="player-card-body">
                        <h3 className="player-name-display">{jogador.nome}</h3>
                        <div className="player-info-tags">
                          {jogador.numero && <span className="tag number">#{jogador.numero}</span>}
                          <span className="tag position">{jogador.posicao || 'Livre'}</span>
                        </div>
                      </div>
                      <div className="player-card-footer">
                        <div className="player-stat-mini">
                          <span>Jogos</span>
                          <strong>--</strong>
                        </div>
                        <div className="player-stat-mini border-left">
                          <span>Golos</span>
                          <strong>--</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default JogadoresDashboard;
