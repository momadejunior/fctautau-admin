import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, 
  ChevronRight, 
  Loader2, 
  Award, 
  Minus, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import './Classificacao.css';

const Classificacao = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassificacao();
  }, []);

  const fetchClassificacao = async () => {
    try {
      setLoading(true);
      
      // Fetch all matches that have results
      const { data: matches, error } = await supabase
        .from('jogos')
        .select('*, resultados(*)');

      if (error) throw error;

      const standings = {};

      const getTeamEntry = (name, logo) => {
        if (!standings[name]) {
          standings[name] = {
            nome: name,
            logo: logo,
            jogos: 0,
            vitorias: 0,
            empates: 0,
            derrotas: 0,
            golos_pro: 0,
            golos_contra: 0,
            saldo: 0,
            pontos: 0,
            forma: []
          };
        }
        return standings[name];
      };

      matches.forEach(m => {
        if (m.resultados && m.resultados.length > 0) {
          const res = m.resultados[0];
          const teamA = getTeamEntry(m.equipe_a, m.logo_a);
          const teamB = getTeamEntry(m.equipe_b, m.logo_b);

          teamA.jogos += 1;
          teamB.jogos += 1;
          teamA.golos_pro += res.golos_nossos;
          teamA.golos_contra += res.golos_adversario;
          teamB.golos_pro += res.golos_adversario;
          teamB.golos_contra += res.golos_nossos;

          if (res.golos_nossos > res.golos_adversario) {
            teamA.vitorias += 1;
            teamA.pontos += 3;
            teamA.forma.push('V');
            teamB.derrotas += 1;
            teamB.forma.push('D');
          } else if (res.golos_nossos === res.golos_adversario) {
            teamA.empates += 1;
            teamA.pontos += 1;
            teamA.forma.push('E');
            teamB.empates += 1;
            teamB.pontos += 1;
            teamB.forma.push('E');
          } else {
            teamA.derrotas += 1;
            teamA.forma.push('D');
            teamB.vitorias += 1;
            teamB.pontos += 3;
            teamB.forma.push('V');
          }

          teamA.saldo = teamA.golos_pro - teamA.golos_contra;
          teamB.saldo = teamB.golos_pro - teamB.golos_contra;
        }
      });

      // Convert map to array and sort
      const sortedTeams = Object.values(standings).sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.saldo !== a.saldo) return b.saldo - a.saldo;
        return b.golos_pro - a.golos_pro;
      });

      setTeams(sortedTeams);
    } catch (error) {
      console.error('Error fetching classification:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resumo-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>A carregar classificação...</p>
      </div>
    );
  }

  return (
    <div className="classificacao-container">
      <div className="dashboard-title-section">
        <h1>Classificação Geral</h1>
        <p>Tabela de desempenho de todas as equipas na competição.</p>
      </div>

      <div className="classificacao-card card">
        <div className="table-responsive">
          <table className="league-table">
            <thead>
              <tr>
                <th className="pos">Pos</th>
                <th className="team-cell">Equipa</th>
                <th>J</th>
                <th>V</th>
                <th>E</th>
                <th>D</th>
                <th className="hide-mobile">GP</th>
                <th className="hide-mobile">GC</th>
                <th>SG</th>
                <th className="pts-col">Pts</th>
                <th className="forma-col hide-mobile">Forma</th>
              </tr>
            </thead>
            <tbody>
              {teams.length > 0 ? teams.map((team, index) => (
                <tr key={team.nome} className={index < 4 ? 'top-zone' : ''}>
                  <td className="pos">
                    <span className={`pos-badge pos-${index + 1}`}>{index + 1}</span>
                  </td>
                  <td className="team-cell">
                    <div className="team-info">
                      <div className="team-logo-mini">
                        {team.logo ? (
                          <img src={team.logo} alt={team.nome} />
                        ) : (
                          <span>{team.nome[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="team-name-text">{team.nome}</span>
                    </div>
                  </td>
                  <td>{team.jogos}</td>
                  <td>{team.vitorias}</td>
                  <td>{team.empates}</td>
                  <td>{team.derrotas}</td>
                  <td className="hide-mobile">{team.golos_pro}</td>
                  <td className="hide-mobile">{team.golos_contra}</td>
                  <td className={`sg ${team.saldo > 0 ? 'positive' : team.saldo < 0 ? 'negative' : ''}`}>
                    {team.saldo > 0 ? `+${team.saldo}` : team.saldo}
                  </td>
                  <td className="pts-col"><strong>{team.pontos}</strong></td>
                  <td className="forma-col hide-mobile">
                    <div className="forma-dots">
                      {team.forma.slice(-5).map((f, i) => (
                        <span key={i} className={`forma-dot ${f}`} title={f === 'V' ? 'Vitória' : f === 'E' ? 'Empate' : 'Derrota'}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                    Não foram encontrados dados de jogos realizados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Classificacao;
