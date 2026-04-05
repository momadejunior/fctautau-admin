import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Plus, 
  Loader2, 
  User, 
  Trash2, 
  Search, 
  ArrowUpRight, 
  Award, 
  ShieldCheck,
  Edit2
} from 'lucide-react';
import './AdministracaoDashboard.css';

const AdministracaoDashboard = ({ initialView = 'list' }) => {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMembro, setNewMembro] = useState({
    nome: '',
    cargo: '',
    ordem: 0
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembros();
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const fetchMembros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('administracao')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setMembros(data || []);
    } catch (error) {
      console.error('Error fetching administrative members:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembro = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let foto_url = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_admin.${fileExt}`;
        const filePath = `admin/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('imagens')
          .getPublicUrl(filePath);
        
        foto_url = data.publicUrl;
      }

      const { error } = await supabase.from('administracao').insert([
        {
          nome: newMembro.nome,
          cargo: newMembro.cargo,
          ordem: parseInt(newMembro.ordem || 0),
          foto_url: foto_url
        }
      ]);

      if (error) throw error;

      setNewMembro({ nome: '', cargo: '', ordem: 0 });
      setFile(null);
      setView('list');
      fetchMembros();
    } catch (error) {
      alert('Erro ao adicionar membro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMembro = async (id) => {
    if (!confirm('Deseja realmente remover este membro da administração?')) return;
    try {
      const { error } = await supabase.from('administracao').delete().eq('id', id);
      if (error) throw error;
      fetchMembros();
    } catch (error) {
      alert('Erro ao remover membro: ' + error.message);
    }
  };

  const filteredMembros = membros.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="administracao-dashboard">
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Estrutura Administrativa</h1>
            <p>Gerencie a direção, conselhos e staff técnico da organização.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setView('list')} 
              className={`submit-btn ${view === 'list' ? '' : 'outline'}`}
              style={{ background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Users size={18} /> Ver Todos
            </button>
            <button 
              onClick={() => setView('add')} 
              className={`submit-btn ${view === 'add' ? '' : 'outline'}`}
              style={{ background: view === 'add' ? 'var(--primary)' : 'transparent', color: view === 'add' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Plus size={18} /> Novo Membro
            </button>
          </div>
        </div>
      </div>

      <div className="administracao-main-content">
        {view === 'add' ? (
          <section className="form-card card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title"><ShieldCheck size={20} /> Adicionar Novo Membro</h2>
            <form onSubmit={handleAddMembro} className="administracao-form">
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João da Silva" 
                  value={newMembro.nome} 
                  onChange={(e) => setNewMembro({...newMembro, nome: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Cargo / Função</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Presidente" 
                    value={newMembro.cargo} 
                    onChange={(e) => setNewMembro({...newMembro, cargo: e.target.value})} 
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Ordem (Prioridade)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 1" 
                    value={newMembro.ordem} 
                    onChange={(e) => setNewMembro({...newMembro, ordem: e.target.value})} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Fotografia</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '1rem', width: '100%' }} disabled={saving}>
                {saving ? <><Loader2 className="animate-spin" size={18} /> A guardar...</> : 'Confirmar Adição'}
              </button>
            </form>
          </section>
        ) : (
          <section className="administracao-list-section">
            <div className="list-controls">
              <h2 className="section-title" style={{ margin: 0 }}><Users size={20} /> Membros ({filteredMembros.length})</h2>
              <div className="search-bar-container">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou cargo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state"><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <div className="administracao-grid-display">
                {filteredMembros.length === 0 ? (
                  <div className="empty-state">
                    <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Nenhum membro administrativo encontrado.</p>
                    <button onClick={() => {setSearchTerm(''); setView('add');}} className="text-btn">Adicionar Novo</button>
                  </div>
                ) : (
                  filteredMembros.map((membro) => (
                    <div key={membro.id} className="admin-card">
                      <div className="admin-card-header">
                        <div className="admin-avatar-large">
                          {membro.foto_url ? (
                            <img src={membro.foto_url} alt={membro.nome} />
                          ) : (
                            <ShieldCheck size={32} />
                          )}
                        </div>
                        <div className="admin-actions">
                          <button onClick={() => handleDeleteMembro(membro.id)} className="delete-btn-mini">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="admin-card-body">
                        <h3 className="admin-name-display">{membro.nome}</h3>
                        <div className="admin-cargo-tag">
                          <span>{membro.cargo}</span>
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

export default AdministracaoDashboard;
