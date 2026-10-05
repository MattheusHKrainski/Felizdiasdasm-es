// js/scenes/CreditsScene.js
// Créditos finais com revelação em cascata e rolagem suave.

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.CREDITS });
  }

  create() {
    this.W = Game.CONFIG.WIDTH;
    this.H = Game.CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000);

    this._buildStars();
    const lines = this._buildCredits();
    this._buildReplayButton();
    this._scheduleScroll(lines);
  }

  _buildStars() {
    for (let i = 0; i < 80; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(0, this.H),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.7)
      );
      this.tweens.add({
        targets: star,
        alpha: 0.05,
        duration: Phaser.Math.Between(600, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  _buildCredits() {
    const items = [
      { text: '❤️', size: 52, color: '#ff4488', delay: 500 },
      { text: 'FIM', size: 32, color: '#ffffff', delay: 1000 },
      { text: '─────────────', size: 14, color: '#444466', delay: 1400 },
      { text: 'CRÉDITOS', size: 18, color: Game.CONFIG.PALETTE.pink, delay: 1800 },
      { text: '', size: 12, color: '#ffffff', delay: 2000 },
      { text: '🎮 Desenvolvido por', size: 13, color: '#aaaaaa', delay: 2200 },
      { text: 'Mattheus', size: 22, color: '#88aaff', delay: 2500 },
      { text: '', size: 12, color: '#ffffff', delay: 2700 },
      { text: '🌸 Para', size: 13, color: '#aaaaaa', delay: 2900 },
      { text: 'Mãe ❤️', size: 22, color: Game.CONFIG.PALETTE.pink, delay: 3200 },
      { text: '', size: 12, color: '#ffffff', delay: 3400 },
      { text: '🎨 Arte', size: 13, color: '#aaaaaa', delay: 3600 },
      { text: 'Assets públicos', size: 14, color: '#888888', delay: 3800 },
      { text: '', size: 12, color: '#ffffff', delay: 4000 },
      { text: '🎵 Música e sons', size: 13, color: '#aaaaaa', delay: 4200 },
      { text: 'Gerados por código', size: 14, color: '#888888', delay: 4400 },
      { text: '', size: 12, color: '#ffffff', delay: 4600 },
      { text: '🔧 Motor', size: 13, color: '#aaaaaa', delay: 4800 },
      { text: 'Phaser 3', size: 14, color: '#888888', delay: 5000 },
      { text: '', size: 12, color: '#ffffff', delay: 5200 },
      { text: '─────────────', size: 14, color: '#444466', delay: 5400 },
      { text: 'Feito com muito', size: 16, color: '#ddaacc', delay: 5800 },
      { text: 'AMOR ❤️', size: 28, color: '#ff4488', delay: 6200 },
      { text: '─────────────', size: 14, color: '#444466', delay: 6600 }
    ];

    const spacing = 34;
    return items.map((item, index) => {
      const obj = this.add.text(this.W / 2, this.H * 0.08 + index * spacing, item.text, {
        fontSize: item.size + 'px',
        color: item.color,
        fontFamily: Game.CONFIG.FONT,
        fontStyle: item.size >= 22 ? 'bold' : 'normal',
        align: 'center'
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: obj, alpha: 1, duration: 800, delay: item.delay, ease: 'Power2' });
      return obj;
    });
  }

  _buildReplayButton() {
    const button = this.add.text(this.W / 2, this.H - 44, ' 🔄 JOGAR NOVAMENTE ', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: Game.CONFIG.PALETTE.red,
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: button, alpha: 1, duration: 800, delay: 6500 });
    this.tweens.add({
      targets: button,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      yoyo: true,
      repeat: -1,
      delay: 6500,
      ease: 'Sine.easeInOut'
    });

    button.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this.cameras.main.fadeOut(600);
      this.time.delayedCall(620, () => this.scene.start(Game.CONFIG.SCENE.MENU));
    });
  }

  _scheduleScroll(lines) {
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: lines,
        y: '-=' + this.H * 0.6,
        duration: 8000,
        ease: 'Linear'
      });
    });
  }
}
