// js/scenes/Puzzle1Scene.js
// PUZZLE 1 — Quiz de perguntas

var Puzzle1Scene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'Puzzle1Scene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#0d1a0d');
    this.cameras.main.fadeIn(800);

    this._currentQ = 0;
    this._score    = 0;
    this._answered = false;

    this._questions = [
      {
        q: 'Qual é o esporte preferido\ndo Mattheus?',
        options: ['Futebol', 'Vôlei', 'Basquete', 'Natação'],
        correct: 1
      },
      {
        q: 'Qual oceano banha as\npraias do Paraná?',
        options: ['Pacífico', 'Índico', 'Atlântico', 'Ártico'],
        correct: 2
      },
      {
        q: 'Quantos segundos\ntêm 2 horas?',
        options: ['3.600', '7.200', '14.400', '1.200'],
        correct: 1
      }
    ];

    // ── Fundo floresta ───────────────────────────
    var g = this.add.graphics();
    g.fillStyle(0x1a3a0a);
    g.fillRect(0, 0, W, H);
    // Árvores decorativas
    for (var i = 0; i < 6; i++) {
      g.fillStyle(0x2a5a1a);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(H*0.6, H), 50);
    }

    // Título
    this.add.text(W / 2, 30, '🌿 QUIZ DA FLORESTA', {
      fontSize: '18px',
      color: '#88ff88',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#003300',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Barra de progresso
    this._progressBg = this.add.rectangle(W/2, 62, W - 40, 8, 0x224422).setOrigin(0.5);
    this._progressBar = this.add.rectangle(20, 58, 0, 8, 0x44ff44).setOrigin(0, 0);

    // Caixa da pergunta
    this._questionBox = this.add.rectangle(W/2, H*0.26, W-20, 90, 0x003300, 0.9)
      .setStrokeStyle(2, 0x44ff44);

    this._questionText = this.add.text(W/2, H*0.26, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: W - 50 }
    }).setOrigin(0.5);

    // Botões de resposta
    this._optionBtns = [];
    var optColors = ['#cc4444','#4444cc','#cc8800','#228822'];
    for (var b = 0; b < 4; b++) {
      var row = Math.floor(b / 2);
      var col = b % 2;
      var bx = col === 0 ? W * 0.27 : W * 0.73;
      var by = H * 0.52 + row * 90;

      var btn = this.add.rectangle(bx, by, W * 0.42, 70, 0x224422)
        .setStrokeStyle(2, 0x44ff44)
        .setInteractive({ useHandCursor: true });

      var btnTxt = this.add.text(bx, by, '', {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        wordWrap: { width: W * 0.38 }
      }).setOrigin(0.5);

      (function(index, rectangle, label) {
        rectangle.on('pointerdown', function() {
          self._answer(index);
        });
        rectangle.on('pointerover', function() {
          if (!self._answered) rectangle.setFillColor(0x336633);
        });
        rectangle.on('pointerout', function() {
          if (!self._answered) rectangle.setFillColor(0x224422);
        });
      })(b, btn, btnTxt);

      this._optionBtns.push({ bg: btn, txt: btnTxt });
    }

    // Feedback
    this._feedbackText = this.add.text(W/2, H*0.82, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // Pontuação
    this._scoreText = this.add.text(W - 10, 8, 'Acertos: 0/3', {
      fontSize: '11px',
      color: '#88ff88',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);

    this._loadQuestion();
  },

  _loadQuestion: function() {
    var q = this._questions[this._currentQ];
    var total = this._questions.length;

    this._answered = false;
    this._questionText.setText(q.q);
    this._progressBar.width = ((this._currentQ) / total) * (this.scale.width - 40);
    this._feedbackText.setText('');
    this._scoreText.setText('Acertos: ' + this._score + '/' + total);

    for (var i = 0; i < 4; i++) {
      this._optionBtns[i].txt.setText(q.options[i]);
      this._optionBtns[i].bg.setFillColor(0x224422);
      this._optionBtns[i].bg.setStrokeStyle(2, 0x44ff44);
    }
  },

  _answer: function(index) {
    if (this._answered) return;
    this._answered = true;

    var q = this._questions[this._currentQ];
    var correct = (index === q.correct);

    if (correct) {
      this._score++;
      this._optionBtns[index].bg.setFillColor(0x226622);
      this._optionBtns[index].bg.setStrokeStyle(2, 0x88ff88);
      this._feedbackText.setText('✅ Correto! Muito bem!');
      this._feedbackText.setColor('#88ff88');
    } else {
      this._optionBtns[index].bg.setFillColor(0x662222);
      this._optionBtns[index].bg.setStrokeStyle(2, 0xff4444);
      this._optionBtns[q.correct].bg.setFillColor(0x226622);
      this._feedbackText.setText('❌ Errou! A resposta era:\n' + q.options[q.correct]);
      this._feedbackText.setColor('#ff8888');
    }

    var self = this;
    this.time.delayedCall(1800, function() {
      self._currentQ++;
      if (self._currentQ < self._questions.length) {
        self._loadQuestion();
      } else {
        self._finish();
      }
    });
  },

  _finish: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    // Esconde tudo
    this._questionBox.setVisible(false);
    this._questionText.setVisible(false);
    this._optionBtns.forEach(function(b) {
      b.bg.setVisible(false);
      b.txt.setVisible(false);
    });

    var passed = this._score >= 2; // Precisa de 2/3

    window.GAME_STATE.puzzle1Done  = true;
    window.GAME_STATE.hasMapPiece  = true;

    // Tela de resultado
    this.add.rectangle(W/2, H/2, W-20, H*0.55, 0x001100, 0.95)
      .setStrokeStyle(2, 0x44ff44);

    this.add.text(W/2, H*0.32, passed ? '🎉 PARABÉNS!' : '💪 PASSOU!', {
      fontSize: '28px',
      color: '#88ff88',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W/2, H*0.44, 'Você acertou ' + this._score + '/3 perguntas!', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(W/2, H*0.54, '🗺️ Você encontrou\num PEDAÇO DE MAPA!', {
      fontSize: '14px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);

    // Animação do item
    var mapEmoji = this.add.text(W/2, H*0.66, '🗺️', { fontSize: '48px' }).setOrigin(0.5);
    this.tweens.add({
      targets: mapEmoji,
      scaleX: 1.2, scaleY: 1.2,
      duration: 400,
      yoyo: true,
      repeat: 3
    });

    var btn = this.add.text(W/2, H*0.82, ' CONTINUAR ▶ ', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#226622',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', function() {
      self.cameras.main.fadeOut(600);
      self.time.delayedCall(620, function() {
        self.scene.start('WorldScene');
      });
    });
  }
});