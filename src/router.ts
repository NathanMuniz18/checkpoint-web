import { isAuthenticated } from './auth';
import { renderHome } from './pages/home';
import { renderEsqueciSenha, renderLogin, renderRedefinirSenha, renderRegistro } from './pages/authPages';
import { renderPerfil, renderTrocarSenha } from './pages/perfil';
import { renderJornada } from './pages/jornada';
import { renderConquistas } from './pages/conquistas';
import { bindShell, shell } from './ui';

const protectedRoutes = new Set(['perfil', 'trocar-senha', 'jornada', 'conquistas']);

export async function route(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app'); if (!root) return;
  const path = location.hash.replace(/^#\/?/, '').split('?')[0] || 'home';
  if (protectedRoutes.has(path) && !isAuthenticated()) {
    sessionStorage.setItem('checkpoint_notice', 'Faça login para acessar esta área.'); location.hash = '/login'; return;
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  switch (path) {
    case 'home': await renderHome(root); break;
    case 'login': renderLogin(root); break;
    case 'registro': renderRegistro(root); break;
    case 'esqueci-senha': renderEsqueciSenha(root); break;
    case 'redefinir-senha': renderRedefinirSenha(root); break;
    case 'perfil': await renderPerfil(root); break;
    case 'trocar-senha': renderTrocarSenha(root); break;
    case 'jornada': await renderJornada(root); break;
    case 'conquistas': await renderConquistas(root); break;
    default: root.innerHTML = shell('<section class="not-found section-wrap"><strong>404</strong><h1>CHECKPOINT NÃO ENCONTRADO</h1><a class="btn btn-primary" href="#/">VOLTAR AO INÍCIO</a></section>'); bindShell();
  }
  const notice = sessionStorage.getItem('checkpoint_notice');
  if (notice && path === 'login') { const target = document.querySelector<HTMLElement>('#form-message'); if (target) { target.textContent = notice; target.className = 'message success'; target.hidden = false; } sessionStorage.removeItem('checkpoint_notice'); }
}
