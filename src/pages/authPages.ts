import { forgotPasswordRequest, loginRequest, registerRequest, resetPasswordRequest } from '../api';
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
      ${login ? '<p class="form-switch"><a href="#/esqueci-senha">Esqueci minha senha</a></p>' : ''}
      <p class="form-switch">${login ? 'Ainda não tem uma conta?' : 'Já faz parte do CHECKPOINT?'} <a href="#/${login ? 'registro' : 'login'}">${login ? 'Crie agora' : 'Fazer login'}</a></p>
    </div>
  </section>`, kind);
}

function resetParams(): { uid: string; token: string } {
  const query = location.hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return { uid: params.get('uid') || '', token: params.get('token') || '' };
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

export function renderEsqueciSenha(root: HTMLElement): void {
  root.innerHTML = shell(`<section class="auth-page account-auth-page single section-wrap">
    <div class="auth-card neon-card">
      <div class="card-kicker">RECUPERAR ACESSO <span>03</span></div>
      <h2>ESQUECI A SENHA</h2><p>Informe o e-mail cadastrado para receber o link de redefinição.</p>
      <div id="form-message" class="message" hidden></div>
      <form id="forgot-form">
        <label>E-MAIL<input name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label>
        <button class="btn btn-primary btn-full" type="submit">ENVIAR LINK <span>→</span></button>
      </form>
      <p class="form-switch"><a href="#/login">Voltar ao login</a></p>
    </div>
  </section>`, 'login'); bindShell();
  document.querySelector<HTMLFormElement>('#forgot-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement; const email = String(new FormData(form).get('email'));
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'ENVIANDO...');
    try {
      await forgotPasswordRequest(email);
      message(document.querySelector('#form-message'), 'Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição.', 'success');
      form.reset();
    } catch (error) { message(document.querySelector('#form-message'), error instanceof Error ? error.message : 'Não foi possível solicitar a redefinição.', 'error'); }
    finally { setBusy(button, false); }
  });
}

export function renderRedefinirSenha(root: HTMLElement): void {
  const { uid, token } = resetParams();
  root.innerHTML = shell(`<section class="auth-page account-auth-page single section-wrap">
    <div class="auth-card neon-card">
      <div class="card-kicker">NOVA SENHA <span>04</span></div>
      <h2>REDEFINIR SENHA</h2><p>Crie uma nova senha para voltar ao CHECKPOINT.</p>
      <div id="form-message" class="message" ${uid && token ? 'hidden' : ''}>Link de redefinição inválido ou incompleto.</div>
      <form id="reset-form">
        <label>NOVA SENHA<input name="nova_senha" type="password" autocomplete="new-password" required minlength="4" placeholder="••••••••"></label>
        <label>CONFIRMAR NOVA SENHA<input name="nova_senha_confirm" type="password" autocomplete="new-password" required minlength="4" placeholder="••••••••"></label>
        <button class="btn btn-primary btn-full" type="submit" ${uid && token ? '' : 'disabled'}>SALVAR NOVA SENHA <span>→</span></button>
      </form>
      <p class="form-switch"><a href="#/login">Voltar ao login</a></p>
    </div>
  </section>`, 'login'); bindShell();
  document.querySelector<HTMLFormElement>('#reset-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement; const data = Object.fromEntries(new FormData(form));
    const notice = document.querySelector<HTMLElement>('#form-message');
    if (data.nova_senha !== data.nova_senha_confirm) { message(notice, 'As senhas não coincidem.', 'error'); return; }
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'SALVANDO...');
    try {
      await resetPasswordRequest({ uid, token, ...data });
      sessionStorage.setItem('checkpoint_notice', 'Senha redefinida com sucesso. Faça login com a nova senha.');
      window.location.hash = '/login';
    } catch (error) { message(notice, error instanceof Error ? error.message : 'Não foi possível redefinir a senha.', 'error'); }
    finally { setBusy(button, false); }
  });
}
