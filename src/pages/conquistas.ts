import { api } from '../api';
import type { JogoUsuario } from '../types';
import { bindShell, escapeHtml, shell } from '../ui';

export async function renderConquistas(root: HTMLElement): Promise<void> {
  root.innerHTML = shell('<section class="page section-wrap"><div class="loading">CALCULANDO CONQUISTAS<span>...</span></div></section>', 'conquistas'); bindShell();
  try {
    const games = await api.get<JogoUsuario[]>('/api/jogos/jornada/'); const hours = games.reduce((sum, game) => sum + game.horas_jogadas, 0);
    const achievements = [
      { icon: '◆', name: 'PRIMEIRO CHECKPOINT', desc: 'Adicione seu primeiro jogo à jornada.', value: games.length, target: 1, unit: 'jogo' },
      { icon: 'ϟ', name: 'MARATONISTA', desc: 'Registre 50 horas de aventuras.', value: hours, target: 50, unit: 'horas' },
      { icon: '♛', name: 'FINALIZADOR', desc: 'Conclua pelo menos uma campanha.', value: games.filter((g) => g.status === 'ja_zerei').length, target: 1, unit: 'finalizado' },
      { icon: '✦', name: 'EXPLORADOR', desc: 'Tenha 5 jogos na sua jornada.', value: games.length, target: 5, unit: 'jogos' },
    ];
    const unlocked = achievements.filter((item) => item.value >= item.target).length;
    root.innerHTML = shell(`<section class="page achievements-page section-wrap"><div class="achievement-hero"><div><p class="eyebrow"><span></span> SALA DE TROFÉUS</p><h1>MINHAS <em>CONQUISTAS</em></h1><p>Cada hora, campanha e universo explorado deixa sua marca.</p></div><div class="achievement-score"><strong>${unlocked}<small>/ ${achievements.length}</small></strong><span>DESBLOQUEADAS</span></div></div>
      <div class="achievement-stats"><div><span>JOGOS NA JORNADA</span><strong>${games.length}</strong></div><div><span>HORAS REGISTRADAS</span><strong>${hours}H</strong></div><div><span>JOGOS FINALIZADOS</span><strong>${games.filter((g) => g.status === 'ja_zerei').length}</strong></div></div>
      <div class="achievement-grid">${achievements.map((item, index) => { const done = item.value >= item.target; const progress = Math.min(100, item.value / item.target * 100); return `<article class="achievement-card ${done ? 'unlocked' : 'locked'}"><div class="achievement-top"><span class="achievement-number">0${index + 1}</span><span class="lock-state">${done ? 'DESBLOQUEADA' : 'BLOQUEADA'}</span></div><div class="achievement-icon">${item.icon}</div><h2>${item.name}</h2><p>${item.desc}</p><div class="progress"><span style="width:${progress}%"></span></div><small>${escapeHtml(item.value)} / ${item.target} ${item.unit}</small></article>`; }).join('')}</div>
    </section>`, 'conquistas'); bindShell();
  } catch (error) { root.querySelector('.loading')!.textContent = escapeHtml(error instanceof Error ? error.message : 'Erro ao carregar conquistas.'); }
}
