// js/scenes/MenuScene.js

var MenuScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'MenuScene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#0d0d1a');
    this.cameras.main.fadeIn(1000);

    // ── Estrelas de fundo ────────────────────────
    for (var i = 0; i < 60; i++) {
      var star = this.add.rectangle(
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

    // ── Corações flutuantes ──────────────────────
    this._hearts = [];
    var heartSymbols = ['❤️','💕','💖','💗'];
    for (var j = 0; j < 8; j++) {
      var hx = Phaser.Math.Between(10, W - 10);
      var hy = Phaser.Math.Between(H * 0.1, H * 0.85);
      var hs = Phaser.Math.FloatBetween(0.5, 1.2);
      var ht = this.add.text(hx, hy,
        heartSymbols[j % heartSymbols.length],
        { fontSize: Math.floor(16 * hs) + 'px', alpha: 0.25 }
      );
      this._hearts.push({ obj: ht, speed: Phaser.Math.FloatBetween(0.2, 0.6) });
    }

    // ── Título ───────────────────────────────────
    this.add.text(W / 2, H * 0.13, '❤️', {
      fontSize: '52px'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.26, 'Feliz Dia\ndas Mães', {
      fontSize: '32px',
      color: '#ffb3c6',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#3d0a20',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.42, 'Uma aventura feita\ncom muito carinho 💕', {
      fontSize: '15px',
      color: '#ddaacc',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // ── Controles mobile ─────────────────────────
    this.add.text(W / 2, H * 0.52, '📱 Toque nos botões para mover\n👆 Toque em A para interagir', {
      fontSize: '12px',
      color: '#998899',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // ── Botão INICIAR ────────────────────────────
    var btn = this.add.text(W / 2, H * 0.67, ' INICIAR AVENTURA ', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#cc2244',
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: btn,
      scaleX: 1.06, scaleY: 1.06,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    btn.on('pointerdown', function () {
      self.cameras.main.fadeOut(600);
      self.time.delayedCall(620, function () {
        // Reseta estado global
        window.GAME_STATE = {
          hasMapPiece:  false,
          hasKey:       false,
          hasCompass:   false,
          chestOpened:  false,
          puzzle1Done:  false,
          puzzle2Done:  false,
          puzzle3Done:  false,
          npcGreeted:   false
        };
        self.scene.start('HouseScene');
      });
    });

    // ── Versão ───────────────────────────────────
    this.add.text(W / 2, H * 0.95, 'v1.0  •  Feito com ❤️', {
      fontSize: '10px',
      color: '#554455',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  },

  update: function () {
    this._hearts.forEach(function (h) {
      h.obj.y -= h.speed;
      if (h.obj.y < -20) {
        h.obj.y = this.scale.height + 20;
        h.obj.x = Phaser.Math.Between(10, this.scale.width - 10);
      }
    }, this);
  }
});