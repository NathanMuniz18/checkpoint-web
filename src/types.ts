export type AuthTokens = { access: string; refresh: string };

export type Perfil = {
  id: number;
  username: string;
  email: string;
  bio: string;
  foto: string;
  criado_em: string;
};

export type JogoRawg = {
  id?: number;
  rawg_id: number;
  nome: string;
  capa_url: string;
  plataforma: string;
  slug: string;
};

export type JogoDetalhes = JogoRawg & { id: number };
export type StatusJogo = 'vou_jogar' | 'to_jogando' | 'ja_zerei' | 'desisti';

export type JogoUsuario = {
  id: number;
  jogo: number;
  jogo_detalhes: JogoDetalhes;
  status: StatusJogo;
  horas_jogadas: number;
  adicionado_em: string;
  atualizado_em: string;
};

export type ApiErrorBody = Record<string, string | string[] | Record<string, string[]>>;
