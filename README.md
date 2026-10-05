# Feliz Dia das Mães ❤️

Uma aventura 2D top-down feita em **Phaser 3** como presente de Dia das Mães.
O jogador atravessa um mapa com cinco regiões, resolve três puzzles, abre um baú
no porto e chega numa carta.

Sem build, sem npm, sem dependências instaladas: é só HTML + CSS + JS clássico
carregado por tags `<script>`, pronto para publicar no **GitHub Pages**.

---

## Como rodar

Por usar `<script>` com caminhos relativos, o jogo precisa ser servido por HTTP
(abrir o `index.html` direto com `file://` não funciona).

```bash
# qualquer servidor estático serve
python3 -m http.server 8000
# ou
npx serve .
```

Depois abra <http://localhost:8000>.

**Publicar no GitHub Pages:** Settings → Pages → Source: `main` / `/ (root)`.

---

## Controles

| Ação              | Celular                    | Desktop                    |
| ----------------- | -------------------------- | -------------------------- |
| Mover             | Joystick virtual (esquerda) | Setas ou `W` `A` `S` `D`  |
| Interagir / avançar diálogo | Botão **A** (direita) | `Espaço` ou `Enter`       |
| Silenciar         | 🔊 no menu                  | 🔊 no menu                 |

---

## Fluxo do jogo

```
BootScene ──► MenuScene ──► HouseScene ──► WorldScene
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
              Puzzle1Scene            Puzzle2Scene            Puzzle3Scene
              Quiz da Floresta        Caça aos corações       Monte A-M-O-R
              🗺️ Pedaço de mapa       🔑 Chave                🧭 Bússola
                    └───────────────────────┼───────────────────────┘
                                            ▼
                                    Baú no Porto
                                            ▼
                            EndScene (4 atos + a carta)
                                            ▼
                        WorldScene (piada do Vizinho Zé)
                                            ▼
                                     CreditsScene ──► MenuScene
```

O progresso fica em `Game.State` (`js/state.js`), recriado a cada nova partida.
O baú só abre com **a chave e a bússola** juntas.

### Os três puzzles

| Cena             | Região    | Mecânica                                              | Recompensa        |
| ---------------- | --------- | ----------------------------------------------------- | ----------------- |
| `Puzzle1Scene`   | Floresta  | Quiz de 3 perguntas; precisa de 2 acertos              | 🗺️ Pedaço de mapa |
| `Puzzle2Scene`   | Montanha  | Achar 3 corações escondidos em 60 s                    | 🔑 Chave          |
| `Puzzle3Scene`   | Praia     | Trocar peças até formar **A-M-O-R**                    | 🧭 Bússola        |

---

## Estrutura do código

```
index.html              Ordem de carga dos scripts
style.css               Página preta + canvas pixelado
js/
  config.js             Game.CONFIG — dimensões, velocidade, paleta, chaves de cena
  state.js              Game.State  — progresso do jogador
  systems/
    audio.js            Game.Audio    — música e SFX gerados por Web Audio
    controls.js         Game.Controls — joystick + botão A + teclado
    dialog.js           Game.Dialog   — caixa de diálogo sequencial
    player.js           Game.Player   — sprite, movimento e animações
    hud.js              Game.Hud      — barra fixa no topo
  scenes/
    BootScene.js        Carrega assets e cria as animações
    MenuScene.js        Tela inicial
    HouseScene.js       Casa do Mattheus (ponto de partida)
    WorldScene.js       Mapa principal, NPCs e baú
    Puzzle1Scene.js     Quiz
    Puzzle2Scene.js     Caça aos corações
    Puzzle3Scene.js     Puzzle do AMOR
    EndScene.js         Cutscene final e a carta
    CreditsScene.js     Créditos
assets/images/          Artes
```

**Por que não ES modules?** De propósito — arquivos clássicos funcionam direto no
GitHub Pages sem servidor com MIME type configurado. A ordem dos `<script>` no
`index.html` importa: cada arquivo usa globais definidos pelos anteriores.

---

## Personalizando

**A carta** está em `js/scenes/EndScene.js`, na constante `EndScene.LETTER_TEXT`.

**As perguntas do quiz** estão em `js/scenes/Puzzle1Scene.js`, no array
`this.questions` (cada item tem `q`, `options` e o índice `correct`).

**A música** é gerada por código em `js/systems/audio.js` — o projeto não tem
nenhum arquivo de áudio para baixar. A melodia está no array `MELODY` e os
acordes em `PADS`, ambos no formato `[nota, duração em tempos]`.

Para usar uma gravação no lugar:

1. Coloque o arquivo em `assets/audio/`.
2. Carregue no `BootScene`: `this.load.audio('music', 'assets/audio/sua-musica.mp3');`
3. No `MenuScene`, troque `Game.Audio.playMusic()` por `this.sound.play('music', { loop: true })`.

**Artes não usadas:** `assets/images/npc.png`, `background.png` e `tileset.png`
ficam no repositório para uso futuro, mas **não são carregadas** — o cenário é
todo desenhado por código com `Phaser.Graphics`. São ~7 MB a menos por partida.
Para usá-las, adicione o `this.load.image(...)` correspondente no `BootScene`.

---

## Testes

O jogo é validado por um teste que **joga a partida inteira** num DOM simulado
com o Phaser real em modo Canvas: menu → casa → mundo → os três puzzles → baú →
cutscene → créditos, checando cada transição de cena, o estado global, os
controles de teclado, o áudio e a lista de arquivos baixados.

O harness fica fora do repositório (em `gamecheck/`, ignorado pelo `.gitignore`)
porque precisa de `phaser` e `jsdom` via npm.
