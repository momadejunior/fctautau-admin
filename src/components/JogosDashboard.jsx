import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, Plus, Loader2, Trophy, Clock, Trash2, Check, X, UserPlus, Timer, Award, Edit2, LayoutGrid, List } from 'lucide-react';
import './JogosDashboard.css';

const JogosDashboard = ({ initialView = 'list' }) => {
  const [jogos, setJogos] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(initialView);
  const [editingJogo, setEditingJogo] = useState(null);
  const [newJogo, setNewJogo] = useState({
    data: '',
    hora: '',
    equipe_a: '',
    equipe_b: '',
    campo: '',
    local: '',
    logo_a: '',
    logo_b: ''
  });
  const [files, setFiles] = useState({ logo_a: null, logo_b: null });
  const [uploading, setUploading] = useState(false);
  const [selectedJogoForResult, setSelectedJogoForResult] = useState(null);
  const [resultScore, setResultScore] = useState({ golos_nossos: '', golos_adversario: '' });
  const [scorers, setScorers] = useState([{ equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);
  const [savingResult, setSavingResult] = useState(false);
  const [listLayout, setListLayout] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchJogos(), fetchJogadores()]);
    setLoading(false);
  };

  const fetchJogos = async () => {
    try {
      const { data, error } = await supabase
        .from('jogos')
        .select('*, resultados(*), golos(*, jogadores(nome))')
        .order('data', { ascending: false });

      if (error) throw error;
      setJogos(data || []);
    } catch (error) {
      console.error('Error fetching jogos:', error.message);
    }
  };

  const fetchJogadores = async () => {
    try {
      const { data, error } = await supabase.from('jogadores').select('*').order('nome');
      if (error) throw error;
      setJogadores(data || []);
    } catch (error) {
      console.error('Error fetching jogadores:', error.message);
    }
  };

  const uploadLogo = async (file, teamName) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${teamName.replace(/\s+/g, '_')}.${fileExt}`;
    const filePath = `team-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        throw new Error('O bucket "imagens" não foi encontrado no Supabase. Por favor, crie-o com acesso público.');
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAddJogo = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      const logoAUrl = await uploadLogo(files.logo_a, newJogo.equipe_a);
      const logoBUrl = await uploadLogo(files.logo_b, newJogo.equipe_b);

      const jogoData = {
        ...newJogo,
        logo_a: logoAUrl || newJogo.logo_a,
        logo_b: logoBUrl || newJogo.logo_b
      };

      if (editingJogo) {
        const { error } = await supabase.from('jogos').update(jogoData).eq('id', editingJogo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('jogos').insert([jogoData]);
        if (error) throw error;
      }
      
      setNewJogo({ data: '', hora: '', equipe_a: '', equipe_b: '', campo: '', local: '', logo_a: '', logo_b: '' });
      setFiles({ logo_a: null, logo_b: null });
      setEditingJogo(null);
      setView('list');
      fetchJogos();
    } catch (error) {
      if (error.message.includes('row-level security policy')) {
        alert('Erro de permissão: A política de segurança do Supabase (RLS) está a impedir a operação.');
      } else {
        alert('Erro ao guardar jogo: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEditResultClick = (jogo) => {
    setSelectedJogoForResult(jogo.id);
    if (jogo.resultados && jogo.resultados.length > 0) {
      setResultScore({
        golos_nossos: jogo.resultados[0].golos_nossos.toString(),
        golos_adversario: jogo.resultados[0].golos_adversario.toString()
      });
    } else {
      setResultScore({ golos_nossos: '', golos_adversario: '' });
    }

    if (jogo.golos && jogo.golos.length > 0) {
      setScorers(jogo.golos.map(g => ({
        equipe: g.equipe || 'A',
        jogador_id: g.jogador_id || '',
        nome_adversario: g.nome_marcador_adversario || '',
        minuto: g.minuto ? g.minuto.toString() : ''
      })));
    } else {
      setScorers([{ equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);
    }
  };

  const handleEditClick = (jogo) => {
    setEditingJogo(jogo);
    setNewJogo({
      data: jogo.data,
      hora: jogo.hora,
      equipe_a: jogo.equipe_a,
      equipe_b: jogo.equipe_b,
      campo: jogo.campo,
      local: jogo.local,
      logo_a: jogo.logo_a,
      logo_b: jogo.logo_b
    });
    setView('add');
  };

  const handleDeleteJogo = async (id) => {
    if (!confirm('Deseja realmente eliminar este jogo? Todos os resultados e golos associados serão também removidos.')) return;
    try {
      // 1. Delete associated goals
      await supabase.from('golos').delete().eq('jogo_id', id);
      // 2. Delete associated results
      await supabase.from('resultados').delete().eq('jogo_id', id);
      // 3. Delete the game
      const { error } = await supabase.from('jogos').delete().eq('id', id);
      
      if (error) throw error;
      fetchJogos();
    } catch (error) {
      alert('Erro ao eliminar jogo: ' + error.message);
    }
  };

  const handleAddScorer = () => {
    setScorers([...scorers, { equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);
  };

  const handleScorerChange = (index, field, value) => {
    const updatedScorers = scorers.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    );
    setScorers(updatedScorers);
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    if (!selectedJogoForResult) return;

    try {
      setSavingResult(true);
      
      // 1. Check if result already exists for this match
      const { data: existingResult } = await supabase
        .from('resultados')
        .select('id')
        .eq('jogo_id', selectedJogoForResult)
        .maybeSingle();

      const resultData = {
        jogo_id: selectedJogoForResult,
        golos_nossos: parseInt(resultScore.golos_nossos),
        golos_adversario: parseInt(resultScore.golos_adversario)
      };

      let resultError;
      if (existingResult) {
        const { error } = await supabase.from('resultados').update(resultData).eq('id', existingResult.id);
        resultError = error;
      } else {
        const { error } = await supabase.from('resultados').insert([resultData]);
        resultError = error;
      }

      if (resultError) throw resultError;

      // 2. Clear old goals for this match
      await supabase.from('golos').delete().eq('jogo_id', selectedJogoForResult);

      // 3. Insert new goals for scorers
      const validScorers = scorers.filter(s => (s.equipe === 'A' && s.jogador_id) || (s.equipe === 'B' && s.nome_adversario));
      if (validScorers.length > 0) {
        const goalsData = validScorers.map(s => ({
          jogo_id: selectedJogoForResult,
          jogador_id: s.equipe === 'A' ? s.jogador_id : null,
          nome_marcador_adversario: s.equipe === 'B' ? s.nome_adversario : null,
          equipe: s.equipe,
          quantidade: 1,
          minuto: s.minuto ? parseInt(s.minuto) : null
        }));
        const { error: goalsError } = await supabase.from('golos').insert(goalsData);
        if (goalsError) console.error('Erro ao salvar golos:', goalsError.message);
      }

      setSelectedJogoForResult(null);
      setResultScore({ golos_nossos: '', golos_adversario: '' });
      setScorers([{ equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);
      fetchJogos();
    } catch (error) {
      alert('Erro ao registar/atualizar resultado: ' + error.message);
    } finally {
      setSavingResult(false);
    }
  };

  return (
    <div className="jogos-dashboard">
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{view === 'add' ? (editingJogo ? 'Editar Partida' : 'Agendar Nova Partida') : 'Próximos Jogos'}</h1>
            <p>{view === 'add' ? 'Preencha os detalhes para atualizar ou marcar um novo confronto.' : 'Acompanhe e gira o calendário de jogos da equipa.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => { setView('list'); setEditingJogo(null); }} 
              className={`submit-btn ${view === 'list' ? '' : 'outline'}`}
              style={{ background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Trophy size={18} /> Ver Todos
            </button>
            <button 
              onClick={() => { setView('add'); setEditingJogo(null); setNewJogo({ data: '', hora: '', equipe_a: '', equipe_b: '', campo: '', local: '', logo_a: '', logo_b: '' }); }} 
              className={`submit-btn ${view === 'add' ? '' : 'outline'}`}
              style={{ background: view === 'add' ? 'var(--primary)' : 'transparent', color: view === 'add' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Plus size={18} /> Novo Jogo
            </button>
          </div>
        </div>
      </div>

      {view !== 'add' && (
        <div className="layout-toggle-bar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 2rem', marginBottom: '-1rem' }}>
          <div className="toggle-group" style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setListLayout('cards')}
              className={`toggle-btn ${listLayout === 'cards' ? 'active' : ''}`}
              style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: listLayout === 'cards' ? 'var(--primary)' : 'transparent', color: listLayout === 'cards' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <LayoutGrid size={16} /> Cards
            </button>
            <button 
              onClick={() => setListLayout('table')}
              className={`toggle-btn ${listLayout === 'table' ? 'active' : ''}`}
              style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: listLayout === 'table' ? 'var(--primary)' : 'transparent', color: listLayout === 'table' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}
            >
              <List size={16} /> Tabela
            </button>
          </div>
        </div>
      )}

      <div className="jogos-main-content">
        {view === 'add' ? (
          <section className="form-card card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title"><Calendar size={20} /> {editingJogo ? 'Editar Partida' : 'Agendar Partida'}</h2>
            <form onSubmit={handleAddJogo} className="jogos-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Equipa A (Nós)</label>
                  <input type="text" placeholder="Nome da Equipa A" value={newJogo.equipe_a} onChange={(e) => setNewJogo({...newJogo, equipe_a: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Logo (Equipa A)</label>
                  <input type="file" accept="image/*" onChange={(e) => setFiles({...files, logo_a: e.target.files[0]})} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Equipa B (Adversário)</label>
                  <input type="text" placeholder="Nome da Equipa B" value={newJogo.equipe_b} onChange={(e) => setNewJogo({...newJogo, equipe_b: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Logo (Equipa B)</label>
                  <input type="file" accept="image/*" onChange={(e) => setFiles({...files, logo_b: e.target.files[0]})} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Data</label>
                  <input type="date" value={newJogo.data} onChange={(e) => setNewJogo({...newJogo, data: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Hora</label>
                  <input type="time" value={newJogo.hora} onChange={(e) => setNewJogo({...newJogo, hora: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Campo / Estádio</label>
                  <input type="text" placeholder="Ex: Campo do Bairro" value={newJogo.campo} onChange={(e) => setNewJogo({...newJogo, campo: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Cidade/Zona</label>
                  <input type="text" placeholder="Ex: Luanda, Viana" value={newJogo.local} onChange={(e) => setNewJogo({...newJogo, local: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="submit-btn" style={{ flex: 2, minWidth: '200px' }} disabled={uploading}>
                  {uploading ? <><Loader2 className="animate-spin" size={18} /> A guardar...</> : (editingJogo ? 'Atualizar Jogo' : 'Confirmar Agendamento')}
                </button>
                {editingJogo && (
                  <button 
                    type="button" 
                    onClick={() => {
                      handleDeleteJogo(editingJogo.id);
                      setView('list');
                      setEditingJogo(null);
                    }} 
                    className="delete-btn-full"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', padding: '0.75rem' }}
                  >
                    <Trash2 size={18} /> Eliminar
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => { setView('list'); setEditingJogo(null); }} 
                  className="cancel-btn" 
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="matches-list-section">
            <h2 className="section-title"><Trophy size={20} /> Calendário de Jogos ({jogos.length})</h2>
            {loading ? (
              <div className="loading-state"><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <div className="matches-container">
                {jogos.length === 0 ? (
                  <div className="empty-state">
                    <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Nenhum jogo agendado atualmente.</p>
                    <button onClick={() => setView('add')} className="text-btn">Marcar Primeiro Jogo</button>
                  </div>
                ) : listLayout === 'table' ? (
                  <div className="table-container card" style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="matches-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Data/Hora</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Equipa A</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Placar</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Equipa B</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Local</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jogos.map(jogo => (
                          <tr key={jogo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '600' }}>{new Date(jogo.data).toLocaleDateString('pt-PT')}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jogo.hora}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '4px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                  {jogo.logo_a ? <img src={jogo.logo_a} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : jogo.equipe_a[0]}
                                </div>
                                <span>{jogo.equipe_a}</span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              {jogo.resultados?.length > 0 ? (
                                <div style={{ fontWeight: '800', background: 'var(--bg-app)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                  {jogo.resultados[0].golos_nossos} - {jogo.resultados[0].golos_adversario}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VS</span>
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '4px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                  {jogo.logo_b ? <img src={jogo.logo_b} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : jogo.equipe_b[0]}
                                </div>
                                <span>{jogo.equipe_b}</span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{jogo.campo}</div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleEditResultClick(jogo)} className="edit-btn-mini" title="Resultado" style={{ color: '#10b981' }}><Award size={16} /></button>
                                <button onClick={() => handleEditClick(jogo)} className="edit-btn-mini" title="Editar"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteJogo(jogo.id)} className="delete-btn-mini" title="Eliminar"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="matches-grid">
                    {jogos.map((jogo) => (
                      <div key={jogo.id} className="match-card card">
                        <div className="match-header">
                          <div className="match-time">
                            <Clock size={14} /> {jogo.hora} • {new Date(jogo.data).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="match-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEditClick(jogo)} className="edit-btn-mini" title="Editar Partida" style={{ color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteJogo(jogo.id)} className="delete-btn-mini" title="Eliminar Jogo" style={{ background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="match-teams-display">
                          <div className="team-info">
                            <div className="team-logo-large">
                              {jogo.logo_a ? <img src={jogo.logo_a} alt={jogo.equipe_a} /> : jogo.equipe_a[0]}
                            </div>
                            <span className="team-name">{jogo.equipe_a}</span>
                          </div>
                          
                          <div className="match-result-center">
                            {jogo.resultados && jogo.resultados.length > 0 ? (
                              <div className="final-score">
                                {jogo.resultados[0].golos_nossos} - {jogo.resultados[0].golos_adversario}
                              </div>
                            ) : (
                              <div className="vs-badge">VS</div>
                            )}
                          </div>

                          <div className="team-info">
                            <div className="team-logo-large">
                              {jogo.logo_b ? <img src={jogo.logo_b} alt={jogo.equipe_b} /> : jogo.equipe_b[0]}
                            </div>
                            <span className="team-name">{jogo.equipe_b}</span>
                          </div>
                        </div>

                        <div className="match-location-info">
                          <MapPin size={14} /> {jogo.campo}, {jogo.local}
                        </div>

                        {jogo.golos && jogo.golos.length > 0 && (
                          <div className="match-scorers-display" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div className="team-a-scorers">
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--primary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{jogo.equipe_a}</div>
                                {jogo.golos.filter(g => g.equipe === 'A').length > 0 ? (
                                  jogo.golos.filter(g => g.equipe === 'A').map((g, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Award size={12} /> {g.jogadores?.nome} {g.minuto && <span style={{ opacity: 0.6 }}>({g.minuto}')</span>}
                                    </div>
                                  ))
                                ) : <span style={{ opacity: 0.4 }}>-</span>}
                              </div>
                              <div className="team-b-scorers" style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>{jogo.equipe_b}</div>
                                {jogo.golos.filter(g => g.equipe === 'B').length > 0 ? (
                                  jogo.golos.filter(g => g.equipe === 'B').map((g, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                      {g.nome_marcador_adversario || 'Adversário'} {g.minuto && <span style={{ opacity: 0.6 }}>({g.minuto}')</span>} <Award size={12} />
                                    </div>
                                  ))
                                ) : <span style={{ opacity: 0.4 }}>-</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedJogoForResult === jogo.id ? (
                          <div className="result-form-container">
                            <form onSubmit={handleAddResult} className="result-detailed-form">
                              <div className="score-inputs">
                                <div className="input-group">
                                  <label>{jogo.equipe_a}</label>
                                  <input 
                                    type="number" 
                                    value={resultScore.golos_nossos} 
                                    onChange={(e) => setResultScore({...resultScore, golos_nossos: e.target.value})}
                                    required
                                    min="0"
                                  />
                                </div>
                                <div className="score-divider">-</div>
                                <div className="input-group">
                                  <label>{jogo.equipe_b}</label>
                                  <input 
                                    type="number" 
                                    value={resultScore.golos_adversario} 
                                    onChange={(e) => setResultScore({...resultScore, golos_adversario: e.target.value})}
                                    required
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div className="scorers-section">
                                <label className="sub-label"><Award size={14} /> Marcadores do Jogo</label>
                                {scorers.map((scorer, index) => (
                                  <div key={index} className="scorer-row-container" style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                                    <div className="scorer-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <select 
                                        value={scorer.equipe} 
                                        onChange={(e) => handleScorerChange(index, 'equipe', e.target.value)}
                                        className="team-select"
                                        style={{ width: '120px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                                      >
                                        <option value="A">{jogo.equipe_a} (Nós)</option>
                                        <option value="B">{jogo.equipe_b} (Adversário)</option>
                                      </select>

                                      {scorer.equipe === 'A' ? (
                                        <select 
                                          value={scorer.jogador_id} 
                                          onChange={(e) => handleScorerChange(index, 'jogador_id', e.target.value)}
                                          className="scorer-select"
                                          style={{ flex: 1 }}
                                        >
                                          <option value="">Escolha o jogador...</option>
                                          {jogadores.map(j => (
                                            <option key={j.id} value={j.id}>{j.nome}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <input 
                                          type="text" 
                                          placeholder="Nome do marcador adversário" 
                                          value={scorer.nome_adversario}
                                          onChange={(e) => handleScorerChange(index, 'nome_adversario', e.target.value)}
                                          className="scorer-input"
                                          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                                        />
                                      )}

                                      <div className="minute-input-wrapper">
                                        <Timer size={14} className="input-icon" />
                                        <input 
                                          type="number" 
                                          placeholder="Min" 
                                          value={scorer.minuto} 
                                          onChange={(e) => handleScorerChange(index, 'minuto', e.target.value)}
                                          className="minute-input"
                                          min="1"
                                          max="120"
                                        />
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const updated = scorers.filter((_, i) => i !== index);
                                          setScorers(updated.length ? updated : [{ equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);
                                        }}
                                        className="delete-btn-mini"
                                        style={{ padding: '0.25rem', color: '#ef4444' }}
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button type="button" onClick={handleAddScorer} className="add-scorer-btn">
                                  <UserPlus size={14} /> Adicionar Marcador
                                </button>
                              </div>

                              <div className="form-actions-mini">
                                <button type="submit" className="save-btn" disabled={savingResult}>
                                  {savingResult ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Resultado'}
                                </button>
                                <button type="button" onClick={() => {setSelectedJogoForResult(null); setScorers([{ equipe: 'A', jogador_id: '', nome_adversario: '', minuto: '' }]);}} className="cancel-btn">
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="match-footer-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button 
                              className="register-btn" 
                              onClick={() => handleEditResultClick(jogo)}
                              style={{ flex: 4, background: jogo.resultados?.length > 0 ? '#10b981' : 'var(--primary)' }}
                            >
                              {jogo.resultados?.length > 0 ? 'Editar Resultado' : 'Registar Resultado'}
                            </button>
                            <button 
                              className="delete-btn-card"
                              onClick={() => handleDeleteJogo(jogo.id)}
                              style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Apagar Jogo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default JogosDashboard;
