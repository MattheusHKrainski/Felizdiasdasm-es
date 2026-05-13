// js/scenes/Puzzle3Scene.js
// PUZZLE 3 — Sliding puzzle: monte a palavra A-M-O-R

var Puzzle3Scene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'Puzzle3Scene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#0a1a2a');
    this.cameras.main.fadeIn(800);

    this._solved = false;

    // ── Fundo praia ──────────────────────────────
    var g = this.add.graphics();
    g.fillStyle(0x0a2a4a);
    g.fillRect(0, 0, W, H * 0.5);
    g.fillStyle(0xd4a832);
    g.fillRect(0, H * 0.5, W, H * 0.5);
    // Ondas
    for (var i = 0; i < 5; i++) {
      g.fillStyle(0x1a6aaa, 0.3);
      g.fillEllipse(i * (W/4), H * 0.52, 100, 18);
    }

    // Título
    this.add.text(W/2, 24, '🏖️ PUZZLE DO AMOR', {
      fontSize: '18px',
      color: '#88ccff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#002244',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W/2, 52, 'Monte a palavra  A - M - O - R\narrastando as peças!', {
      fontSize: '12px',
      color: '#aaddff',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // ── Grade do puzzle 2×2 ───────────────────────
    // Posição correta: [A, M, O, R] → [0,1,2,3]
    // Estado embaralhado
    this._LETTERS = ['A', 'M', 'O', 'R'];
    this._COLORS  = [0xcc2244, 0x2244cc, 0x228822, 0xcc8800];

    var TSIZE = 76;
    var GAP   = 10;
    var gridX = W / 2 - (TSIZE + GAP);
    var gridY = H * 0.32;

    // Posições das células [col, row]
    this._cells = [
      { x: gridX,           y: gridY },
      { x: gridX + TSIZE + GAP, y: gridY },
      { x: gridX,           y: gridY + TSIZE + GAP },
      { x: gridX + TSIZE + GAP, y: gridY + TSIZE + GAP }
    ];

    // Embaralha: garante que não está na ordem certa
    this._order = [2, 3, 0, 1]; // embaralhado inicial

    this._tiles = [];
    this._selectedIdx = null;

    this._buildTiles();

    // Slots (onde encaixar)
    this.add.text(W/2, H*0.68, '[ Posição correta: A  M  O  R ]', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Indicador
    this._statusText = this.add.text(W/2, H*0.75, 'Toque numa peça, depois\nno lugar onde quer colocar!', {
      fontSize: '12px',
      color: '#ccccff',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // Botão de dica
    var hint = this.add.text(W/2, H*0.88, '💡 DICA', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#334455',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    hint.on('pointerdown', function() {
      self._statusText.setText(
        'Dica: A ordem certa é\nA (canto sup-esq)\nM (canto sup-dir)\nO (canto inf-esq)\nR (canto inf-dir)'
      );
    });
  },

  _buildTiles: function() {
    // Destrói tiles anteriores
    this._tiles.forEach(function(t) {
      if (t.bg) t.bg.destroy();
      if (t.txt) t.txt.destroy();
    });
    this._tiles = [];
    this._selectedIdx = null;

    var self = this;
    var TSIZE = 76;

    for (var i = 0; i < 4; i++) {
      var letterIdx = this._order[i];
      var cell = this._cells[i];

      var bg = this.add.rectangle(cell.x + TSIZE/2, cell.y + TSIZE/2,
        TSIZE, TSIZE, this._COLORS[letterIdx])
        .setStrokeStyle(3, 0xffffff)
        .setDepth(10)
        .setInteractive({ useHandCursor: true });

      var txt = this.add.text(cell.x + TSIZE/2, cell.y + TSIZE/2,
        this._LETTERS[letterIdx], {
          fontSize: '42px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          stroke: '#00000066',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);

      (function(tileIndex, bgRect, txtObj) {
        bgRect.on('pointerdown', function() {
          self._selectTile(tileIndex, bgRect, txtObj);
        });
      })(i, bg, txt);

      this._tiles.push({ bg: bg, txt: txt, letterIdx: letterIdx, cellIdx: i });
    }
  },

  _selectTile: function(index, bg, txt) {
    if (this._solved) return;

    if (this._selectedIdx === null) {
      // Primeira seleção
      this._selectedIdx = index;
      bg.setStrokeStyle(4, 0xffff00);
      this._statusText.setText('✅ Peça "' + this._LETTERS[this._order[index]] + '" selecionada!\nAgora toque onde colocar.');
    } else if (this._selectedIdx === index) {
      // Deseleciona
      bg.setStrokeStyle(3, 0xffffff);
      this._selectedIdx = null;
      this._statusText.setText('Toque numa peça para selecioná-la!');
    } else {
      // Swap
      var fromIdx = this._selectedIdx;
      var toIdx   = index;

      // Swap na ordem
      var temp = this._order[fromIdx];
      this._order[fromIdx] = this._order[toIdx];
      this._order[toIdx]   = temp;

      // Anima o swap
      this._animSwap(fromIdx, toIdx);
    }
  },

  _animSwap: function(from, to) {
    var self = this;
    var tileFrom = this._tiles[from];
    var tileTo   = this._tiles[to];
    var cellFrom = this._cells[from];
    var cellTo   = this._cells[to];
    var TSIZE    = 76;

    var midX = (cellFrom.x + cellTo.x) / 2 + TSIZE / 2;
    var midY = (cellFrom.y + cellTo.y) / 2 + TSIZE / 2;

    this.tweens.add({
      targets: [tileFrom.bg, tileFrom.txt],
      x: cellTo.x + TSIZE/2,
      y: cellTo.y + TSIZE/2,
      duration: 200,
      ease: 'Power2'
    });
    this.tweens.add({
      targets: [tileTo.bg, tileTo.txt],
      x: cellFrom.x + TSIZE/2,
      y: cellFrom.y + TSIZE/2,
      duration: 200,
      ease: 'Power2',
      onComplete: function() {
        self._selectedIdx = null;
        self._buildTiles();
        self._checkSolved();
      }
    });
  },

  _checkSolved: function() {
    // Verifica se ordem é [0,1,2,3] = A,M,O,R
    var correct = (
      this._order[0] === 0 &&
      this._order[1] === 1 &&
      this._order[2] === 2 &&
      this._order[3] === 3
    );

    if (correct) {
      this._solved = true;
      this._celebrate();
    }
  },

  _celebrate: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    window.GAME_STATE.puzzle3Done = true;
    window.GAME_STATE.hasCompass  = true;

    // Flash e shake
    this.cameras.main.flash(600, 200, 200, 255);
    this.cameras.main.shake(400, 0.012);

    // Corações
    for (var i = 0; i < 10; i++) {
      var hx = Phaser.Math.Between(20, W - 20);
      var hy = Phaser.Math.Between(H*0.3, H*0.7);
      this.add.text(hx, hy, '❤️', { fontSize: Phaser.Math.Between(16, 32) + 'px' })
        .setDepth(90);
    }

    this.time.delayedCall(800, function() {
      // Overlay vitória
      self.add.rectangle(W/2, H/2, W, H, 0x000033, 0.9).setDepth(100);

      self.add.text(W/2, H*0.22, '🧭 PUZZLE COMPLETO!', {
        fontSize: '22px',
        color: '#88ccff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      }).setDepth(101).setOrigin(0.5);

      self.add.text(W/2, H*0.36,
        'Você montou a palavra AMOR! 💕\n\nA Guardiã fica emocionada\ne te entrega a BÚSSOLA!', {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center'
        }).setDepth(101).setOrigin(0.5);

      self.add.text(W/2, H*0.58, '🧭', { fontSize: '64px' })
        .setDepth(101).setOrigin(0.5);

      self.add.text(W/2, H*0.7, '"Vá ao Porto e fale\ncom o Capitão!" ⚓', {
        fontSize: '14px',
        color: '#aaddff',
        fontFamily: 'monospace',
        align: 'center'
      }).setDepth(101).setOrigin(0.5);

      var btn = self.add.text(W/2, H*0.86, ' IR AO PORTO ▶ ', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#114488',
        padding: { x: 16, y: 8 }
      }).setDepth(101).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', function() {
        self.cameras.main.fadeOut(600);
        self.time.delayedCall(620, function() {
          self.scene.start('WorldScene');
        });
      });
    });
  }
});