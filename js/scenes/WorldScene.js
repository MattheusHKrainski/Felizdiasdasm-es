// js/scenes/WorldScene.js
// Mapa principal, com cinco áreas de norte a sul:
// Cidade → Floresta → Montanha → Praia → Porto.
//
// Todo o cenário é desenhado por código (Phaser.Graphics), sem tilemap.
// A geração é determinística: o mapa fica igual em todas as partidas.

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.WORLD });
  }

  create() {
    const CFG = Game.CONFIG;
    this.TILE = CFG.TILE;
    this.WORLD_W = CFG.WORLD_COLS * CFG.TILE;   // 1280
    this.WORLD_H = CFG.WORLD_ROWS * CFG.TILE;   // 1760

    this.cameras.main.fadeIn(1000);
    this._seed = 20260510;   // semente fixa -> mapa sempre igual
    this._dialog = null;

    this._drawMap();

    this.player = Game.Player.create(this, 20 * this.TILE, 10 * this.TILE);

    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.6);

    this._buildNpcs();
    this._buildChest();

    this.hud = Game.Hud.create(this, Game.State.hudText());
    this.controls = Game.Controls.create(this, { onAction: () => this._interact() });

    this.physics.add.collider(this.player, this.walls);

    this._maybeShowNeighborJoke();
  }

  /** PRNG simples e determinístico (LCG), para o cenário não mudar a cada partida. */
  _random() {
    this._seed = (this._seed * 1664525 + 1013904223) >>> 0;
    return this._seed / 4294967296;
  }

  _between(min, max) {
    return min + Math.floor(this._random() * (max - min + 1));
  }

  // ════════════════════════════════════════════════
  //  CENÁRIO
  // ════════════════════════════════════════════════

  _drawMap() {
    const g = this.add.graphics().setDepth(0);
    const W = this.WORLD_W;
    const H = this.WORLD_H;
    const T = this.TILE;

    this._drawCity(g, W, H, T);
    this._drawForest(g, W, H, T);
    this._drawMountain(g, W, H);
    this._drawBeach(g, W, H);
    this._drawPort(g, W, H, T);

    this._buildWalls(W, H, T);
  }

  /** Faixa 1 — Cidade (0% a 28% da altura). */
  _drawCity(g, W, H, T) {
    g.fillStyle(0x9aab86);
    g.fillRect(0, 0, W, H * 0.28);

    // Ruas
    g.fillStyle(0x666677);
    g.fillRect(0, T * 8, W, T * 2);
    g.fillRect(T * 18, 0, T * 2, H * 0.28);

    this.buildings = [
      { x: 2, y: 1, w: 5, h: 4, roof: 0xcc4444, wall: 0xff6666, label: 'Casa 1' },
      { x: 8, y: 1, w: 5, h: 4, roof: 0x4444cc, wall: 0x6688ff, label: 'Loja' },
      { x: 22, y: 1, w: 6, h: 4, roof: 0x44aa44, wall: 0x66cc66, label: 'Prefeitura' },
      { x: 30, y: 1, w: 5, h: 4, roof: 0xcc8844, wall: 0xffaa66, label: 'Mercado' },
      { x: 2, y: 11, w: 4, h: 3, roof: 0xaa44aa, wall: 0xcc66cc, label: 'Residência' },
      { x: 8, y: 11, w: 4, h: 3, roof: 0x4488aa, wall: 0x66aacc, label: 'Escola' }
    ];

    this.buildings.forEach(b => {
      this._drawBuilding(g, b.x * T, b.y * T, b.w, b.h, b.roof, b.wall, b.label);
    });
  }

  _drawBuilding(g, x, y, w, h, roofColor, wallColor, label) {
    const T = this.TILE;

    g.fillStyle(wallColor);
    g.fillRect(x, y + T, w * T, (h - 1) * T);

    g.fillStyle(roofColor);
    g.fillRect(x, y, w * T, T);

    g.fillStyle(0x88ccff, 0.8);
    g.fillRect(x + T * 0.5, y + T * 1.3, T * 0.7, T * 0.7);
    if (w > 3) g.fillRect(x + T * 2.2, y + T * 1.3, T * 0.7, T * 0.7);

    g.fillStyle(0x553311);
    g.fillRect(x + (w / 2 - 0.3) * T, y + (h - 1.1) * T, T * 0.6, T);

    this.add.text(x + (w * T) / 2, y + T * 0.5, label, {
      fontSize: '6px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(0.5).setDepth(2);
  }

  /** Faixa 2 — Floresta (28% a 46%). Guarda a lista de árvores para as colisões. */
  _drawForest(g, W, H, T) {
    g.fillStyle(0x2d5a1b);
    g.fillRect(0, H * 0.28, W, H * 0.18);

    const cols = [2, 4, 6, 9, 12, 14, 17, 20, 23, 26, 28, 31, 33, 36, 38];
    const rows = [16, 17, 18, 19, 20, 21, 22, 23];

    // Registra quais células têm árvore para desenhar E colidir do mesmo jeito.
    this.treeCells = [];
    cols.forEach(col => {
      rows.forEach(row => {
        if ((col + row) % 3 === 0) return;   // clareiras espaçadas
        this.treeCells.push({ col, row });
        g.fillStyle(0x3a7a22);
        g.fillCircle(col * T + T / 2, row * T + T / 2, T * 0.7);
        g.fillStyle(0x5aaa32);
        g.fillCircle(col * T + T / 2 - 3, row * T + T / 2 - 3, T * 0.4);
      });
    });

    // Caminho que atravessa a floresta
    g.fillStyle(0x8b6914, 0.7);
    g.fillRect(T * 18, H * 0.28, T * 2, H * 0.18);
  }

  /** Faixa 3 — Montanha (46% a 62%). */
  _drawMountain(g, W, H) {
    g.fillStyle(0x7a6a5a);
    g.fillRect(0, H * 0.46, W, H * 0.16);

    for (let i = 0; i < 12; i++) {
      const x = this._between(0, W - 60);
      const y = H * 0.46 + this._between(10, H * 0.16 - 40);
      g.fillStyle(0x8a7a6a);
      g.fillEllipse(x, y, 60, 36);
      g.fillStyle(0xaaa090);
      g.fillEllipse(x - 6, y - 6, 30, 18);
    }

    // Pico nevado
    g.fillStyle(0xccbbaa);
    g.fillTriangle(W / 2, H * 0.46, W / 2 - 80, H * 0.62, W / 2 + 80, H * 0.62);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(W / 2, H * 0.46, W / 2 - 20, H * 0.5, W / 2 + 20, H * 0.5);
  }

  /** Faixa 4 — Praia (62% a 82%). */
  _drawBeach(g, W, H) {
    g.fillStyle(0xf0d080);
    g.fillRect(0, H * 0.62, W, H * 0.2);

    g.fillStyle(0x2277cc);
    g.fillRect(0, H * 0.73, W, H * 0.09);

    for (let i = 0; i < 8; i++) {
      g.fillStyle(0x44aaee, 0.4);
      g.fillEllipse(i * (W / 7), H * 0.735, 80, 12);
    }

    g.fillStyle(0xe8c060, 0.5);
    for (let i = 0; i < 15; i++) {
      g.fillCircle(this._between(0, W), H * 0.62 + this._between(5, H * 0.11 - 5), this._between(3, 10));
    }
  }

  /** Faixa 5 — Porto (82% a 100%). */
  _drawPort(g, W, H, T) {
    g.fillStyle(0x4a3a2a);
    g.fillRect(0, H * 0.82, W, H * 0.18);

    // Doca de madeira
    g.fillStyle(0x8b5a2b);
    g.fillRect(T * 16, H * 0.82, T * 6, H * 0.1);
    g.fillStyle(0x6b3a1b);
    for (let i = 0; i < 4; i++) {
      g.fillRect(T * (17 + i) + 8, H * 0.92, 6, T * 3);
    }

    g.fillStyle(0x114466);
    g.fillRect(0, H * 0.92, W, H * 0.08);
  }

  _buildWalls(W, H, T) {
    this.walls = this.physics.add.staticGroup();
    const addWall = (x, y, w, h) => {
      const wall = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xff0000, 0);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    };

    // Bordas do mundo
    addWall(0, 0, W, 8);
    addWall(0, H - 8, W, 8);
    addWall(0, 0, 8, H);
    addWall(W - 8, 0, 8, H);

    // Prédios
    this.buildings.forEach(b => addWall(b.x * T, b.y * T, b.w * T, b.h * T));

    // Troncos das árvores
    this.treeCells.forEach(cell => addWall(cell.col * T, cell.row * T, T, T));
  }

  // ════════════════════════════════════════════════
  //  NPCs
  // ════════════════════════════════════════════════

  _buildNpcs() {
    const T = this.TILE;
    const SCENE = Game.CONFIG.SCENE;

    /** Atalho para trocar de cena com fade. */
    const goTo = key => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(520, () => this.scene.start(key));
    };

    this.npcs = [
      {
        x: T * 14, y: T * 6,
        emoji: '👴', name: 'Vovô Antônio',
        lines: () => {
          if (Game.State.puzzle1Done) {
            return ['👴 Vovô Antônio:', '"Você conseguiu passar pela\nfloresta! Que orgulho!" 👏'];
          }
          return [
            '👴 Vovô Antônio:',
            '"Oie, criança! Perdeu algo?"',
            '"Vi uma garotinha levando\nalgo para a FLORESTA..."',
            '"Mas pra entrar lá, precisava\nresponder perguntas difíceis!"',
            '[ Vá até a Floresta ao sul\ne resolva o QUIZ! ]'
          ];
        }
      },
      {
        x: T * 6, y: T * 5,
        emoji: '👧', name: 'Amiga Bia',
        lines: [
          '👧 Bia:',
          '"Ei! Eu vi um pedaço de mapa\ncaindo lá na floresta!"',
          '"Mas tem uns guardiões lá...\nPrecisa responder perguntas!"',
          '[ Entre na Floresta e\nfaça o Quiz! ]'
        ]
      },
      {
        x: T * 19, y: T * 21,
        emoji: '🌿', name: 'Entrada da Floresta',
        lines: () => {
          if (Game.State.puzzle1Done) {
            return ['"Você já passou por aqui...\nBoa sorte na aventura!" 🌿'];
          }
          return [
            '🌿 Guarda da Floresta:',
            '"Pare! Para passar precisa\nresponder ao QUIZ!"',
            '[ Toque em A para\niniciar o Quiz ]'
          ];
        },
        action: () => {
          if (!Game.State.puzzle1Done) goTo(SCENE.PUZZLE_QUIZ);
        }
      },
      {
        x: T * 19, y: T * 30,
        emoji: '⛰️', name: 'Gruta da Montanha',
        lines: () => {
          if (!Game.State.puzzle1Done) {
            return ['"O caminho está bloqueado.\nResolva o Quiz da Floresta primeiro!"'];
          }
          if (Game.State.puzzle2Done) {
            return ['"Você já encontrou os corações!\nSiga em frente!" ❤️'];
          }
          return [
            '⛰️ Espírito da Montanha:',
            '"Encontre os 3 CORAÇÕES\nescondidos aqui pela montanha!"',
            '"Você tem ' + Game.CONFIG.HEART_HUNT_SECONDS + ' segundos..."',
            '[ Toque A para iniciar ]'
          ];
        },
        action: () => {
          if (Game.State.puzzle1Done && !Game.State.puzzle2Done) goTo(SCENE.PUZZLE_HEARTS);
        }
      },
      {
        x: T * 19, y: T * 43,
        emoji: '🏖️', name: 'Guardiã da Praia',
        lines: () => {
          if (!Game.State.puzzle2Done) {
            return ['"O caminho à praia está bloqueado!\nEncontre os corações na montanha." ⛰️'];
          }
          if (Game.State.puzzle3Done) {
            return ['"Você completou o puzzle!\nA bússola está com você!" 🧭'];
          }
          return [
            '🏖️ Guardiã da Praia:',
            '"Monte as peças do AMOR!"',
            '"Complete o puzzle\ne ganhe a bússola!" 🧭',
            '[ Toque A para iniciar ]'
          ];
        },
        action: () => {
          if (Game.State.puzzle2Done && !Game.State.puzzle3Done) goTo(SCENE.PUZZLE_LOVE);
        }
      },
      {
        x: T * 20, y: T * 50,
        emoji: '⚓', name: 'Capitão do Porto',
        lines: () => {
          if (Game.State.chestOpened) {
            return ['"Você encontrou o baú!\nFeliz Dia das Mães! ❤️"'];
          }
          if (!Game.State.canOpenChest()) {
            const missing = Game.State.missingChestItem();
            return ['"Você ainda precisa da ' + missing.label.toLowerCase() + '\n' + missing.icon + ' para abrir o baú."'];
          }
          return [
            '⚓ Capitão:',
            '"Ah, a bússola e a chave!"',
            '"Elas apontam para o baú\nno PORTO, ao leste!"',
            '"Siga até o fim do cais..." 🧭'
          ];
        }
      }
    ];

    this.npcs.forEach(npc => {
      this.add.text(npc.x, npc.y, npc.emoji, { fontSize: '22px' })
        .setOrigin(0.5).setDepth(5);
      this.add.text(npc.x, npc.y - 20, npc.name, {
        fontSize: '6px',
        color: '#ffffff',
        fontFamily: Game.CONFIG.FONT,
        backgroundColor: '#00000088',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(6);
    });
  }

  _buildChest() {
    const T = this.TILE;
    this.chestX = T * 35;
    this.chestY = T * 52;

    this.chest = this.add.image(this.chestX, this.chestY, 'chest')
      .setScale(0.025).setDepth(5);

    this.add.text(this.chestX, this.chestY - 22, '❓', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(6);
  }

  // ════════════════════════════════════════════════
  //  INTERAÇÃO
  // ════════════════════════════════════════════════

  _interact() {
    if (this._dialog) {
      this._dialog.advance();
      return;
    }

    const range = Game.CONFIG.INTERACT_RANGE;
    const px = this.player.x;
    const py = this.player.y;

    for (const npc of this.npcs) {
      if (Phaser.Math.Distance.Between(px, py, npc.x, npc.y) >= range) continue;
      Game.Audio.sfx('click');
      const lines = typeof npc.lines === 'function' ? npc.lines() : npc.lines;
      this._openDialog(lines, npc.action);
      return;
    }

    if (Phaser.Math.Distance.Between(px, py, this.chestX, this.chestY) < range) {
      this._interactWithChest();
    }
  }

  _interactWithChest() {
    if (Game.State.chestOpened) return;

    if (!Game.State.canOpenChest()) {
      const missing = Game.State.missingChestItem();
      this._openDialog(['"O baú está trancado...\nFalta a ' + missing.label.toLowerCase() + '!" ' + missing.icon]);
      return;
    }

    Game.Audio.sfx('chest');
    Game.State.chestOpened = true;
    this.hud.setText(Game.State.hudText());
    this.cameras.main.fadeOut(800);
    this.time.delayedCall(820, () => this.scene.start(Game.CONFIG.SCENE.END));
  }

  _openDialog(lines, action) {
    this._dialog = Game.Dialog.open(this, lines, () => {
      this._dialog = null;
      this.hud.setText(Game.State.hudText());
      if (action) action();
    });
  }

  /** Piada do Vizinho Zé, exibida uma única vez ao voltar do baú. */
  _maybeShowNeighborJoke() {
    if (!Game.State.chestOpened || Game.State.neighborGreeted) return;

    this.time.delayedCall(600, () => {
      this._openDialog([
        '👴 Vizinho Zé:',
        '"Parabéns, criança!"',
        '"Agora... a senhora\njá pode devolver meu fone?" 📱',
        '😂',
        '[ FIM DA AVENTURA ]\nObrigado por jogar!'
      ], () => {
        this.time.delayedCall(1000, () => this.scene.start(Game.CONFIG.SCENE.CREDITS));
      });
      Game.State.neighborGreeted = true;
    });
  }

  // ════════════════════════════════════════════════
  //  LOOP
  // ════════════════════════════════════════════════

  update() {
    if (this._dialog) {
      Game.Player.freeze(this.player);
      return;
    }

    Game.Player.move(this.player, this.controls.getDirection());
    this.hud.setText(Game.State.hudText());
  }
}
