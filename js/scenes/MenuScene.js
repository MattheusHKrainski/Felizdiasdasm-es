// js/scenes/MenuScene.js
// Tela inicial.

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.MENU });
  }

  create() {
    const W = Game.CONFIG.WIDTH;
    const H = Game.CONFIG.HEIGHT;
    const { PALETTE, FONT } = Game.CONFIG;

    this.cameras.main.setBackgroundColor('#0d0d1a');
    this.cameras.main.fadeIn(1000);

    this._buildStars(W, H);
    this._hearts = this._buildFloatingHearts(W, H);

    this.add.text(W / 2, H * 0.13, '❤️', { fontSize: '52px' }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.26, 'Feliz Dia\ndas Mães', {
      fontSize: '32px',
      color: PALETTE.pink,
      fontFamily: FONT,
      fontStyle: 'bold',
      align: 'center',
      stroke: PALETTE.pinkDark,
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.42, 'Uma aventura feita\ncom muito carinho 💕', {
      fontSize: '15px',
      color: '#ddaacc',
      fontFamily: FONT,
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.52, '📱 Toque nos botões para mover\n⌨️ Ou use as setas + espaço', {
      fontSize: '12px',
      color: PALETTE.textDim,
      fontFamily: FONT,
      align: 'center'
    }).setOrigin(0.5);

    this._buildStartButton(W, H);
    this._buildMuteButton(W, H);

    this.add.text(W / 2, H * 0.95, 'v1.1  •  Feito com ❤️', {
      fontSize: '10px',
      color: '#554455',
      fontFamily: FONT
    }).setOrigin(0.5);
  }

  _buildStars(W, H) {
    for (let i = 0; i < 60; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.7),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }
  }

  _buildFloatingHearts(W, H) {
    const symbols = ['❤️', '💕', '💖', '💗'];
    const hearts = [];
    for (let i = 0; i < 8; i++) {
      const scale = Phaser.Math.FloatBetween(0.5, 1.2);
      const obj = this.add.text(
        Phaser.Math.Between(10, W - 10),
        Phaser.Math.Between(H * 0.1, H * 0.85),
        symbols[i % symbols.length],
        { fontSize: Math.floor(16 * scale) + 'px', alpha: 0.25 }
      );
      hearts.push({ obj, speed: Phaser.Math.FloatBetween(0.2, 0.6) });
    }
    return hearts;
  }

  _buildStartButton(W, H) {
    const button = this.add.text(W / 2, H * 0.67, ' INICIAR AVENTURA ', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold',
      backgroundColor: Game.CONFIG.PALETTE.red,
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: button,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    button.on('pointerdown', () => {
      Game.Audio.unlock();
      Game.Audio.playMusic();
      Game.Audio.sfx('click');
      this.cameras.main.fadeOut(600);
      this.time.delayedCall(620, () => {
        Game.State.reset();
        this.scene.start(Game.CONFIG.SCENE.HOUSE);
      });
    });
  }

  _buildMuteButton(W, H) {
    const icon = Game.Audio.muted ? '🔇' : '🔊';
    const button = this.add.text(W - 14, 14, icon, {
      fontSize: '18px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      const muted = Game.Audio.toggleMute();
      button.setText(muted ? '🔇' : '🔊');
    });
  }

  update() {
    const W = Game.CONFIG.WIDTH;
    const H = Game.CONFIG.HEIGHT;
    this._hearts.forEach(heart => {
      heart.obj.y -= heart.speed;
      if (heart.obj.y < -20) {
        heart.obj.y = H + 20;
        heart.obj.x = Phaser.Math.Between(10, W - 10);
      }
    });
  }
}
