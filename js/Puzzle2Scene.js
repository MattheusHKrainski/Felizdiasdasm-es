// js/scenes/Puzzle2Scene.js
// PUZZLE 2 — Caça 3 corações escondidos em 60 segundos

var Puzzle2Scene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'Puzzle2Scene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#2a1a0a');
    this.cameras.main.fadeIn(800);

    this._found   = 0;
    this._timer   = 60;
    this._gameOver = false;
    this._joystickDir = { x: 0, y: 0 };

    // ── Mundo da fase ────────────────────────────
    var WORLD_W = W * 2.5;
    var WORLD_H = H * 2.0;
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    // Fundo montanha
    var g = this.add.graphics();
    g.fillStyle(0x3a2a1a);
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    // Pedras e detalhes
    for (var i = 0; i < 20; i++) {
      g.fillStyle(Phaser.Math.Between(0x4a3a2a, 0x6a5a4a));
      g.fillEllipse(
        Phaser.Math.Between(0, WORLD_W),
        Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(40, 120),
        Phaser.Math.Between(20, 60)
      );
    }
    // Cavernas/buracos
    g.fillStyle(0x111111);
    [[100, 200], [WORLD_W*0.4, 150], [WORLD_W*0.7, 400],
     [80, WORLD_H*0.6], [WORLD_W*0.5, WORLD_H*0.7]].forEach(function(pos) {
      g.fillEllipse(pos[0], pos[1], 70, 40);
    });

    // ── Player ───────────────────────────────────
    this.player = this.physics.add.sprite(W/2, H/2, 'player_sheet', 0)
      .setScale(0.04)
      .setDepth(10)
      .setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.4);

    // ── Corações escondidos ───────────────────────
    this._hearts = [];
    var heartPositions = [
      { x: WORLD_W * 0.15, y: WORLD_H * 0.2 },
      { x: WORLD_W * 0.7,  y: WORLD_H * 0.35 },
      { x: WORLD_W * 0.45, y: WORLD_H * 0.75 }
    ];

    heartPositions.forEach(function(pos) {
      // Pista visual (brilho)
      var glow = self.add.circle(pos.x, pos.y, 22, 0xff2255, 0.15).setDepth(3);
      self.tweens.add({ targets: glow, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

      var heart = self.add.image(pos.x, pos.y, 'heart')
        .setScale(0.022)
        .setDepth(5)
        .setInteractive({ useHandCursor: true });

      // Pulsa
      self.tweens.add({
        targets: heart,
        scaleX: 0.026, scaleY: 0.026,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      self._hearts.push({ obj: heart, glow: glow, found: false, x: pos.x, y: pos.y });
    });

    // ── HUD ──────────────────────────────────────
    this._hudBg = this.add.rectangle(W/2, 28, W, 56, 0x000022, 0.88)
      .setScrollFactor(0).setDepth(50);

    this._timerText = this.add.text(W/2, 18, '⏱ 60s', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);

    this._foundText = this.add.text(W/2, 38, '❤️ 0 / 3', {
      fontSize: '14px',
      color: '#ffaacc',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);

    // Instrução
    this.add.text(W/2, 70, '⛰️ Encontre os 3 corações escondidos!', {
      fontSize: '11px',
      color: '#ccccaa',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(51).setOrigin(0.5, 0);

    // Timer event
    this._timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this._tick,
      callbackScope: this,
      repeat: 59
    });

    // ── Controles mobile ─────────────────────────
    this._buildMobileControls();
  },

  _tick: function() {
    if (this._gameOver) return;
    this._timer--;
    var color = this._timer <= 10 ? '#ff4444' : '#ffffff';
    this._timerText.setText('⏱ ' + this._timer + 's').setColor(color);
    if (this._timer <= 0) this._timeUp();
  },

  _timeUp: function() {
    if (this._gameOver) return;
    this._gameOver = true;
    this._showResult(false);
  },

  _buildMobileControls: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    var joyBase = this.add.circle(70, H - 80, 40, 0x333355, 0.5)
      .setScrollFactor(0).setDepth(60).setInteractive();
    var joyStick = this.add.circle(70, H - 80, 18, 0x8888cc, 0.8)
      .setScrollFactor(0).setDepth(61);
    var joyOrigin = { x: 70, y: H - 80 };
    var joyActive = false;

    joyBase.on('pointerdown', function() { joyActive = true; });
    this.input.on('pointermove', function(ptr) {
      if (!joyActive) return;
      var dx = ptr.x - joyOrigin.x;
      var dy = ptr.y - joyOrigin.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 36) { dx = dx/dist*36; dy = dy/dist*36; dist = 36; }
      joyStick.setPosition(joyOrigin.x + dx, joyOrigin.y + dy);
      self._joystickDir = dist > 8
        ? { x: dx / Math.sqrt(dx*dx+dy*dy), y: dy / Math.sqrt(dx*dx+dy*dy) }
        : { x: 0, y: 0 };
    });
    this.input.on('pointerup', function() {
      joyActive = false;
      joyStick.setPosition(joyOrigin.x, joyOrigin.y);
      self._joystickDir = { x: 0, y: 0 };
    });
  },

  update: function() {
    if (this._gameOver) return;

    // Move player
    var speed = 110;
    var dx = this._joystickDir.x;
    var dy = this._joystickDir.y;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    this.player.setVelocity(dx * speed, dy * speed);

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.anims.play('walk_side', true);
        this.player.setFlipX(dx < 0);
      } else {
        this.player.anims.play(dy > 0 ? 'walk_down' : 'walk_up', true);
      }
    } else {
      this.player.anims.stop();
      this.player.setFrame(0);
    }

    // Detecta coleta de corações
    var self = this;
    this._hearts.forEach(function(h) {
      if (h.found) return;
      var dist = Phaser.Math.Distance.Between(
        self.player.x, self.player.y, h.x, h.y
      );
      if (dist < 40) {
        h.found = true;
        h.obj.setVisible(false);
        h.glow.setVisible(false);
        self._found++;
        self._foundText.setText('❤️ ' + self._found + ' / 3');

        // Efeito de coleta
        self.cameras.main.flash(300, 255, 100, 150);
        self.cameras.main.shake(200, 0.008);

        if (self._found >= 3) {
          self._timerEvent.remove();
          self.time.delayedCall(600, function() {
            self._showResult(true);
          });
        }
      }
    });
  },

  _showResult: function(success) {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._gameOver = true;
    this.player.setVelocity(0);

    if (success) {
      window.GAME_STATE.puzzle2Done = true;
      window.GAME_STATE.hasKey = true;
    }

    this.cameras.main.fadeOut(400);
    this.time.delayedCall(420, function() {
      self.cameras.main.fadeIn(600);

      // Overlay de resultado
      var overlay = self.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88)
        .setScrollFactor(0).setDepth(100);

      self.add.text(W/2, H*0.22, success ? '🎉 ENCONTROU\nTODOS!' : '⏱ TEMPO\nEESGOTADO!', {
        fontSize: '26px',
        color: success ? '#88ff88' : '#ff6644',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center'
      }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

      var msg = success
        ? '❤️ Você encontrou\nos 3 corações!\n\n🔑 Você ganhou uma CHAVE!'
        : 'Você encontrou ' + self._found + '/3 corações...\n\nTente novamente!';

      self.add.text(W/2, H*0.48, msg, {
        fontSize: '15px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center'
      }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

      var btnLabel = success ? ' CONTINUAR ▶ ' : ' TENTAR DE NOVO ';
      var btn = self.add.text(W/2, H*0.78, btnLabel, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: success ? '#226622' : '#883322',
        padding: { x: 16, y: 8 }
      }).setScrollFactor(0).setDepth(101).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', function() {
        self.cameras.main.fadeOut(500);
        self.time.delayedCall(520, function() {
          self.scene.start(success ? 'WorldScene' : 'Puzzle2Scene');
        });
      });
    });
  }
});