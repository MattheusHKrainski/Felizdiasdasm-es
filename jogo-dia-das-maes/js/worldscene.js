// js/scenes/WorldScene.js
// Mapa principal com 5 áreas: Cidade, Floresta, Praia, Montanha, Porto

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'WorldScene' });
  },

  create: function () {
    var self = this;
    var TILE = 32;
    var COLS = 40;
    var ROWS = 55;
    this.WORLD_W = COLS * TILE; // 1280
    this.WORLD_H = ROWS * TILE; // 1760
    this.TILE = TILE;

    this.cameras.main.fadeIn(1000);
    this._dialogOpen = false;
    this._joystickDir = { x: 0, y: 0 };

    // ── Mapa gerado por tiles ─────────────────────
    this._buildMap();

    // ── Player ────────────────────────────────────
    var startX = 20 * TILE;
    var startY = 10 * TILE;
    this.player = this.physics.add.sprite(startX, startY, 'player_sheet', 0)
      .setScale(0.038)
      .setDepth(10)
      .setCollideWorldBounds(true);

    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    // Câmera segue o player
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.6);

    // ── NPCs e pontos de interesse ────────────────
    this._buildNPCs();

    // ── HUD ───────────────────────────────────────
    this._buildHUD();

    // ── Controles mobile (joystick virtual) ───────
    this._buildMobileControls();

    // ── Colisões ──────────────────────────────────
    this.physics.add.collider(this.player, this.wallGroup);

    // Ao retornar do EndScene
    if (window.GAME_STATE.chestOpened && !window.GAME_STATE.npcGreeted) {
      this.time.delayedCall(600, function () {
        self._showDialog([
          '👴 Vizinho Zé:',
          '"Parabéns, criança!"',
          '"Agora... a senhora\njá pode devolver meu fone?" 📱',
          '😂',
          '[ FIM DA AVENTURA ]\nObrigado por jogar!'
        ], function () {
          self.time.delayedCall(1000, function () {
            self.scene.start('CreditsScene');
          });
        });
        window.GAME_STATE.npcGreeted = true;
      });
    }
  },

  // ─── Mapa por retângulos coloridos ─────────────
  _buildMap: function () {
    var g = this.add.graphics().setDepth(0);
    var W = this.WORLD_W;
    var H = this.WORLD_H;
    var T = this.TILE;

    // ── ÁREA 1: CIDADE (topo) ──────────────────────
    // Chão cinza calçada
    g.fillStyle(0x9aab86);
    g.fillRect(0, 0, W, H * 0.28);
    // Ruas
    g.fillStyle(0x666677);
    g.fillRect(0, T * 8, W, T * 2);   // rua horizontal
    g.fillRect(T * 18, 0, T * 2, H * 0.28); // rua vertical

    // Casas (blocos coloridos estilo Pokémon)
    this._drawBuilding(g, T*2,  T*1,  5, 4, 0xcc4444, 0xff6666, 'Casa 1');
    this._drawBuilding(g, T*8,  T*1,  5, 4, 0x4444cc, 0x6688ff, 'Loja');
    this._drawBuilding(g, T*22, T*1,  6, 4, 0x44aa44, 0x66cc66, 'Prefeitura');
    this._drawBuilding(g, T*30, T*1,  5, 4, 0xcc8844, 0xffaa66, 'Mercado');
    this._drawBuilding(g, T*2,  T*11, 4, 3, 0xaa44aa, 0xcc66cc, 'Residência');
    this._drawBuilding(g, T*8,  T*11, 4, 3, 0x4488aa, 0x66aacc, 'Escola');

    // ── ÁREA 2: FLORESTA (meio-superior) ───────────
    g.fillStyle(0x2d5a1b);
    g.fillRect(0, H * 0.28, W, H * 0.18);
    // Árvores (círculos verdes)
    var treeCols = [2,4,6,9,12,14,17,20,23,26,28,31,33,36,38];
    var treeRows = [16,17,18,19,20,21,22,23];
    var self = this;
    treeCols.forEach(function(c) {
      treeRows.forEach(function(r) {
        if (Math.random() > 0.3) {
          g.fillStyle(Phaser.Math.Between(0) ? 0x3a7a22 : 0x2d6018);
          g.fillStyle(0x3a7a22);
          g.fillCircle(c * T + T/2, r * T + T/2, T * 0.7);
          g.fillStyle(0x5aaa32);
          g.fillCircle(c * T + T/2 - 3, r * T + T/2 - 3, T * 0.4);
        }
      });
    });
    // Caminho na floresta
    g.fillStyle(0x8B6914, 0.7);
    g.fillRect(T * 18, H * 0.28, T * 2, H * 0.18);

    // ── ÁREA 3: MONTANHA (meio) ────────────────────
    g.fillStyle(0x7a6a5a);
    g.fillRect(0, H * 0.46, W, H * 0.16);
    // Pedras
    for (var mx = 0; mx < 12; mx++) {
      var mxp = Phaser.Math.Between(0, W - 60);
      var myp = H * 0.46 + Phaser.Math.Between(10, H * 0.16 - 40);
      g.fillStyle(0x8a7a6a);
      g.fillEllipse(mxp, myp, 60, 36);
      g.fillStyle(0xaaa090);
      g.fillEllipse(mxp - 6, myp - 6, 30, 18);
    }
    // Pico
    g.fillStyle(0xccbbaa);
    g.fillTriangle(W/2, H*0.46, W/2 - 80, H*0.62, W/2 + 80, H*0.62);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(W/2, H*0.46, W/2 - 20, H*0.5, W/2 + 20, H*0.5);

    // ── ÁREA 4: PRAIA (baixo-centro) ───────────────
    g.fillStyle(0xf0d080);
    g.fillRect(0, H * 0.62, W, H * 0.2);
    // Mar
    g.fillStyle(0x2277cc);
    g.fillRect(0, H * 0.73, W, H * 0.09);
    // Ondas
    for (var wi = 0; wi < 8; wi++) {
      g.fillStyle(0x44aaee, 0.4);
      g.fillEllipse(wi * (W/7), H * 0.735, 80, 12);
    }
    // Areia detalhes
    g.fillStyle(0xe8c060, 0.5);
    for (var si = 0; si < 15; si++) {
      g.fillCircle(
        Phaser.Math.Between(0, W),
        H * 0.62 + Phaser.Math.Between(5, H * 0.11 - 5),
        Phaser.Math.Between(3, 10)
      );
    }

    // ── ÁREA 5: PORTO (base) ───────────────────────
    g.fillStyle(0x4a3a2a);
    g.fillRect(0, H * 0.82, W, H * 0.18);
    // Doca de madeira
    g.fillStyle(0x8B5A2B);
    g.fillRect(T * 16, H * 0.82, T * 6, H * 0.1);
    g.fillStyle(0x6B3A1B);
    for (var di = 0; di < 4; di++) {
      g.fillRect(T * (17 + di) + 8, H * 0.92, 6, T * 3);
    }
    // Mar do porto
    g.fillStyle(0x114466);
    g.fillRect(0, H * 0.92, W, H * 0.08);

    // ── Paredes invisíveis ─────────────────────────
    this.wallGroup = this.physics.add.staticGroup();
    var addW = function(x, y, w, h) {
      var wall = self.add.rectangle(x + w/2, y + h/2, w, h, 0xff0000, 0);
      self.physics.add.existing(wall, true);
      self.wallGroup.add(wall);
    };

    // Bordas do mundo
    addW(0, 0, W, 8);
    addW(0, H - 8, W, 8);
    addW(0, 0, 8, H);
    addW(W - 8, 0, 8, H);

    // Bloqueio das casas
    [[T*2, T*1, T*5, T*4], [T*8, T*1, T*5, T*4],
     [T*22, T*1, T*6, T*4], [T*30, T*1, T*5, T*4],
     [T*2, T*11, T*4, T*3], [T*8, T*11, T*4, T*3]
    ].forEach(function(b) { addW(b[0], b[1], b[2], b[3]); });

    // Árvores bloqueiam passagem
    treeCols.forEach(function(c) {
      if (c !== 18 && c !== 19) {
        addW(c * T, T * 16, T, T * 8);
      }
    });
  },

  _drawBuilding: function(g, x, y, w, h, colorRoof, colorWall, label) {
    var T = this.TILE;
    // Parede
    g.fillStyle(colorWall);
    g.fillRect(x, y + T, w * T, (h - 1) * T);
    // Telhado
    g.fillStyle(colorRoof);
    g.fillRect(x, y, w * T, T);
    // Janelas
    g.fillStyle(0x88ccff, 0.8);
    g.fillRect(x + T * 0.5, y + T * 1.3, T * 0.7, T * 0.7);
    if (w > 3) g.fillRect(x + T * 2.2, y + T * 1.3, T * 0.7, T * 0.7);
    // Porta
    g.fillStyle(0x553311);
    g.fillRect(x + (w/2 - 0.3) * T, y + (h - 1.1) * T, T * 0.6, T * 1.0);
    // Label
    this.add.text(x + (w * T) / 2, y + T * 0.5, label, {
      fontSize: '6px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(2);
  },

  // ─── NPCs e pontos de interesse ─────────────────
  _buildNPCs: function () {
    var T = this.TILE;
    var self = this;
    this._npcs = [];

    var npcData = [
      // [x, y, emoji, nome, diálogos, ação]
      {
        x: T*14, y: T*6,
        emoji: '👴', name: 'Vovô Antônio',
        dialogs: [
          '👴 Vovô Antônio:',
          '"Oie, criança! Perdeu algo?"',
          '"Vi uma garotinha levando\nalgo para a FLORESTA..."',
          '"Mas pra entrar lá, precisava\nresponder perguntas difíceis!"',
          '[ Vá até a Floresta ao sul\ne resolva o QUIZ! ]'
        ],
        action: null,
        requireState: null,
        setVisibleIfState: null
      },
      {
        x: T*6, y: T*5,
        emoji: '👧', name: 'Amiga Bia',
        dialogs: [
          '👧 Bia:',
          '"Ei! Eu vi um pedaço de mapa\ncaindo lá na floresta!"',
          '"Mas tem uns guardiões lá...\nPrecisa responder perguntas!"',
          '[ Entre na Floresta e\nfaça o Quiz! ]'
        ],
        action: null,
        requireState: null
      },
      {
        x: T*19, y: T*21, // Entrada puzzle 1 (floresta)
        emoji: '🌿', name: 'Entrada da Floresta',
        dialogs: function() {
          if (window.GAME_STATE.puzzle1Done) {
            return ['"Você já passou por aqui...\nBoa sorte na aventura!" 🌿'];
          }
          return [
            '🌿 Guarda da Floresta:',
            '"Pare! Para passar precisa\nresponder ao QUIZ!"',
            '[ Toque em A para\niniciar o Quiz ]'
          ];
        },
        action: function() {
          if (!window.GAME_STATE.puzzle1Done) {
            self.cameras.main.fadeOut(500);
            self.time.delayedCall(520, function() {
              self.scene.start('Puzzle1Scene');
            });
          }
        }
      },
      {
        x: T*19, y: T*30, // Entrada puzzle 2 (montanha)
        emoji: '⛰️', name: 'Gruta da Montanha',
        dialogs: function() {
          if (!window.GAME_STATE.puzzle1Done) {
            return ['"O caminho está bloqueado.\nResolva o Quiz da Floresta primeiro!"'];
          }
          if (window.GAME_STATE.puzzle2Done) {
            return ['"Você já encontrou os corações!\nSiga em frente!" ❤️'];
          }
          return [
            '⛰️ Espírito da Montanha:',
            '"Encontre os 3 CORAÇÕES\nescondidos aqui pela montanha!"',
            '"Você tem 60 segundos..."',
            '[ Toque A para iniciar ]'
          ];
        },
        action: function() {
          if (window.GAME_STATE.puzzle1Done && !window.GAME_STATE.puzzle2Done) {
            self.cameras.main.fadeOut(500);
            self.time.delayedCall(520, function() {
              self.scene.start('Puzzle2Scene');
            });
          }
        }
      },
      {
        x: T*19, y: T*43, // Puzzle 3 (praia)
        emoji: '🏖️', name: 'Guardiã da Praia',
        dialogs: function() {
          if (!window.GAME_STATE.puzzle2Done) {
            return ['"O caminho à praia está bloqueado!\nEncontre os corações na montanha." ⛰️'];
          }
          if (window.GAME_STATE.puzzle3Done) {
            return ['"Você completou o puzzle!\nA bússola está com você!" 🧭'];
          }
          return [
            '🏖️ Guardiã da Praia:',
            '"Monte as peças do AMOR!"',
            '"Complete o puzzle\ne ganhe a bússola!" 🧭',
            '[ Toque A para iniciar ]'
          ];
        },
        action: function() {
          if (window.GAME_STATE.puzzle2Done && !window.GAME_STATE.puzzle3Done) {
            self.cameras.main.fadeOut(500);
            self.time.delayedCall(520, function() {
              self.scene.start('Puzzle3Scene');
            });
          }
        }
      },
      {
        x: T*20, y: T*50, // Porto — NPC com bússola
        emoji: '⚓', name: 'Capitão do Porto',
        dialogs: function() {
          if (!window.GAME_STATE.puzzle3Done) {
            return ['"Hmm... você ainda não tem\na bússola da Guardiã da Praia."'];
          }
          if (window.GAME_STATE.chestOpened) {
            return ['"Você encontrou o baú!\nFeliz Dia das Mães! ❤️"'];
          }
          return [
            '⚓ Capitão:',
            '"Ah, a bússola!"',
            '"Ela aponta para o baú\nno PORTO, ao leste!"',
            '"Siga até o fim do cais..." 🧭',
            '[ O baú está em T*35, T*52 ]'
          ];
        },
        action: null
      }
    ];

    npcData.forEach(function(data) {
      var npcSprite = self.add.text(data.x, data.y, data.emoji, {
        fontSize: '22px'
      }).setOrigin(0.5).setDepth(5);

      self.add.text(data.x, data.y - 20, data.name, {
        fontSize: '6px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#00000088',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(6);

      self._npcs.push({ sprite: npcSprite, data: data });
    });

    // Baú final
    this._chest = this.add.image(T * 35, T * 52, 'chest')
      .setScale(0.025)
      .setDepth(5);
    // Remove fundo preto com blendMode
    // (o preto some em ADD — mas pode clarear demais; ajuste se necessário)

    this.add.text(T * 35, T * 52 - 22, '❓', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(6)
      .setName('chestHint');
  },

  // ─── HUD ────────────────────────────────────────
  _buildHUD: function () {
    var W = this.scale.width;
    this._hudBg = this.add.rectangle(W / 2, 22, W, 44, 0x000022, 0.75)
      .setScrollFactor(0).setDepth(50);

    this._hudText = this.add.text(10, 8, this._getHUDText(), {
      fontSize: '10px',
      color: '#ffddee',
      fontFamily: 'monospace',
      wordWrap: { width: W - 20 }
    }).setScrollFactor(0).setDepth(51);
  },

  _getHUDText: function () {
    var s = window.GAME_STATE;
    var items = [];
    if (s.hasMapPiece)  items.push('🗺️Mapa');
    if (s.hasKey)       items.push('🔑Chave');
    if (s.hasCompass)   items.push('🧭Bússola');
    if (s.chestOpened)  items.push('📦Baú✓');
    return items.length ? 'Itens: ' + items.join('  ') : '[ Converse com os NPCs! ]';
  },

  // ─── Controles mobile ───────────────────────────
  _buildMobileControls: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    // Joystick virtual (lado esquerdo)
    var joyBase = this.add.circle(70, H - 80, 40, 0x333355, 0.5)
      .setScrollFactor(0).setDepth(60).setInteractive();
    var joyStick = this.add.circle(70, H - 80, 18, 0x8888cc, 0.8)
      .setScrollFactor(0).setDepth(61);

    var joyActive = false;
    var joyOrigin = { x: 70, y: H - 80 };

    joyBase.on('pointerdown', function(ptr) {
      joyActive = true;
    });
    this.input.on('pointermove', function(ptr) {
      if (!joyActive) return;
      var dx = ptr.x - joyOrigin.x;
      var dy = ptr.y - joyOrigin.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var maxDist = 36;
      if (dist > maxDist) { dx = dx/dist*maxDist; dy = dy/dist*maxDist; }
      joyStick.setPosition(joyOrigin.x + dx, joyOrigin.y + dy);
      var norm = dist > 8 ? Math.sqrt(dx*dx + dy*dy) : 0;
      self._joystickDir = norm > 0 ? { x: dx/norm, y: dy/norm } : { x: 0, y: 0 };
    });
    this.input.on('pointerup', function() {
      joyActive = false;
      joyStick.setPosition(joyOrigin.x, joyOrigin.y);
      self._joystickDir = { x: 0, y: 0 };
    });

    // Botão A (interagir)
    var btnA = this.add.text(W - 30, H - 30, ' A ', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#cc2244',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(60).setInteractive({ useHandCursor: true });

    btnA.on('pointerdown', function() {
      if (self._dialogOpen) {
        self._advanceDialog();
      } else {
        self._tryInteract();
      }
    });
  },

  // ─── Interação com NPC ──────────────────────────
  _tryInteract: function () {
    var RANGE = 60;
    var px = this.player.x;
    var py = this.player.y;
    var self = this;

    // Verifica NPCs
    for (var i = 0; i < this._npcs.length; i++) {
      var npc = this._npcs[i];
      var dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
      if (dist < RANGE) {
        var lines = typeof npc.data.dialogs === 'function'
          ? npc.data.dialogs() : npc.data.dialogs;
        self._showDialog(lines, npc.data.action ? npc.data.action.bind(self) : null);
        return;
      }
    }

    // Verifica baú
    if (this._chest) {
      var distChest = Phaser.Math.Distance.Between(px, py, this._chest.x, this._chest.y);
      if (distChest < 60) {
        if (!window.GAME_STATE.puzzle3Done) {
          self._showDialog(['"O baú está trancado...\nPreciso de uma bússola!" 🔒'], null);
        } else if (!window.GAME_STATE.chestOpened) {
          window.GAME_STATE.chestOpened = true;
          self.cameras.main.fadeOut(800);
          self.time.delayedCall(820, function() {
            self.scene.start('EndScene');
          });
        }
      }
    }
  },

  // ─── Sistema de diálogo ─────────────────────────
  _showDialog: function(lines, onClose) {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._dialogOpen  = true;
    this._dialogLines = lines;
    this._dialogStep  = 0;
    this._dialogOnClose = onClose || null;

    if (this._dialogBox) this._dialogBox.destroy();
    this._dialogBox = this.add.container(0, 0).setScrollFactor(0).setDepth(80);

    var bg = this.add.rectangle(W / 2, H - 80, W - 16, 140, 0x000033, 0.93)
      .setStrokeStyle(2, 0xff88aa);
    var txt = this.add.text(16, H - 145, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: W - 36 },
      lineSpacing: 3
    });
    var arrow = this.add.text(W - 24, H - 20, '▼', {
      fontSize: '11px', color: '#ff88aa', fontFamily: 'monospace'
    });
    this.tweens.add({ targets: arrow, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });

    this._dialogBox.add([bg, txt, arrow]);
    this._dialogTxt = txt;
    this._advanceDialog();
  },

  _advanceDialog: function() {
    if (!this._dialogLines) return;
    if (this._dialogStep >= this._dialogLines.length) {
      this._closeDialog();
      return;
    }
    this._dialogTxt.setText(this._dialogLines[this._dialogStep]);
    this._dialogStep++;
  },

  _closeDialog: function() {
    this._dialogOpen = false;
    if (this._dialogBox) { this._dialogBox.destroy(); this._dialogBox = null; }
    if (this._dialogLines) this._dialogLines = null;
    var cb = this._dialogOnClose;
    this._dialogOnClose = null;
    if (cb) cb();
    if (this._hudText) this._hudText.setText(this._getHUDText());
  },

  // ─── Update ─────────────────────────────────────
  update: function () {
    if (this._dialogOpen) {
      this.player.setVelocity(0);
      this.player.anims.pause();
      return;
    }

    var speed = 100;
    var dx = this._joystickDir.x;
    var dy = this._joystickDir.y;

    // Normaliza diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.player.setVelocity(dx * speed, dy * speed);

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.anims.play('walk_side', true);
        this.player.setFlipX(dx < 0);
      } else if (dy > 0.1) {
        this.player.anims.play('walk_down', true);
      } else {
        this.player.anims.play('walk_up', true);
      }
    } else {
      this.player.anims.stop();
      this.player.setFrame(0);
    }

    // Atualiza HUD
    if (this._hudText) this._hudText.setText(this._getHUDText());
  }
});