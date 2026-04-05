import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Camera, 
  Video, 
  Plus, 
  Loader2, 
  Trash2, 
  Image as ImageIcon, 
  ExternalLink,
  Filter,
  X,
  PlayCircle
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import './MediaDashboard.css';

const MediaDashboard = () => {
  const { showNotification } = useNotification();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [category, setCategory] = useState('Todos');
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState({
    titulo: '',
    tipo: 'foto',
    url: '',
    categoria: 'Geral'
  });
  const [file, setFile] = useState(null);

  const categorias = ['Todos', 'Jogos', 'Treinos', 'Eventos', 'Geral'];

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error.message);
      showNotification('Erro ao carregar media: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeThumbnail = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return null;
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let finalUrl = newMedia.url;
      let thumbnail = null;

      if (newMedia.tipo === 'foto' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_media.${fileExt}`;
        const filePath = `media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('imagens')
          .getPublicUrl(filePath);
        
        finalUrl = data.publicUrl;
      } else if (newMedia.tipo === 'video') {
        thumbnail = getYoutubeThumbnail(newMedia.url);
      }

      const { error } = await supabase.from('media').insert([
        {
          titulo: newMedia.titulo,
          tipo: newMedia.tipo,
          url: finalUrl,
          thumbnail: thumbnail,
          categoria: newMedia.categoria
        }
      ]);

      if (error) throw error;
      
      showNotification('Media adicionada com sucesso!', 'success');
      setNewMedia({ titulo: '', tipo: 'foto', url: '', categoria: 'Geral' });
      setFile(null);
      setView('list');
      fetchMedia();
    } catch (error) {
      showNotification('Erro ao adicionar media: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id, url, tipo) => {
    if (!confirm('Deseja eliminar este item de media?')) return;
    try {
      if (tipo === 'foto' && url.includes('supabase.co')) {
        const filePath = url.split('/').pop().split('?')[0];
        await supabase.storage.from('imagens').remove([`media/${filePath}`]);
      }
      
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;
      showNotification('Item removido com sucesso', 'success');
      fetchMedia();
    } catch (error) {
      showNotification('Erro ao eliminar item: ' + error.message, 'error');
    }
  };

  const filteredMedia = category === 'Todos' 
    ? media 
    : media.filter(m => m.categoria === category);

  return (
    <div className="media-dashboard">
      <div className="dashboard-title-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Galeria de Media</h1>
            <p>Explore e gira as fotos e vídeos do clube.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setView('list')} 
              className={`submit-btn ${view === 'list' ? '' : 'outline'}`}
              style={{ background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <ImageIcon size={18} /> Galeria
            </button>
            <button 
              onClick={() => setView('add')} 
              className={`submit-btn ${view === 'add' ? '' : 'outline'}`}
              style={{ background: view === 'add' ? 'var(--primary)' : 'transparent', color: view === 'add' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Plus size={18} /> Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="media-filters">
        {categorias.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="media-main-content">
        {view === 'add' ? (
          <section className="form-card card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title"><Plus size={20} /> Carregar Nova Media</h2>
            <form onSubmit={handleAddMedia} className="media-form">
              <div className="input-group">
                <label>Título / Descrição Curta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Treino de Sábado" 
                  value={newMedia.titulo} 
                  onChange={(e) => setNewMedia({...newMedia, titulo: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Tipo</label>
                  <select 
                    value={newMedia.tipo} 
                    onChange={(e) => setNewMedia({...newMedia, tipo: e.target.value, url: ''})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-app)' }}
                  >
                    <option value="foto">Fotografia</option>
                    <option value="video">Vídeo (YouTube)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Categoria</label>
                  <select 
                    value={newMedia.categoria} 
                    onChange={(e) => setNewMedia({...newMedia, categoria: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-app)' }}
                  >
                    {categorias.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {newMedia.tipo === 'foto' ? (
                <div className="input-group">
                  <label>Ficheiro de Imagem</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required={newMedia.tipo === 'foto'} />
                </div>
              ) : (
                <div className="input-group">
                  <label>Link do YouTube</label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={newMedia.url} 
                    onChange={(e) => setNewMedia({...newMedia, url: e.target.value})} 
                    required={newMedia.tipo === 'video'}
                  />
                </div>
              )}

              <button type="submit" className="submit-btn" style={{ marginTop: '1rem', width: '100%' }} disabled={uploading}>
                {uploading ? <><Loader2 className="animate-spin" size={18} /> A carregar...</> : 'Publicar Media'}
              </button>
            </form>
          </section>
        ) : (
          <section className="media-gallery-section">
            {loading ? (
              <div className="loading-state"><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <div className="media-grid">
                {filteredMedia.length === 0 ? (
                  <div className="empty-state">
                    <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Nenhuma media encontrada nesta categoria.</p>
                    <button onClick={() => setView('add')} className="text-btn">Carregar Primeira Foto/Vídeo</button>
                  </div>
                ) : (
                  filteredMedia.map((item) => (
                    <div key={item.id} className="media-card">
                      <div className="media-preview">
                        {item.tipo === 'foto' ? (
                          <img src={item.url} alt={item.titulo} />
                        ) : (
                          <div className="video-thumb-container">
                            <img src={item.thumbnail || 'https://via.placeholder.com/400x225?text=Video'} alt={item.titulo} />
                            <div className="play-overlay"><PlayCircle size={48} color="white" /></div>
                          </div>
                        )}
                        <div className="media-overlay">
                          <button onClick={() => handleDeleteMedia(item.id, item.url, item.tipo)} className="delete-btn-mini white">
                            <Trash2 size={16} />
                          </button>
                          {item.tipo === 'video' && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="view-btn-mini">
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="media-info">
                        <span className="media-tag">{item.categoria}</span>
                        <h3 className="media-title">{item.titulo}</h3>
                        <span className="media-date">{new Date(item.created_at).toLocaleDateString('pt-PT')}</span>
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

export default MediaDashboard;
