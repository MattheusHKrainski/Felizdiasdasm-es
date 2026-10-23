// js/scenes/Puzzle2Scene.js
// PUZZLE 2 — Caça aos corações: encontre os 3 escondidos antes do tempo acabar.

class Puzzle2Scene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.PUZZLE_HEARTS });
  }

  create() {
    this.W = Game.CONFIG.WIDTH;
    this.H = Game.CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor('#2a1a0a');
    this.cameras.main.fadeIn(800);

    this.found = 0;
    this.timeLeft = Game.CONFIG.HEART_HUNT_SECONDS;
    this.gameOver = false;

    this.WORLD_W = this.W * 2.5;
    this.WORLD_H = this.H * 2;
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    this._drawCave();

    this.player = Game.Player.create(this, this.W / 2, this.H / 2, 0.04);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.4);

    this._buildHearts();
    this._buildHud();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this._tick,
      callbackScope: this,
      repeat: this.timeLeft - 1
    });

    this.controls = Game.Controls.create(this, { showActionButton: false });
  }

  _drawCave() {
    const W = this.WORLD_W;
    const H = this.WORLD_H;
    const g = this.add.graphics();

    g.fillStyle(0x3a2a1a);
    g.fillRect(0, 0, W, H);

    for (let i = 0; i < 20; i++) {
      g.fillStyle(Phaser.Math.Between(0x4a3a2a, 0x6a5a4a));
      g.fillEllipse(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(40, 120),
        Phaser.Math.Between(20, 60)
      );
    }

    g.fillStyle(0x111111);
    [[100, 200], [W * 0.4, 150], [W * 0.7, 400], [80, H * 0.6], [W * 0.5, H * 0.7]]
      .forEach(([x, y]) => g.fillEllipse(x, y, 70, 40));
  }

  _buildHearts() {
    const positions = [
      { x: this.WORLD_W * 0.15, y: this.WORLD_H * 0.2 },
      { x: this.WORLD_W * 0.7, y: this.WORLD_H * 0.35 },
      { x: this.WORLD_W * 0.45, y: this.WORLD_H * 0.75 }
    ];

    this.hearts = positions.map(pos => {
      const glow = this.add.circle(pos.x, pos.y, 22, 0xff2255, 0.15).setDepth(3);
      this.tweens.add({ targets: glow, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

      const sprite = this.add.image(pos.x, pos.y, 'heart')
        .setScale(0.022).setDepth(5);
      this.tweens.add({
        targets: sprite,
        scaleX: 0.026,
        scaleY: 0.026,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      return { sprite, glow, x: pos.x, y: pos.y, found: false };
    });
  }

  _buildHud() {
    this.add.rectangle(this.W / 2, 28, this.W, 56, 0x000022, 0.88)
      .setScrollFactor(0).setDepth(50);

    this.timerText = this.add.text(this.W / 2, 18, '⏱ ' + this.timeLeft + 's', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);

    this.foundText = this.add.text(this.W / 2, 38, '❤️ 0 / 3', {
      fontSize: '14px',
      color: '#ffaacc',
      fontFamily: Game.CONFIG.FONT
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);

    this.add.text(this.W / 2, 70, '⛰️ Encontre os 3 corações escondidos!', {
      fontSize: '11px',
      color: '#ccccaa',
      fontFamily: Game.CONFIG.FONT
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);
  }

  _tick() {
    if (this.gameOver) return;
    this.timeLeft -= 1;
    this.timerText
      .setText('⏱ ' + this.timeLeft + 's')
      .setColor(this.timeLeft <= 10 ? '#ff4444' : '#ffffff');
    if (this.timeLeft <= 0) this._showResult(false);
  }

  update() {
    if (this.gameOver) return;

    Game.Player.move(this.player, this.controls.getDirection(), 110);
    this._checkPickups();
  }

  _checkPickups() {
    for (const heart of this.hearts) {
      if (heart.found) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, heart.x, heart.y) >= 40) continue;

      heart.found = true;
      heart.sprite.setVisible(false);
      heart.glow.setVisible(false);
      this.found += 1;
      this.foundText.setText('❤️ ' + this.found + ' / 3');

      Game.Audio.sfx('pickup');
      this.cameras.main.flash(300, 255, 100, 150);
      this.cameras.main.shake(200, 0.008);

      if (this.found >= this.hearts.length) {
        this.time.removeEvent(this.timerEvent);
        this.time.delayedCall(600, () => this._showResult(true));
      }
    }
  }

  _showResult(success) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.setVelocity(0);

    if (success) {
      Game.State.puzzle2Done = true;
      Game.State.hasKey = true;
      Game.Audio.sfx('chest');
    } else {
      Game.Audio.sfx('wrong');
    }

    this.cameras.main.fadeOut(400);
    this.time.delayedCall(420, () => this._buildResultOverlay(success));
  }

  _buildResultOverlay(success) {
    this.cameras.main.fadeIn(600);
    const { W, H } = this;

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88)
      .setScrollFactor(0).setDepth(100);

    this.add.text(W / 2, H * 0.22, success ? '🎉 ENCONTROU\nTODOS!' : '⏱ TEMPO\nESGOTADO!', {
      fontSize: '26px',
      color: success ? '#88ff88' : '#ff6644',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold',
      align: 'center'
    }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

    const message = success
      ? '❤️ Você encontrou\nos 3 corações!\n\n🔑 Você ganhou uma CHAVE!'
      : 'Você encontrou ' + this.found + '/' + this.hearts.length + ' corações...\n\nTente novamente!';

    this.add.text(W / 2, H * 0.48, message, {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

    const button = this.add.text(W / 2, H * 0.78, success ? ' CONTINUAR ▶ ' : ' TENTAR DE NOVO ', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: success ? '#226622' : '#883322',
      padding: { x: 16, y: 8 }
    }).setScrollFactor(0).setDepth(101).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(520, () => {
        this.scene.start(success ? Game.CONFIG.SCENE.WORLD : Game.CONFIG.SCENE.PUZZLE_HEARTS);
      });
    });
  }
}
