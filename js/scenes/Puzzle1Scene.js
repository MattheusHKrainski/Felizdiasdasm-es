// js/scenes/Puzzle1Scene.js
// PUZZLE 1 — Quiz da Floresta. Precisa de CONFIG.QUIZ_MIN_SCORE acertos
// para liberar o caminho e receber o pedaço de mapa.

class Puzzle1Scene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.PUZZLE_QUIZ });
  }

  create() {
    this.W = Game.CONFIG.WIDTH;
    this.H = Game.CONFIG.HEIGHT;
    this.MIN_SCORE = Game.CONFIG.QUIZ_MIN_SCORE;

    this.cameras.main.setBackgroundColor('#0d1a0d');
    this.cameras.main.fadeIn(800);

    this.currentQuestion = 0;
    this.score = 0;
    this.answered = false;

    this.questions = [
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

    this._drawBackground();
    this._buildTitle();
    this._buildProgressBar();
    this._buildQuestionArea();
    this._buildOptions();
    this._buildFooter();

    this._loadQuestion();
  }

  // ── Montagem da tela ────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x1a3a0a);
    g.fillRect(0, 0, this.W, this.H);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0x2a5a1a);
      g.fillCircle(Phaser.Math.Between(0, this.W), Phaser.Math.Between(this.H * 0.6, this.H), 50);
    }
  }

  _buildTitle() {
    this.add.text(this.W / 2, 30, '🌿 QUIZ DA FLORESTA', {
      fontSize: '18px',
      color: '#88ff88',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold',
      stroke: '#003300',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  _buildProgressBar() {
    this.progressWidth = this.W - 40;
    this.add.rectangle(this.W / 2, 62, this.progressWidth, 8, 0x224422).setOrigin(0.5);
    this.progressBar = this.add.rectangle(20, 58, 0, 8, 0x44ff44).setOrigin(0, 0);
  }

  _buildQuestionArea() {
    this.questionBox = this.add.rectangle(this.W / 2, this.H * 0.26, this.W - 20, 90, 0x003300, 0.9)
      .setStrokeStyle(2, 0x44ff44);

    this.questionText = this.add.text(this.W / 2, this.H * 0.26, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center',
      wordWrap: { width: this.W - 50 }
    }).setOrigin(0.5);
  }

  _buildOptions() {
    this.optionButtons = [];
    const W = this.W;
    const H = this.H;

    for (let i = 0; i < 4; i++) {
      const x = i % 2 === 0 ? W * 0.27 : W * 0.73;
      const y = H * 0.52 + Math.floor(i / 2) * 90;

      const background = this.add.rectangle(x, y, W * 0.42, 70, 0x224422)
        .setStrokeStyle(2, 0x44ff44)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y, '', {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: Game.CONFIG.FONT,
        align: 'center',
        wordWrap: { width: W * 0.38 }
      }).setOrigin(0.5);

      background.on('pointerdown', () => this._answer(i));
      background.on('pointerover', () => {
        if (!this.answered) background.setFillStyle(0x336633);
      });
      background.on('pointerout', () => {
        if (!this.answered) background.setFillStyle(0x224422);
      });

      this.optionButtons.push({ background, label });
    }
  }

  _buildFooter() {
    this.feedbackText = this.add.text(this.W / 2, this.H * 0.82, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(this.W - 10, 8, '', {
      fontSize: '11px',
      color: '#88ff88',
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(1, 0);
  }

  // ── Fluxo do quiz ───────────────────────────────

  _loadQuestion() {
    const question = this.questions[this.currentQuestion];
    const total = this.questions.length;

    this.answered = false;
    this.questionText.setText(question.q);
    this.progressBar.width = (this.currentQuestion / total) * this.progressWidth;
    this.feedbackText.setText('');
    this.scoreText.setText('Acertos: ' + this.score + '/' + total);

    this.optionButtons.forEach((button, i) => {
      button.label.setText(question.options[i]);
      button.background.setFillStyle(0x224422);
      button.background.setStrokeStyle(2, 0x44ff44);
    });
  }

  _answer(index) {
    if (this.answered) return;
    this.answered = true;

    const question = this.questions[this.currentQuestion];
    const correct = index === question.correct;

    if (correct) {
      this.score += 1;
      Game.Audio.sfx('correct');
      this.optionButtons[index].background.setFillStyle(0x226622);
      this.optionButtons[index].background.setStrokeStyle(2, 0x88ff88);
      this.feedbackText.setText('✅ Correto! Muito bem!').setColor('#88ff88');
    } else {
      Game.Audio.sfx('wrong');
      this.optionButtons[index].background.setFillStyle(0x662222);
      this.optionButtons[index].background.setStrokeStyle(2, 0xff4444);
      this.optionButtons[question.correct].background.setFillStyle(0x226622);
      this.feedbackText
        .setText('❌ Errou! A resposta era:\n' + question.options[question.correct])
        .setColor('#ff8888');
    }

    this.time.delayedCall(1800, () => {
      this.currentQuestion += 1;
      if (this.currentQuestion < this.questions.length) this._loadQuestion();
      else this._finish();
    });
  }

  _finish() {
    this.questionBox.setVisible(false);
    this.questionText.setVisible(false);
    this.optionButtons.forEach(button => {
      button.background.setVisible(false);
      button.label.setVisible(false);
    });

    if (this.score >= this.MIN_SCORE) this._showSuccess();
    else this._showFailure();
  }

  _showSuccess() {
    const { W, H } = this;

    Game.State.puzzle1Done = true;
    Game.State.hasMapPiece = true;
    Game.Audio.sfx('pickup');

    this.add.rectangle(W / 2, H / 2, W - 20, H * 0.55, 0x001100, 0.95)
      .setStrokeStyle(2, 0x44ff44);

    this.add.text(W / 2, H * 0.32, '🎉 PARABÉNS!', {
      fontSize: '28px',
      color: '#88ff88',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.44, 'Você acertou ' + this.score + '/' + this.questions.length + ' perguntas!', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.54, '🗺️ Você encontrou\num PEDAÇO DE MAPA!', {
      fontSize: '14px',
      color: '#ffdd44',
      fontFamily: Game.CONFIG.FONT,
      align: 'center'
    }).setOrigin(0.5);

    const icon = this.add.text(W / 2, H * 0.66, '🗺️', { fontSize: '48px' }).setOrigin(0.5);
    this.tweens.add({ targets: icon, scaleX: 1.2, scaleY: 1.2, duration: 400, yoyo: true, repeat: 3 });

    this._addButton(W / 2, H * 0.82, ' CONTINUAR ▶ ', 0x226622, () => {
      this.cameras.main.fadeOut(600);
      this.time.delayedCall(620, () => this.scene.start(Game.CONFIG.SCENE.WORLD));
    });
  }

  _showFailure() {
    const { W, H } = this;

    Game.Audio.sfx('wrong');

    this.add.rectangle(W / 2, H / 2, W - 20, H * 0.55, 0x110000, 0.95)
      .setStrokeStyle(2, 0xff6644);

    this.add.text(W / 2, H * 0.32, '💪 QUASE!', {
      fontSize: '28px',
      color: '#ffaa66',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.46,
      'Você acertou ' + this.score + '/' + this.questions.length + '.\n\n' +
      'O guarda exige pelo menos\n' + this.MIN_SCORE + ' acertos para liberar\no caminho da floresta.', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    this._addButton(W / 2, H * 0.78, ' TENTAR DE NOVO ', 0x883322, () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(520, () => this.scene.restart());
    });
  }

  _addButton(x, y, label, color, onClick) {
    const button = this.add.text(x, y, label, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: '#' + color.toString(16).padStart(6, '0'),
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      Game.Audio.sfx('click');
      onClick();
    });
    return button;
  }
}
