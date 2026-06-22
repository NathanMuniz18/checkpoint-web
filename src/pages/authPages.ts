import { loginRequest, registerRequest } from '../api';
import { saveTokens } from '../auth';
import { bindShell, message, setBusy, shell } from '../ui';

function authLayout(kind: 'login' | 'registro'): string {
  const login = kind === 'login';
  return shell(`<section class="auth-page account-auth-page section-wrap">
    <div class="auth-aside"><p class="eyebrow"><span></span> ${login ? 'BEM-VINDO DE VOLTA' : 'NOVO JOGADOR'}</p><h1>${login ? 'CONTINUE DE ONDE<br>VOCÊ <em>PAROU.</em>' : 'CRIE SEU<br><em>CHECKPOINT.</em>'}</h1><p>${login ? 'Sua biblioteca, seu progresso e suas conquistas estão esperando.' : 'Toda grande jornada começa com um primeiro save.'}</p><div class="auth-emblem">CP<span>${login ? 'PLAYER ONE' : 'NEW GAME'}</span></div></div>
    <div class="auth-card neon-card">
      <div class="card-kicker">${login ? 'ACESSAR CONTA' : 'CRIAR CONTA'} <span>${login ? '01' : '02'}</span></div>
      <h2>${login ? 'LOGIN' : 'REGISTRO'}</h2><p>${login ? 'Insira suas credenciais para continuar.' : 'Preencha seus dados para entrar no jogo.'}</p>
      <div id="form-message" class="message" hidden></div>
      <form id="auth-form">
        <label>USUÁRIO<input name="username" autocomplete="username" required placeholder="Seu nome de jogador"></label>
        ${login ? '' : '<label>E-MAIL<input name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label>'}
        <label>SENHA<input name="password" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" required minlength="4" placeholder="••••••••"></label>
        ${login ? '' : '<label>CONFIRMAR SENHA<input name="password_confirm" type="password" autocomplete="new-password" required minlength="4" placeholder="••••••••"></label>'}
        <button class="btn btn-primary btn-full" type="submit">${login ? 'ENTRAR NO CHECKPOINT' : 'CRIAR MINHA CONTA'} <span>→</span></button>
      </form>
      <p class="form-switch">${login ? 'Ainda não tem uma conta?' : 'Já faz parte do CHECKPOINT?'} <a href="#/${login ? 'registro' : 'login'}">${login ? 'Crie agora' : 'Fazer login'}</a></p>
    </div>
  </section>`, kind);
}

export function renderLogin(root: HTMLElement): void {
  root.innerHTML = authLayout('login'); bindShell();
  document.querySelector<HTMLFormElement>('#auth-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement; const data = new FormData(form);
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'AUTENTICANDO...');
    try {
      const tokens = await loginRequest(String(data.get('username')), String(data.get('password')));
      saveTokens(tokens); window.location.hash = '/';
    } catch (error) { message(document.querySelector('#form-message'), error instanceof Error ? error.message : 'Login inválido.', 'error'); }
    finally { setBusy(button, false); }
  });
}

export function renderRegistro(root: HTMLElement): void {
  root.innerHTML = authLayout('registro'); bindShell();
  document.querySelector<HTMLFormElement>('#auth-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement; const data = Object.fromEntries(new FormData(form));
    const notice = document.querySelector<HTMLElement>('#form-message');
    if (data.password !== data.password_confirm) { message(notice, 'As senhas não coincidem.', 'error'); return; }
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'CRIANDO CONTA...');
    try {
      await registerRequest(data); sessionStorage.setItem('checkpoint_notice', 'Conta criada! Faça login para iniciar sua jornada.'); window.location.hash = '/login';
    } catch (error) { message(notice, error instanceof Error ? error.message : 'Não foi possível criar a conta.', 'error'); }
    finally { setBusy(button, false); }
  });
}
