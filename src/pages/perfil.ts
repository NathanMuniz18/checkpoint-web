import { api } from '../api';
import type { Perfil } from '../types';
import { bindShell, escapeHtml, message, setBusy, shell } from '../ui';

export async function renderPerfil(root: HTMLElement): Promise<void> {
  root.innerHTML = shell('<section class="page section-wrap"><div class="loading">CARREGANDO PERFIL<span>...</span></div></section>', 'perfil'); bindShell();
  try {
    const perfil = await api.get<Perfil>('/api/usuarios/perfil/');
    root.innerHTML = shell(`<section class="page profile-page section-wrap"><div class="page-title"><p class="eyebrow"><span></span> IDENTIDADE DO JOGADOR</p><h1>MEU <em>PERFIL</em></h1><p>Personalize como você aparece no universo CHECKPOINT.</p></div>
      <div class="profile-layout">
        <aside class="profile-summary neon-card"><div class="avatar">${perfil.foto ? `<img src="${escapeHtml(perfil.foto)}" alt="Foto de ${escapeHtml(perfil.username)}">` : `<span>${escapeHtml(perfil.username.slice(0, 2).toUpperCase())}</span>`}</div><p class="online">● JOGADOR ONLINE</p><h2>${escapeHtml(perfil.username)}</h2><p>${escapeHtml(perfil.email)}</p><div class="profile-meta"><span>MEMBRO DESDE</span><b>${new Date(perfil.criado_em).toLocaleDateString('pt-BR')}</b></div></aside>
        <div class="profile-form neon-card"><div class="card-kicker">EDITAR PERFIL <span>ID ${perfil.id}</span></div><div id="profile-message" class="message" hidden></div>
          <form id="profile-form"><label>USUÁRIO<input value="${escapeHtml(perfil.username)}" disabled><small>O nome de usuário não pode ser alterado.</small></label><label>E-MAIL<input value="${escapeHtml(perfil.email)}" disabled></label><label>URL DA FOTO<input name="foto" type="url" value="${escapeHtml(perfil.foto)}" placeholder="https://exemplo.com/sua-foto.jpg"></label><label>BIO<textarea name="bio" maxlength="500" rows="6" placeholder="Conte um pouco sobre sua vida gamer...">${escapeHtml(perfil.bio)}</textarea></label><div class="button-row"><button class="btn btn-primary" type="submit">SALVAR ALTERAÇÕES</button><a class="btn btn-ghost" href="#/trocar-senha">TROCAR SENHA</a></div></form>
        </div>
      </div></section>`, 'perfil'); bindShell(); bindProfileForm();
  } catch (error) { root.querySelector('.loading')!.textContent = error instanceof Error ? error.message : 'Erro ao carregar perfil.'; }
}

function bindProfileForm(): void {
  document.querySelector<HTMLFormElement>('#profile-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = Object.fromEntries(new FormData(form));
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'SALVANDO...');
    try { await api.patch('/api/usuarios/perfil/atualizar/', data); message(document.querySelector('#profile-message'), 'Perfil salvo com sucesso.', 'success'); }
    catch (error) { message(document.querySelector('#profile-message'), error instanceof Error ? error.message : 'Erro ao salvar perfil.', 'error'); }
    finally { setBusy(button, false); }
  });
}

export function renderTrocarSenha(root: HTMLElement): void {
  root.innerHTML = shell(`<section class="auth-page single section-wrap"><div class="auth-card neon-card"><div class="card-kicker">SEGURANÇA <span>•••</span></div><h2>TROCAR SENHA</h2><p>Escolha uma nova chave de acesso para seu checkpoint.</p><div id="password-message" class="message" hidden></div><form id="password-form"><label>SENHA ATUAL<input name="senha_atual" type="password" required autocomplete="current-password"></label><label>NOVA SENHA<input name="nova_senha" type="password" required autocomplete="new-password"></label><label>CONFIRMAR NOVA SENHA<input name="nova_senha_confirm" type="password" required autocomplete="new-password"></label><button class="btn btn-primary btn-full" type="submit">ATUALIZAR SENHA</button></form><p class="form-switch"><a href="#/perfil">← Voltar ao perfil</a></p></div></section>`, 'perfil'); bindShell();
  document.querySelector<HTMLFormElement>('#password-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = Object.fromEntries(new FormData(form)); const notice = document.querySelector<HTMLElement>('#password-message');
    if (data.nova_senha !== data.nova_senha_confirm) { message(notice, 'As novas senhas não coincidem.', 'error'); return; }
    const button = form.querySelector<HTMLButtonElement>('button'); setBusy(button, true, 'ATUALIZANDO...');
    try { await api.post('/api/usuarios/trocar-senha/', data); form.reset(); message(notice, 'Senha alterada com sucesso.', 'success'); }
    catch (error) { message(notice, error instanceof Error ? error.message : 'Erro ao trocar senha.', 'error'); }
    finally { setBusy(button, false); }
  });
}
