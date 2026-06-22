# Checkpoint Frontend

Frontend do Trabalho 2 desenvolvido por **Alexandre e Nathan**. O Checkpoint é uma central gamer para pesquisar jogos, montar uma jornada pessoal, registrar progresso e desbloquear conquistas.

O projeto é uma SPA separada do backend, feita somente com HTML, CSS e TypeScript, usando Vite como ferramenta de desenvolvimento e build.

## Tecnologias

- HTML5 semântico
- CSS3 responsivo
- TypeScript
- Vite
- API REST com autenticação JWT

## Instalação e execução

Requisitos: Node.js 18 ou superior e o backend `checkpoint-api` em execução.

```bash
npm install
cp .env.example .env
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173). Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Configuração

A URL do backend é lida da variável abaixo. Sem um arquivo `.env`, o fallback é `http://localhost:8000`.

```env
VITE_API_BASE_URL=http://localhost:8000
```

O backend precisa permitir a origem do frontend no CORS (`http://localhost:5173` durante o desenvolvimento).

## Como usar

1. Crie uma conta em `#/registro` e faça login em `#/login`.
2. Em **Perfil**, edite sua bio e informe uma URL pública para a foto.
3. Use **Trocar senha** dentro do perfil para atualizar sua credencial.
4. Em **Minha Jornada**, pesquise no catálogo, adicione jogos e edite status ou horas jogadas.
5. Exclua um jogo pelo botão `×` do card, confirmando a ação.
6. Acesse **Conquistas** para ver feitos calculados a partir da sua própria jornada.
7. Use **Sair** na navegação para remover os tokens locais.

As páginas privadas redirecionam visitantes ao login. Caso o access token expire, o frontend tenta renová-lo uma vez com o refresh token.

## Rotas do frontend

| Rota | Tela | Acesso |
|---|---|---|
| `#/` | Home | Público |
| `#/login` | Login | Público |
| `#/registro` | Registro | Público |
| `#/jornada` | Busca e CRUD da jornada | Autenticado |
| `#/perfil` | Perfil do jogador | Autenticado |
| `#/trocar-senha` | Gerência de senha | Autenticado |
| `#/conquistas` | Conquistas pessoais | Autenticado |

## API utilizada

- `POST /api/token/`
- `POST /api/token/refresh/`
- `POST /api/usuarios/registrar/`
- `GET /api/usuarios/perfil/`
- `PATCH /api/usuarios/perfil/atualizar/`
- `POST /api/usuarios/trocar-senha/`
- `GET /api/jogos/busca/?q=...`
- `GET` e `POST /api/jogos/jornada/`
- `PATCH` e `DELETE /api/jogos/jornada/{id}/`

Backend do projeto: [checkpoint-api](../checkpoint-api)  
Swagger local: [http://localhost:8000/swagger/](http://localhost:8000/swagger/)

## Telas

> Antes da entrega, substitua os espaços abaixo por capturas reais da aplicação rodando com a API.

### Home

_Inserir captura da home aqui._

### Minha Jornada

_Inserir captura do CRUD da jornada aqui._

### Perfil e Conquistas

_Inserir ao menos uma captura do perfil ou das conquistas aqui._

## Relato do desenvolvimento

Foi construída uma aplicação de página única com identidade gamer/cyberpunk, navegação por hash, comunicação centralizada com a API e tipos para todos os contratos principais. A jornada implementa o CRUD completo. Perfil, troca de senha e conquistas respondem ao usuário autenticado, garantindo visões pessoais por meio do JWT.

### O que funcionou

- Registro, login, logout, persistência e renovação de JWT.
- Proteção das páginas privadas.
- Leitura e atualização do perfil e troca autenticada de senha.
- Busca externa por meio do backend e CRUD completo da jornada.
- Conquistas derivadas da quantidade, horas e status dos jogos do usuário.
- Layout responsivo com mensagens de sucesso e erro integradas ao tema.

### O que não funcionou ou depende de configuração

- Recuperação de senha por e-mail não foi implementada porque a API não oferece esse endpoint.
- As buscas dependem da chave e da disponibilidade da RAWG configuradas no backend.
- URLs de foto inválidas ou indisponíveis não conseguem exibir a imagem.
- As capturas de tela acima devem ser adicionadas após executar frontend e backend com dados reais.
