import { isAuthenticated, logout } from './auth';

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char] || char);
}

export function shell(content: string, active = ''): string {
  const auth = isAuthenticated();
  const nav = auth
    ? [['jornada', 'Jornada'], ['conquistas', 'Conquistas'], ['perfil', 'Perfil']]
    : [['login', 'Entrar'], ['registro', 'Criar conta']];
  return `
    <div class="ambient ambient-one"></div><div class="ambient ambient-two"></div>
    <header class="site-header">
      <a class="brand" href="#/" aria-label="CHECKPOINT — início"><span class="brand-mark">C</span><span class="brand-word">CHECKPOINT</span></a>
      <button class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
      <nav class="main-nav" aria-label="Navegação principal">
        <a class="${active === 'home' ? 'active' : ''}" href="#/">Início</a>
        ${nav.map(([route, label]) => `<a class="${active === route ? 'active' : ''}" href="#/${route}">${label}</a>`).join('')}
        ${auth ? '<button class="nav-logout" data-logout>Sair</button>' : ''}
      </nav>
    </header>
    <main>${content}</main>
    <footer><a class="brand brand-small" href="#/"><span class="brand-mark">C</span><span class="brand-word">CHECKPOINT</span></a><p>Sua história. Seus jogos. Seu CHECKPOINT.</p><small>© 2026 CHECKPOINT</small></footer>`;
}

export function bindShell(): void {
  document.querySelector<HTMLButtonElement>('.nav-toggle')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const nav = document.querySelector('.main-nav');
    nav?.classList.toggle('open');
    button.setAttribute('aria-expanded', String(nav?.classList.contains('open')));
  });
  document.querySelector('[data-logout]')?.addEventListener('click', () => logout());
}

export function message(element: HTMLElement | null, text: string, type: 'success' | 'error' | 'info' = 'info'): void {
  if (!element) return;
  element.className = `message ${type}`;
  element.textContent = text;
  element.hidden = false;
}

export function setBusy(button: HTMLButtonElement | null, busy: boolean, label = 'Processando...'): void {
  if (!button) return;
  if (busy) { button.dataset.label = button.textContent || ''; button.textContent = label; }
  else button.textContent = button.dataset.label || button.textContent;
  button.disabled = busy;
}
