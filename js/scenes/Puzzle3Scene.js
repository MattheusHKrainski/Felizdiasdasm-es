// js/scenes/Puzzle3Scene.js
// PUZZLE 3 — Puzzle do Amor: troque as peças de lugar até formar A-M-O-R.

class Puzzle3Scene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.PUZZLE_LOVE });
  }

  create() {
    this.W = Game.CONFIG.WIDTH;
    this.H = Game.CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor('#0a1a2a');
    this.cameras.main.fadeIn(800);

    this.solved = false;

    this.LETTERS = ['A', 'M', 'O', 'R'];
    this.COLORS = [0xcc2244, 0x2244cc, 0x228822, 0xcc8800];
    this.TILE_SIZE = 76;
    const GAP = 10;
    const gridX = this.W / 2 - (this.TILE_SIZE + GAP);
    const gridY = this.H * 0.32;

    /** Coordenadas do canto superior esquerdo de cada célula da grade 2x2. */
    this.cells = [
      { x: gridX, y: gridY },
      { x: gridX + this.TILE_SIZE + GAP, y: gridY },
      { x: gridX, y: gridY + this.TILE_SIZE + GAP },
      { x: gridX + this.TILE_SIZE + GAP, y: gridY + this.TILE_SIZE + GAP }
    ];

    // `_order[célula] = letra`. Começa embaralhado (nunca já resolvido).
    this.order = [2, 3, 0, 1];
    this.selectedLetter = null;

    this._drawBackground();
    this._buildHeader();
    this._buildTiles();
    this._buildFooter();
  }

  _drawBackground() {
    const { W, H } = this;
    const g = this.add.graphics();
    g.fillStyle(0x0a2a4a);
    g.fillRect(0, 0, W, H * 0.5);
    g.fillStyle(0xd4a832);
    g.fillRect(0, H * 0.5, W, H * 0.5);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x1a6aaa, 0.3);
      g.fillEllipse(i * (W / 4), H * 0.52, 100, 18);
    }
  }

  _buildHeader() {
    this.add.text(this.W / 2, 24, '🏖️ PUZZLE DO AMOR', {
      fontSize: '18px',
      color: '#88ccff',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold',
      stroke: '#002244',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(this.W / 2, 52, 'Monte a palavra  A - M - O - R\ntocando em duas peças para trocá-las!', {
      fontSize: '12px',
      color: '#aaddff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setOrigin(0.5);
  }

  /** Cria um sprite por letra; a posição vem de `order`. */
  _buildTiles() {
    this.tiles = this.LETTERS.map((letter, letterIdx) => {
      const cell = this._cellForLetter(letterIdx);
      const center = this._centerOf(cell);

      const background = this.add.rectangle(center.x, center.y, this.TILE_SIZE, this.TILE_SIZE, this.COLORS[letterIdx])
        .setStrokeStyle(3, 0xffffff).setDepth(10).setInteractive({ useHandCursor: true });

      const label = this.add.text(center.x, center.y, letter, {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: Game.CONFIG.FONT,
        fontStyle: 'bold',
        stroke: '#00000066',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(11);

      background.on('pointerdown', () => this._select(letterIdx));

      return { background, label };
    });
  }

  _buildFooter() {
    this.add.text(this.W / 2, this.H * 0.68, '[ Posição correta: A  M  O  R ]', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(0.5);

    this.statusText = this.add.text(this.W / 2, this.H * 0.75, 'Toque numa peça, depois\nno lugar onde quer colocar!', {
      fontSize: '12px',
      color: '#ccccff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setOrigin(0.5);

    const hint = this.add.text(this.W / 2, this.H * 0.88, '💡 DICA', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: '#334455',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    hint.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this.statusText.setText(
        'Dica: A ordem certa é\nA (canto sup-esq)\nM (canto sup-dir)\nO (canto inf-esq)\nR (canto inf-dir)'
      );
    });
  }

  // ── Lógica ──────────────────────────────────────

  _cellForLetter(letterIdx) {
    return this.cells[this.order.indexOf(letterIdx)];
  }

  _centerOf(cell) {
    return { x: cell.x + this.TILE_SIZE / 2, y: cell.y + this.TILE_SIZE / 2 };
  }

  _select(letterIdx) {
    if (this.solved) return;
    Game.Audio.sfx('click');

    if (this.selectedLetter === null) {
      this.selectedLetter = letterIdx;
      this.tiles[letterIdx].background.setStrokeStyle(4, 0xffff00);
      this.statusText.setText('✅ Peça "' + this.LETTERS[letterIdx] + '" selecionada!\nAgora toque onde colocar.');
      return;
    }

    if (this.selectedLetter === letterIdx) {
      this.tiles[letterIdx].background.setStrokeStyle(3, 0xffffff);
      this.selectedLetter = null;
      this.statusText.setText('Toque numa peça para selecioná-la!');
      return;
    }

    this._swap(this.selectedLetter, letterIdx);
  }

  _swap(letterA, letterB) {
    const cellA = this.order.indexOf(letterA);
    const cellB = this.order.indexOf(letterB);
    this.order[cellA] = letterB;
    this.order[cellB] = letterA;

    this.tiles[letterA].background.setStrokeStyle(3, 0xffffff);
    this.tiles[letterB].background.setStrokeStyle(3, 0xffffff);
    this.selectedLetter = null;

    this._animateTo(letterA);
    this._animateTo(letterB, () => this._checkSolved());
    Game.Audio.sfx('step');
  }

  _animateTo(letterIdx, onComplete) {
    const target = this._centerOf(this._cellForLetter(letterIdx));
    this.tweens.add({
      targets: [this.tiles[letterIdx].background, this.tiles[letterIdx].label],
      x: target.x,
      y: target.y,
      duration: 200,
      ease: 'Power2',
      onComplete
    });
  }

  _checkSolved() {
    const isSolved = this.order.every((letterIdx, cellIdx) => letterIdx === cellIdx);
    if (isSolved) this._celebrate();
  }

  _celebrate() {
    this.solved = true;
    Game.State.puzzle3Done = true;
    Game.State.hasCompass = true;
    Game.Audio.sfx('chest');

    this.cameras.main.flash(600, 200, 200, 255);
    this.cameras.main.shake(400, 0.012);

    for (let i = 0; i < 10; i++) {
      this.add.text(
        Phaser.Math.Between(20, this.W - 20),
        Phaser.Math.Between(this.H * 0.3, this.H * 0.7),
        '❤️',
        { fontSize: Phaser.Math.Between(16, 32) + 'px' }
      ).setDepth(90);
    }

    this.time.delayedCall(800, () => this._buildVictoryOverlay());
  }

  _buildVictoryOverlay() {
    const { W, H } = this;

    this.add.rectangle(W / 2, H / 2, W, H, 0x000033, 0.9).setDepth(100);

    this.add.text(W / 2, H * 0.22, '🧭 PUZZLE COMPLETO!', {
      fontSize: '22px',
      color: '#88ccff',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold'
    }).setDepth(101).setOrigin(0.5);

    this.add.text(W / 2, H * 0.36, 'Você montou a palavra AMOR! 💕\n\nA Guardiã fica emocionada\ne te entrega a BÚSSOLA!', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setDepth(101).setOrigin(0.5);

    this.add.text(W / 2, H * 0.58, '🧭', { fontSize: '64px' }).setDepth(101).setOrigin(0.5);

    this.add.text(W / 2, H * 0.7, '"Vá ao Porto e fale\ncom o Capitão!" ⚓', {
      fontSize: '14px',
      color: '#aaddff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setDepth(101).setOrigin(0.5);

    const button = this.add.text(W / 2, H * 0.86, ' IR AO PORTO ▶ ', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: '#114488',
      padding: { x: 16, y: 8 }
    }).setDepth(101).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this.cameras.main.fadeOut(600);
      this.time.delayedCall(620, () => this.scene.start(Game.CONFIG.SCENE.WORLD));
    });
  }
}
