import { api } from '../api';
import type { JogoRawg, JogoUsuario, StatusJogo } from '../types';
import { bindShell, escapeHtml, message, setBusy, shell } from '../ui';

const labels: Record<StatusJogo, string> = { vou_jogar: 'Vou Jogar', to_jogando: 'Tô jogando', ja_zerei: 'Já Zerei', desisti: 'Desisti' };
let jornada: JogoUsuario[] = [];

function gameImage(url: string, name: string): string {
  return url ? `<img src="${escapeHtml(url)}" alt="Capa de ${escapeHtml(name)}" loading="lazy">` : '<div class="cover-placeholder">CP</div>';
}

function libraryHtml(): string {
  if (!jornada.length) return '<div class="empty-state"><b>◇</b><h3>SUA JORNADA AINDA ESTÁ VAZIA</h3><p>Busque um jogo acima e salve seu primeiro checkpoint.</p></div>';
  return jornada.map((item) => {
    const game = item.jogo_detalhes;
    return `<article class="library-card" data-game-id="${item.id}"><div class="game-cover">${gameImage(game.capa_url, game.nome)}</div><button class="btn-icon danger delete-game" data-delete title="Excluir jogo" aria-label="Excluir ${escapeHtml(game.nome)}">×</button><div class="game-content"><p class="platform">${escapeHtml(game.plataforma || 'Plataforma não informada')}</p><h3 title="${escapeHtml(game.nome)}">${escapeHtml(game.nome)}</h3><div class="game-edit"><label>STATUS<select name="status">${Object.entries(labels).map(([value, label]) => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label>HORAS JOGADAS<input name="horas" type="number" min="0" step="1" value="${item.horas_jogadas}"></label></div><div class="game-actions"><button class="btn btn-small btn-primary" data-save>SALVAR</button></div></div></article>`;
  }).join('');
}

export async function renderJornada(root: HTMLElement): Promise<void> {
  root.innerHTML = shell(`<section class="page journey-page section-wrap"><div class="page-title journey-title"><div><p class="eyebrow"><span></span> CENTRAL DO JOGADOR</p><h1>MINHA <em>JORNADA</em></h1><p>Descubra novos mundos e mantenha seu progresso sempre salvo.</p></div><div class="journey-count"><strong id="game-count">—</strong><span>JOGOS<br>SALVOS</span></div></div>
    <section class="search-panel neon-card"><div class="panel-icon">⌕</div><div class="search-content"><div class="card-kicker">CATÁLOGO DE JOGOS <span>RAWG DATABASE</span></div><h2>QUAL É O PRÓXIMO DESAFIO?</h2><form id="search-form" class="search-form"><input name="q" required minlength="2" autocomplete="off" placeholder="Digite o nome de um jogo..."><button class="btn btn-primary" type="submit">BUSCAR NO CATÁLOGO</button></form><div id="journey-message" class="message" hidden></div></div></section>
    <div id="search-section" class="results-section" hidden><div class="list-heading"><h2>RESULTADOS DA <em>BUSCA</em></h2><span id="result-count"></span></div><div id="search-results" class="game-grid"></div></div>
    <section class="library-section"><div class="list-heading"><h2>MINHA <em>BIBLIOTECA</em></h2><div class="line"></div><span>PROGRESSO PESSOAL</span></div><div id="library" class="game-grid library-grid"><div class="loading">CARREGANDO JORNADA<span>...</span></div></div></section>
  </section>`, 'jornada'); bindShell(); bindSearch(); await loadJourney();
}

async function loadJourney(): Promise<void> {
  const container = document.querySelector<HTMLElement>('#library');
  try {
    jornada = await api.get<JogoUsuario[]>('/api/jogos/jornada/');
    if (container) container.innerHTML = libraryHtml();
    const count = document.querySelector('#game-count'); if (count) count.textContent = String(jornada.length).padStart(2, '0');
    bindLibraryActions();
  } catch (error) { if (container) container.innerHTML = `<div class="empty-state error"><p>${escapeHtml(error instanceof Error ? error.message : 'Erro ao carregar jornada.')}</p></div>`; }
}

function bindSearch(): void {
  document.querySelector<HTMLFormElement>('#search-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const q = String(new FormData(form).get('q')).trim(); const button = form.querySelector<HTMLButtonElement>('button');
    setBusy(button, true, 'BUSCANDO...');
    try {
      const games = await api.get<JogoRawg[]>(`/api/jogos/busca/?q=${encodeURIComponent(q)}`); renderSearchResults(games);
    } catch (error) { message(document.querySelector('#journey-message'), error instanceof Error ? error.message : 'Erro ao buscar jogos.', 'error'); }
    finally { setBusy(button, false); }
  });
}

function renderSearchResults(games: JogoRawg[]): void {
  const section = document.querySelector<HTMLElement>('#search-section'); const container = document.querySelector<HTMLElement>('#search-results');
  if (!section || !container) return; section.hidden = false;
  document.querySelector('#result-count')!.textContent = `${games.length} ENCONTRADO${games.length === 1 ? '' : 'S'}`;
  container.innerHTML = games.length ? games.map((game, index) => `<article class="result-card"><div class="game-cover">${gameImage(game.capa_url, game.nome)}</div><div class="game-content"><p class="platform">${escapeHtml(game.plataforma || 'Plataforma não informada')}</p><h3>${escapeHtml(game.nome)}</h3><button class="btn btn-small btn-ghost" data-add="${index}">+ ADICIONAR À JORNADA</button></div></article>`).join('') : '<div class="empty-state"><h3>NENHUM JOGO ENCONTRADO</h3><p>Tente outro nome ou verifique a grafia.</p></div>';
  container.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => button.addEventListener('click', () => addGame(games[Number(button.dataset.add)], button)));
}

async function addGame(game: JogoRawg, button: HTMLButtonElement): Promise<void> {
  setBusy(button, true, 'ADICIONANDO...');
  try {
    await api.post('/api/jogos/jornada/', { ...game, status: 'vou_jogar', horas_jogadas: 0 });
    message(document.querySelector('#journey-message'), `${game.nome} foi adicionado à sua jornada.`, 'success'); button.textContent = '✓ ADICIONADO'; await loadJourney();
  } catch (error) { message(document.querySelector('#journey-message'), error instanceof Error ? error.message : 'Não foi possível adicionar o jogo.', 'error'); setBusy(button, false); }
}

function bindLibraryActions(): void {
  document.querySelectorAll<HTMLElement>('[data-game-id]').forEach((card) => {
    const id = Number(card.dataset.gameId);
    card.querySelector<HTMLButtonElement>('[data-save]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement; const status = card.querySelector<HTMLSelectElement>('[name=status]')!.value as StatusJogo; const horas = Number(card.querySelector<HTMLInputElement>('[name=horas]')!.value);
      if (!Number.isInteger(horas) || horas < 0) { message(document.querySelector('#journey-message'), 'Informe um número válido de horas.', 'error'); return; }
      setBusy(button, true, 'SALVANDO...');
      try { await api.patch(`/api/jogos/jornada/${id}/`, { status, horas_jogadas: horas }); message(document.querySelector('#journey-message'), 'Jogo atualizado com sucesso.', 'success'); await loadJourney(); }
      catch (error) { message(document.querySelector('#journey-message'), error instanceof Error ? error.message : 'Erro ao atualizar o jogo.', 'error'); setBusy(button, false); }
    });
    card.querySelector<HTMLButtonElement>('[data-delete]')?.addEventListener('click', async () => {
      const game = jornada.find((item) => item.id === id); if (!confirm(`Excluir “${game?.jogo_detalhes.nome || 'este jogo'}” da sua jornada?`)) return;
      try { await api.delete(`/api/jogos/jornada/${id}/`); message(document.querySelector('#journey-message'), 'Jogo excluído com sucesso.', 'success'); await loadJourney(); }
      catch (error) { message(document.querySelector('#journey-message'), error instanceof Error ? error.message : 'Erro ao excluir jogo.', 'error'); }
    });
  });
}
