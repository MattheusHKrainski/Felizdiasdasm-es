// js/scenes/HouseScene.js
// Interior da casa do Mattheus. Ponto de partida da aventura:
// fale com a mãe, leia o bilhete e saia pela porta para o mundo.

class HouseScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.HOUSE });
  }

  create() {
    const TILE = Game.CONFIG.TILE;
    this.TILE = TILE;
    this.ROOM_COLS = 15;
    this.ROOM_ROWS = 22;
    this.ROOM_W = this.ROOM_COLS * TILE;   // 480
    this.ROOM_H = this.ROOM_ROWS * TILE;   // 704

    this.cameras.main.setBackgroundColor('#1a1020');
    this.cameras.main.fadeIn(800);

    this._dialog = null;

    this._drawRoom();

    this.player = Game.Player.create(this, 7 * TILE + TILE / 2, 16 * TILE + TILE / 2);

    this.physics.world.setBounds(0, 0, this.ROOM_W, this.ROOM_H);
    this.cameras.main.setBounds(0, 0, this.ROOM_W, this.ROOM_H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.8);

    this._buildPointsOfInterest();

    this.hud = Game.Hud.create(this, '🏠 Fale com a mãe e saia pela porta');

    this.controls = Game.Controls.create(this, { onAction: () => this._interact() });

    this.physics.add.collider(this.player, this.walls);
  }

  // ── Cenário ─────────────────────────────────────
  _drawRoom() {
    const T = this.TILE;
    const W = this.ROOM_W;
    const H = this.ROOM_H;
    const g = this.add.graphics().setDepth(0);

    // Piso de madeira
    g.fillStyle(0x8b5a2b);
    g.fillRect(0, T * 3, W, H - T * 3);
    for (let row = 3; row < this.ROOM_ROWS; row++) {
      g.fillStyle(row % 2 === 0 ? 0x7a4d24 : 0x96632f);
      g.fillRect(0, row * T, W, T);
      g.fillStyle(0x6b4220, 0.5);
      g.fillRect(0, row * T + T - 2, W, 2);
    }

    // Parede do fundo
    g.fillStyle(0x5b3a6b);
    g.fillRect(0, 0, W, T * 3);
    g.fillStyle(0x6d4780);
    g.fillRect(0, T * 2.6, W, T * 0.4);

    // Janela com coração
    const winX = 7 * T;
    const winY = T * 0.8;
    g.fillStyle(0x2a2a3a);
    g.fillRect(winX - 4, winY - 4, T * 2 + 8, T * 1.6 + 8);
    g.fillStyle(0x88ccff);
    g.fillRect(winX, winY, T * 2, T * 1.6);
    g.fillStyle(0xaaddff, 0.6);
    g.fillRect(winX, winY, T * 2, T * 0.6);
    g.fillStyle(0x2a2a3a);
    g.fillRect(winX + T - 2, winY, 4, T * 1.6);
    g.fillRect(winX, winY + T * 0.8 - 2, T * 2, 4);

    // Tapete
    g.fillStyle(0xa83256);
    g.fillEllipse(7.5 * T, 13 * T, T * 7, T * 4);
    g.fillStyle(0xc04468);
    g.fillEllipse(7.5 * T, 13 * T, T * 5, T * 2.4);

    // Porta (saída)
    const doorX = 7 * T;
    const doorY = (this.ROOM_ROWS - 2) * T;
    g.fillStyle(0x4a2f18);
    g.fillRect(doorX, doorY, T * 2, T * 2);
    g.fillStyle(0x6b4423);
    g.fillRect(doorX + 4, doorY + 4, T * 2 - 8, T * 2 - 8);
    g.fillStyle(0xffcc44);
    g.fillCircle(doorX + T * 2 - 12, doorY + T, 4);

    this.add.text(doorX + T, doorY - 10, '🚪', { fontSize: '18px' })
      .setOrigin(0.5).setDepth(4);

    // ── Colisores invisíveis ──────────────────────
    this.walls = this.physics.add.staticGroup();
    const addWall = (x, y, w, h) => {
      const wall = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xff0000, 0);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    };

    addWall(0, 0, W, T * 3);                       // parede do fundo
    addWall(0, 0, 8, H);
    addWall(W - 8, 0, 8, H);
    addWall(0, H - 8, W, 8);
    addWall(2 * T, 7 * T, T * 4, T * 2);           // mesa
    addWall(11 * T, 4 * T, T * 3, T * 2);          // estante
  }

  // ── Interações ──────────────────────────────────
  _buildPointsOfInterest() {
    const T = this.TILE;

    this.points = [
      {
        x: 10 * T,
        y: 12 * T,
        emoji: '👩',
        label: 'Mãe',
        lines: [
          '👩 Mãe:',
          '"Bom dia, meu amor!"',
          '"Vai dar uma volta por aí... dizem\nque tem uma surpresa escondida\nlá fora pra mim!" 💕',
          '[ Explore a cidade ao sul e\nconverse com as pessoas! ]'
        ]
      },
      {
        x: 4 * T,
        y: 8 * T,
        emoji: '📝',
        label: 'Bilhete',
        lines: [
          '📝 Um bilhete na mesa:',
          '"Saí pra comprar o café.\nVolto logo. Te amo! ❤️"'
        ]
      },
      {
        x: 8 * T,
        y: (this.ROOM_ROWS - 1) * T,
        emoji: '🚪',
        label: 'Porta',
        lines: ['[ Sair de casa ]'],
        action: () => {
          Game.Audio.sfx('click');
          this.cameras.main.fadeOut(600);
          this.time.delayedCall(620, () => {
            this.scene.start(Game.CONFIG.SCENE.WORLD);
          });
        }
      }
    ];

    this.points.forEach(point => {
      this.add.text(point.x, point.y, point.emoji, { fontSize: '22px' })
        .setOrigin(0.5).setDepth(5);
      this.add.text(point.x, point.y - 20, point.label, {
        fontSize: '6px',
        color: '#ffffff',
        fontFamily: Game.CONFIG.FONT,
        backgroundColor: '#00000088',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(6);
    });
  }

  _interact() {
    if (this._dialog) {
      this._dialog.advance();
      return;
    }

    const range = Game.CONFIG.INTERACT_RANGE;
    for (const point of this.points) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y);
      if (dist >= range) continue;

      Game.Audio.sfx('click');
      this._dialog = Game.Dialog.open(this, point.lines, () => {
        this._dialog = null;
        if (point.action) point.action();
      });
      return;
    }
  }

  update() {
    if (this._dialog) {
      Game.Player.freeze(this.player);
      return;
    }
    Game.Player.move(this.player, this.controls.getDirection());
  }
}
