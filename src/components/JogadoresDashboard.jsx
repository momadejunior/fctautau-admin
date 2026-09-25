import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, Loader2, User, Trash2, Search, ArrowUpRight, Award, Footprints, Pencil, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import './JogadoresDashboard.css';

const POSICOES = [
  { value: '', label: 'Selecionar posição...' },
  { value: 'Guarda-Redes', label: 'Guarda-Redes' },
  { value: 'Defesa Central', label: 'Defesa Central' },
  { value: 'Defesa Direito', label: 'Defesa Direito' },
  { value: 'Defesa Esquerdo', label: 'Defesa Esquerdo' },
  { value: 'Médio Defensivo', label: 'Médio Defensivo' },
  { value: 'Médio Centro', label: 'Médio Centro' },
  { value: 'Médio Ofensivo', label: 'Médio Ofensivo' },
  { value: 'Extremo Direito', label: 'Extremo Direito' },
  { value: 'Extremo Esquerdo', label: 'Extremo Esquerdo' },
  { value: 'Avançado', label: 'Avançado' },
];

const JogadoresDashboard = ({ initialView = 'list' }) => {
  const { showNotification } = useNotification();
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, positions: {}, mostUsed: '--' });
  const [newJogador, setNewJogador] = useState({
    nome: '',
    numero: '',
    posicao: ''
  });
  const [saving, setSaving] = useState(false);
  const [editingJogador, setEditingJogador] = useState(null);

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
        .select(`
          *,
          presencas:presenca_jogos(count),
          golos:golos!jogador_id(count)
        `)
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

    // Find most used player (most appearances)
    let mostUsedPlayerName = '--';
    let maxGames = -1;
    (data || []).forEach(p => {
      const pData = p.presencas;
      const games = Array.isArray(pData) ? (pData[0]?.count || 0) : (pData?.count || 0);
      if (games > maxGames) {
        maxGames = games;
        mostUsedPlayerName = p.nome;
      }
    });

    setStats({ 
      total: (data || []).length, 
      positions,
      mostUsed: mostUsedPlayerName && maxGames > 0 ? mostUsedPlayerName : '--'
    });
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

      showNotification('Jogador adicionado com sucesso!', 'success');
      setNewJogador({ nome: '', numero: '', posicao: '' });
      setView('list');
      fetchJogadores();
    } catch (error) {
      showNotification('Erro ao adicionar jogador: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJogador = async (id) => {
    if (!confirm('Deseja realmente remover este jogador?')) return;
    try {
      const { error } = await supabase.from('jogadores').delete().eq('id', id);
      if (error) throw error;
      showNotification('Jogador eliminado com sucesso', 'success');
      fetchJogadores();
    } catch (error) {
      showNotification('Erro ao eliminar jogador: ' + error.message, 'error');
    }
  };

  const handleEditJogador = async (e) => {
    e.preventDefault();
    if (!editingJogador) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('jogadores').update({
        nome: editingJogador.nome,
        numero: editingJogador.numero ? parseInt(editingJogador.numero) : null,
        posicao: editingJogador.posicao
      }).eq('id', editingJogador.id);
      if (error) throw error;
      showNotification('Jogador atualizado com sucesso!', 'success');
      setEditingJogador(null);
      fetchJogadores();
    } catch (error) {
      showNotification('Erro ao atualizar jogador: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredJogadores = jogadores.filter(j => 
    j.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (j.posicao && j.posicao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.numero && j.numero.toString().includes(searchTerm))
  );

  return (
    <>
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Gestão de Plantel</h1>
            <p>Gerencie os jogadores, posições e números da equipa.</p>
          </div>
          <div className="toggle-group" style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border)', gap: '0.25rem' }}>
            <button 
              onClick={() => setView('list')} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}
            >
              <Users size={18} /> Ver Plantel
            </button>
            <button 
              onClick={() => setView('add')} 
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: view === 'add' ? 'var(--primary)' : 'transparent', color: view === 'add' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}
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
          <div className="stat-value" style={{ fontSize: (stats.mostUsed && stats.mostUsed.length > 15) ? '1.2rem' : '1.8rem' }}>
            {stats.mostUsed}
          </div>
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
                  <select
                    value={newJogador.posicao}
                    onChange={(e) => setNewJogador({...newJogador, posicao: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: newJogador.posicao ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.95rem', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
                  >
                    {POSICOES.map(p => (
                      <option key={p.value} value={p.value} disabled={p.value === ''} hidden={p.value === ''}>{p.label}</option>
                    ))}
                  </select>
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
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => setEditingJogador({ id: jogador.id, nome: jogador.nome, numero: jogador.numero || '', posicao: jogador.posicao || '' })} className="delete-btn-mini" style={{ color: 'var(--primary)', borderColor: 'var(--primary-light)', background: 'var(--primary-light)' }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteJogador(jogador.id)} className="delete-btn-mini">
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                          <strong>{jogador.presencas?.[0]?.count || 0}</strong>
                        </div>
                        <div className="player-stat-mini border-left">
                          <span>Golos</span>
                          <strong>{jogador.golos?.[0]?.count || 0}</strong>
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

    {/* Edit Modal */}
    {editingJogador && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setEditingJogador(null)}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pencil size={20} color="var(--primary)" /> Editar Jogador
            </h2>
            <button onClick={() => setEditingJogador(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
              <X size={22} />
            </button>
          </div>
          <form onSubmit={handleEditJogador}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>Nome Completo</label>
              <input
                type="text"
                value={editingJogador.nome}
                onChange={e => setEditingJogador({...editingJogador, nome: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label>Número</label>
                <input
                  type="number"
                  value={editingJogador.numero || ''}
                  onChange={e => setEditingJogador({...editingJogador, numero: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Posição</label>
                <select
                  value={editingJogador.posicao || ''}
                  onChange={e => setEditingJogador({...editingJogador, posicao: e.target.value})}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
                >
                  {POSICOES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setEditingJogador(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>
                Cancelar
              </button>
              <button type="submit" className="submit-btn" style={{ flex: 2 }} disabled={saving}>
                {saving ? <><Loader2 className="animate-spin" size={18} /> A guardar...</> : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};

export default JogadoresDashboard;
