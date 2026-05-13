// js/scenes/BootScene.js

var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'BootScene' });
  },

  preload: function () {
    var W = this.scale.width;
    var H = this.scale.height;

    // ── Tela de loading ──────────────────────────
    this.cameras.main.setBackgroundColor('#1a1a2e');

    var loadText = this.add.text(W / 2, H / 2 - 40, 'Carregando...', {
      fontSize: '20px',
      color: '#ffb3c6',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    var barBg = this.add.rectangle(W / 2, H / 2 + 10, W - 80, 16, 0x333355).setOrigin(0.5);
    var bar   = this.add.rectangle(40, H / 2 + 10, 0, 16, 0xff4d6d).setOrigin(0, 0.5);

    this.load.on('progress', function (v) {
      bar.width = (W - 80) * v;
    });

    this.load.on('complete', function () {
      loadText.setText('Pronto! ❤️');
    });

    // ── Assets de imagem ──────────────────────────
    // fundo preto → tratado com setTint / blendMode nas scenes
    this.load.image('player',     'assets/images/player.png');
    this.load.image('npc',        'assets/images/npc.png');
    this.load.image('chest',      'assets/images/chest.png');
    this.load.image('heart',      'assets/images/heart.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tileset',    'assets/images/tileset.png');
    this.load.audio('music',      'assets/audio/musica.mp3');

    // Spritesheet do player: 4 colunas x 3 linhas = 1536x1024
    this.load.spritesheet('player_sheet', 'assets/images/player.png', {
      frameWidth:  384,  // 1536 / 4 colunas
      frameHeight: 341   // 1024 / 3 linhas (arredondado)
    });
  },

  create: function () {
    // ── Animações do player ──────────────────────
    // Linha 0 → andar para baixo  (frames 0-3)
    // Linha 1 → andar para lado   (frames 4-7)
    // Linha 2 → andar para cima   (frames 8-11)

    this.anims.create({
      key: 'walk_down',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'walk_side',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 4, end: 7 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'walk_up',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 8, end: 11 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'idle_down',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 0 }),
      frameRate: 1
    });

    this.scene.start('MenuScene');
  }
});