// js/scenes/BootScene.js
// Carrega os assets e cria as animações do jogador.

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.BOOT });
  }

  preload() {
    const { WIDTH: W, HEIGHT: H } = Game.CONFIG;

    this.cameras.main.setBackgroundColor(Game.CONFIG.BACKGROUND);
    this._buildLoadingBar(W, H);

    // Somente os arquivos de fato usados em cena. As artes `npc.png`,
    // `background.png` e `tileset.png` continuam em assets/images/ para uso
    // futuro, mas não são baixadas — ver README.
    this.load.spritesheet('player_sheet', 'assets/images/player.png', {
      frameWidth: 384,   // 1536 / 4 colunas
      frameHeight: 341   // 1024 / 3 linhas (arredondado)
    });
    this.load.image('chest', 'assets/images/chest.png');
    this.load.image('heart', 'assets/images/heart.png');
  }

  _buildLoadingBar(W, H) {
    const label = this.add.text(W / 2, H / 2 - 40, 'Carregando...', {
      fontSize: '20px',
      color: Game.CONFIG.PALETTE.pink,
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(0.5);

    const barWidth = W - 80;
    this.add.rectangle(W / 2, H / 2 + 10, barWidth, 16, 0x333355).setOrigin(0.5);
    const bar = this.add.rectangle(40, H / 2 + 10, 0, 16, 0xff4d6d).setOrigin(0, 0.5);

    this.load.on('progress', value => { bar.width = barWidth * value; });
    this.load.on('complete', () => { label.setText('Pronto! ❤️'); });
  }

  create() {
    this._createPlayerAnimations();

    // O navegador só libera áudio depois de um gesto do usuário.
    const unlock = () => {
      Game.Audio.unlock();
      Game.Audio.playMusic();
      this.input.off('pointerdown', unlock);
    };
    this.input.once('pointerdown', unlock);

    this.scene.start(Game.CONFIG.SCENE.MENU);
  }

  /**
   * A folha do jogador é uma grade 4x3:
   * linha 0 = andando para baixo, linha 1 = para o lado, linha 2 = para cima.
   */
  _createPlayerAnimations() {
    const rows = [
      { key: 'walk_down', start: 0, end: 3 },
      { key: 'walk_side', start: 4, end: 7 },
      { key: 'walk_up', start: 8, end: 11 }
    ];

    rows.forEach(row => {
      this.anims.create({
        key: row.key,
        frames: this.anims.generateFrameNumbers('player_sheet', { start: row.start, end: row.end }),
        frameRate: 6,
        repeat: -1
      });
    });

    this.anims.create({
      key: 'idle_down',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 0 }),
      frameRate: 1
    });
  }
}
