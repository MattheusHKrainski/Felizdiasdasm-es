// js/scenes/CreditsScene.js

var CreditsScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'CreditsScene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000);

    // Estrelas
    for (var i = 0; i < 80; i++) {
      var star = this.add.rectangle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
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

    // Conteúdo rolando
    var items = [
      { text: '❤️', size: 52, color: '#ff4488', delay: 500 },
      { text: 'FIM', size: 32, color: '#ffffff', delay: 1000 },
      { text: '─────────────', size: 14, color: '#444466', delay: 1400 },
      { text: 'CRÉDITOS', size: 18, color: '#ffb3c6', delay: 1800 },
      { text: '', size: 12, color: '#ffffff', delay: 2000 },
      { text: '🎮 Desenvolvido por', size: 13, color: '#aaaaaa', delay: 2200 },
      { text: 'Mattheus', size: 22, color: '#88aaff', delay: 2500 },
      { text: '', size: 12, color: '#ffffff', delay: 2700 },
      { text: '🌸 Para', size: 13, color: '#aaaaaa', delay: 2900 },
      { text: 'Mãe ❤️', size: 22, color: '#ffb3c6', delay: 3200 },
      { text: '', size: 12, color: '#ffffff', delay: 3400 },
      { text: '🎨 Arte pixel por', size: 13, color: '#aaaaaa', delay: 3600 },
      { text: 'Assets públicos', size: 14, color: '#888888', delay: 3800 },
      { text: '', size: 12, color: '#ffffff', delay: 4000 },
      { text: '🔧 Motor', size: 13, color: '#aaaaaa', delay: 4200 },
      { text: 'Phaser 3', size: 14, color: '#888888', delay: 4400 },
      { text: '', size: 12, color: '#ffffff', delay: 4600 },
      { text: '─────────────', size: 14, color: '#444466', delay: 4800 },
      { text: 'Feito com muito', size: 16, color: '#ddaacc', delay: 5200 },
      { text: 'AMOR ❤️', size: 28, color: '#ff4488', delay: 5600 },
      { text: '─────────────', size: 14, color: '#444466', delay: 6000 },
    ];

    var yBase = H * 0.08;
    var ySpacing = 34;
    var objs = [];

    items.forEach(function(item, idx) {
      var y = yBase + idx * ySpacing;
      var obj = self.add.text(W / 2, y, item.text, {
        fontSize: item.size + 'px',
        color: item.color,
        fontFamily: 'monospace',
        fontStyle: item.size >= 22 ? 'bold' : 'normal',
        align: 'center'
      }).setOrigin(0.5).setAlpha(0);

      self.tweens.add({
        targets: obj,
        alpha: 1,
        duration: 800,
        delay: item.delay,
        ease: 'Power2'
      });

      objs.push(obj);
    });

    // Botão jogar de novo
    var btn = this.add.text(W / 2, H - 44, ' 🔄 JOGAR NOVAMENTE ', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#cc2244',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: btn, alpha: 1, duration: 800, delay: 6500 });
    this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 700, yoyo: true, repeat: -1, delay: 6500, ease: 'Sine.easeInOut' });

    btn.on('pointerdown', function() {
      self.cameras.main.fadeOut(600);
      self.time.delayedCall(620, function() {
        self.scene.start('MenuScene');
      });
    });

    // Auto-scroll suave
    this.time.delayedCall(2000, function() {
      self.tweens.add({
        targets: objs,
        y: '-=' + H * 0.6,
        duration: 8000,
        ease: 'Linear'
      });
    });
  }
});