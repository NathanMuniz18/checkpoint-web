import { isAuthenticated } from '../auth';
import { api } from '../api';
import type { Perfil } from '../types';
import { bindShell, escapeHtml, shell } from '../ui';

export async function renderHome(root: HTMLElement): Promise<void> {
  const auth = isAuthenticated();
  let name = 'jogador';
  let bio = '';
  if (auth) {
    try {
      const perfil = await api.get<Perfil>('/api/usuarios/perfil/');
      name = perfil.username;
      bio = perfil.bio || '';
    } catch { /* handled by request */ }
  }
  root.innerHTML = shell(`
    <section class="hero home-hero section-wrap">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> SUA JORNADA COMEÇA AQUI</p>
        <h1 class="${auth ? 'welcome-title' : ''}">${auth ? `<span>BEM-VINDO DE VOLTA,</span><em>${escapeHtml(name)}</em>` : 'TODO JOGO MERECE<br>UM <em>CHECKPOINT</em>'}</h1>
        <p class="hero-text">${auth ? escapeHtml(bio) : 'Organize sua biblioteca, acompanhe cada hora jogada e transforme progresso em conquistas.'}</p>
        <div class="button-row">
          <a class="btn btn-primary" href="${auth ? '#/jornada' : '#/registro'}">${auth ? 'CONTINUAR JORNADA' : 'CRIAR MEU CHECKPOINT'} <span>→</span></a>
          <a class="btn btn-ghost" href="${auth ? '#/conquistas' : '#/login'}">${auth ? 'VER CONQUISTAS' : 'JÁ TENHO CONTA'}</a>
        </div>
        <div class="hero-stats"><div><strong>01</strong><span>BUSQUE</span></div><div><strong>02</strong><span>ACOMPANHE</span></div><div><strong>03</strong><span>CONQUISTE</span></div></div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="portal"><div class="portal-core"><span>CP</span></div></div>
        <div class="floating-card float-a"><b>+ 1 JOGO</b><small>CHECKPOINT SALVO</small></div>
        <div class="floating-card float-b"><b>LVL UP</b><small>NOVA CONQUISTA</small></div>
      </div>
    </section>`, 'home');
  bindShell();
}
