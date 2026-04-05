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
  PlayCircle,
  FolderPlus,
  Folder,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useRef } from 'react';
import './MediaDashboard.css';

const MediaDashboard = () => {
  const { showNotification } = useNotification();
  const galleryRef = useRef(null);
  const lgInstance = useRef(null);
  
  const [media, setMedia] = useState([]);
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingColecoes, setLoadingColecoes] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'add', 'colecoes'
  const [category, setCategory] = useState('Todos');
  const [selectedColecaoId, setSelectedColecaoId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, current: 0 });
  
  const [newMedia, setNewMedia] = useState({
    titulo: '',
    tipo: 'foto',
    url: '',
    categoria: 'Geral',
    colecao_id: ''
  });
  const [files, setFiles] = useState([]);
  const [newColecao, setNewColecao] = useState({ nome: '', descricao: '' });
  const [isCreatingColecao, setIsCreatingColecao] = useState(false);

  const categorias = ['Todos', 'Jogos', 'Treinos', 'Eventos', 'Geral'];

  useEffect(() => {
    fetchMedia();
    fetchColecoes();
  }, []);

  useEffect(() => {
    if (view === 'list' && galleryRef.current && media.length > 0) {
      initLightGallery();
    }
    return () => {
      if (lgInstance.current) {
        lgInstance.current.destroy();
        lgInstance.current = null;
      }
    };
  }, [view, media, selectedColecaoId, category]);

  const initLightGallery = () => {
    if (lgInstance.current) {
      lgInstance.current.destroy();
    }
    
    if (window.lightGallery && galleryRef.current && window.lgZoom && window.lgThumbnail) {
      try {
        lgInstance.current = window.lightGallery(galleryRef.current, {
          plugins: [window.lgZoom, window.lgThumbnail],
          speed: 500,
          selector: '.lg-item',
          download: true,
          counter: true,
          mobileSettings: {
            controls: true,
            showCloseIcon: true,
            download: true
          }
        });
      } catch (err) {
        console.error('LightGallery initialization failed:', err);
      }
    } else {
      console.warn('LightGallery or its plugins are not loaded yet.');
    }
  };

  const fetchColecoes = async () => {
    try {
      setLoadingColecoes(true);
      const { data, error } = await supabase
        .from('colecoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setColecoes(data || []);
    } catch (error) {
      console.error('Error fetching colecoes:', error.message);
    } finally {
      setLoadingColecoes(false);
    }
  };

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
    if (newMedia.tipo === 'foto' && files.length === 0) {
      showNotification('Selecione pelo menos uma foto.', 'warning');
      return;
    }

    try {
      setUploading(true);
      
      if (newMedia.tipo === 'foto') {
        setUploadProgress({ total: files.length, current: 0 });
        
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          const fileExt = currentFile.name.split('.').pop();
          const fileName = `${Date.now()}_${i}_media.${fileExt}`;
          const filePath = `media/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('imagens')
            .upload(filePath, currentFile);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('imagens')
            .getPublicUrl(filePath);
          
          const finalUrl = data.publicUrl;

          const { error } = await supabase.from('media').insert([
            {
              titulo: files.length > 1 ? `${newMedia.titulo} (${i + 1})` : newMedia.titulo,
              tipo: 'foto',
              url: finalUrl,
              categoria: newMedia.categoria,
              colecao_id: newMedia.colecao_id || null
            }
          ]);

          if (error) throw error;
          setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }
      } else {
        // Video upload
        const thumbnail = getYoutubeThumbnail(newMedia.url);
        const { error } = await supabase.from('media').insert([
          {
            titulo: newMedia.titulo,
            tipo: 'video',
            url: newMedia.url,
            thumbnail: thumbnail,
            categoria: newMedia.categoria,
            colecao_id: newMedia.colecao_id || null
          }
        ]);
        if (error) throw error;
      }

      showNotification(`${newMedia.tipo === 'foto' ? files.length : 1} item(s) adicionado(s) com sucesso!`, 'success');
      setNewMedia({ titulo: '', tipo: 'foto', url: '', categoria: 'Geral', colecao_id: '' });
      setFiles([]);
      setView('list');
      fetchMedia();
    } catch (error) {
      showNotification('Erro ao adicionar media: ' + error.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress({ total: 0, current: 0 });
    }
  };

  const handleCreateColecao = async (e) => {
    e.preventDefault();
    try {
      setLoadingColecoes(true);
      const { error } = await supabase.from('colecoes').insert([newColecao]);
      if (error) throw error;
      
      showNotification('Coleção criada com sucesso!', 'success');
      setNewColecao({ nome: '', descricao: '' });
      setIsCreatingColecao(false);
      fetchColecoes();
    } catch (error) {
      showNotification('Erro ao criar coleção: ' + error.message, 'error');
    } finally {
      setLoadingColecoes(false);
    }
  };

  const handleDeleteColecao = async (id) => {
    if (!confirm('Eliminar esta coleção? As fotos não serão apagadas, mas deixarão de estar agrupadas.')) return;
    try {
      const { error } = await supabase.from('colecoes').delete().eq('id', id);
      if (error) throw error;
      showNotification('Coleção eliminada', 'success');
      if (selectedColecaoId === id) setSelectedColecaoId(null);
      fetchColecoes();
    } catch (error) {
      showNotification('Erro ao eliminar coleção: ' + error.message, 'error');
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

  const filteredMedia = media.filter(m => {
    const matchesCategory = category === 'Todos' || m.categoria === category;
    const matchesColecao = !selectedColecaoId || m.colecao_id === selectedColecaoId;
    return matchesCategory && matchesColecao;
  });

  const selectedColecao = colecoes.find(c => c.id === selectedColecaoId);

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
              onClick={() => { setView('list'); setSelectedColecaoId(null); }} 
              className={`submit-btn ${view === 'list' && !selectedColecaoId ? '' : 'outline'}`}
              style={{ background: view === 'list' && !selectedColecaoId ? 'var(--primary)' : 'transparent', color: view === 'list' && !selectedColecaoId ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <ImageIcon size={18} /> Galeria
            </button>
            <button 
              onClick={() => setView('colecoes')} 
              className={`submit-btn ${view === 'colecoes' ? '' : 'outline'}`}
              style={{ background: view === 'colecoes' ? 'var(--primary)' : 'transparent', color: view === 'colecoes' ? 'white' : 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Layers size={18} /> Coleções
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
        {view === 'colecoes' ? (
          <section className="colecoes-section">
            <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="section-title"><Layers size={20} /> Álbuns e Coleções</h2>
              <button onClick={() => setIsCreatingColecao(!isCreatingColecao)} className="text-btn primary">
                {isCreatingColecao ? <X size={18} /> : <FolderPlus size={18} />} {isCreatingColecao ? 'Cancelar' : 'Nova Coleção'}
              </button>
            </div>

            {isCreatingColecao && (
              <div className="colecao-form-card card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                <form onSubmit={handleCreateColecao} className="mini-form">
                  <div className="input-group">
                    <label>Nome da Coleção</label>
                    <input type="text" value={newColecao.nome} onChange={e => setNewColecao({...newColecao, nome: e.target.value})} required placeholder="Ex: Final do Campeonato 2024" />
                  </div>
                  <div className="input-group">
                    <label>Descrição (Opcional)</label>
                    <textarea value={newColecao.descricao} onChange={e => setNewColecao({...newColecao, descricao: e.target.value})} placeholder="Breve descrição do álbum..." />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loadingColecoes}>Criar Álbum</button>
                </form>
              </div>
            )}

            <div className="colecoes-grid">
              {colecoes.length === 0 ? (
                <div className="empty-state">
                  <Folder size={48} style={{ opacity: 0.1 }} />
                  <p>Ainda não criou nenhuma coleção.</p>
                </div>
              ) : (
                colecoes.map(col => (
                  <div key={col.id} className="colecao-card card" onClick={() => { setSelectedColecaoId(col.id); setView('list'); }}>
                    <div className="colecao-thumb">
                      <Folder size={40} />
                      <span className="photo-count">{media.filter(m => m.colecao_id === col.id).length} itens</span>
                    </div>
                    <div className="colecao-info">
                      <h3>{col.nome}</h3>
                      <p>{col.descricao || 'Sem descrição'}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteColecao(col.id); }} className="delete-colecao-btn"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : view === 'add' ? (
          <section className="form-card card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title"><Plus size={20} /> Carregar Nova Media</h2>
            {uploading && (
              <div className="upload-progress-overlay">
                <div className="progress-card">
                  <Loader2 className="animate-spin" size={32} />
                  <p>A carregar {uploadProgress.current} de {uploadProgress.total} ficheiros...</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleAddMedia} className="media-form">
              <div className="input-group">
                <label>Título / Descrição Padrão</label>
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
                    <option value="foto">Fotografia (Múltiplas)</option>
                    <option value="video">Vídeo (YouTube)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Coleção (Álbum)</label>
                  <select 
                    value={newMedia.colecao_id} 
                    onChange={(e) => setNewMedia({...newMedia, colecao_id: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-app)' }}
                  >
                    <option value="">Nenhuma Coleção</option>
                    {colecoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
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

              {newMedia.tipo === 'foto' ? (
                <div className="input-group">
                  <label>Ficheiros de Imagem (Selecione um ou vários)</label>
                  <div className="file-input-wrapper multi">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => setFiles(Array.from(e.target.files))} 
                      required={newMedia.tipo === 'foto'}
                      className="multi-file-input"
                    />
                    <div className="multi-file-status">
                      <Camera size={24} />
                      {files.length > 0 ? (
                        <div className="files-summary">
                          <strong>{files.length} ficheiros prontos para upload</strong>
                          <ul className="filename-preview">
                            {files.slice(0, 5).map((f, i) => <li key={i}>{f.name}</li>)}
                            {files.length > 5 && <li>...e mais {files.length - 5} ficheiros</li>}
                          </ul>
                        </div>
                      ) : (
                        <p>Clique aqui para selecionar múltiplas fotos</p>
                      )}
                    </div>
                  </div>
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
            {selectedColecaoId && (
              <div className="colecao-breadcrumb" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setSelectedColecaoId(null)} className="back-btn"><ChevronLeft size={20} /> Coleções</button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedColecao?.nome}</h2>
                  <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{selectedColecao?.descricao}</p>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="loading-state"><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
            ) : (
              <div className="media-grid" ref={galleryRef}>
                {filteredMedia.length === 0 ? (
                  <div className="empty-state">
                    <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Nenhuma media encontrada.</p>
                    <button onClick={() => setView('add')} className="text-btn">Carregar Primeira Foto/Vídeo</button>
                  </div>
                ) : (
                  filteredMedia.map((item) => (
                    <div key={item.id} className="media-card">
                      {item.tipo === 'foto' ? (
                        <a href={item.url} className="lg-item media-preview">
                          <img src={item.url} alt={item.titulo} />
                          <div className="media-overlay">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMedia(item.id, item.url, item.tipo); }} className="delete-btn-mini white">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </a>
                      ) : (
                        <div className="media-preview">
                          <div className="video-thumb-container">
                            <img src={item.thumbnail || 'https://via.placeholder.com/400x225?text=Video'} alt={item.titulo} />
                            <div className="play-overlay"><PlayCircle size={48} color="white" /></div>
                          </div>
                          <div className="media-overlay">
                            <button onClick={() => handleDeleteMedia(item.id, item.url, item.tipo)} className="delete-btn-mini white">
                              <Trash2 size={16} />
                            </button>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="view-btn-mini">
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="media-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="media-tag">{item.categoria || 'Geral'}</span>
                          <span className="media-date">{item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Recente'}</span>
                        </div>
                        <h3 className="media-title">{item.titulo}</h3>
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
