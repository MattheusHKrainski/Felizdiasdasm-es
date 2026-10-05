// js/state.js
// Estado global de progresso do jogador.
// Substitui o antigo `window.GAME_STATE` espalhado pelas cenas.

window.Game = window.Game || {};

Game.State = {
  // ── Itens ───────────────────────────────────────
  hasMapPiece: false,
  hasKey: false,
  hasCompass: false,

  // ── Progresso ───────────────────────────────────
  puzzle1Done: false,
  puzzle2Done: false,
  puzzle3Done: false,
  chestOpened: false,
  /** Piada final do Vizinho Zé só acontece uma vez por partida. */
  neighborGreeted: false,

  /** Volta todas as flags ao estado inicial (chamado ao iniciar uma partida). */
  reset() {
    this.hasMapPiece = false;
    this.hasKey = false;
    this.hasCompass = false;
    this.puzzle1Done = false;
    this.puzzle2Done = false;
    this.puzzle3Done = false;
    this.chestOpened = false;
    this.neighborGreeted = false;
    return this;
  },

  /** O baú final só abre com a chave da montanha E a bússola da praia. */
  canOpenChest() {
    return this.hasKey && this.hasCompass;
  },

  /** Faltando qual item para abrir o baú? Retorna `null` se puder abrir. */
  missingChestItem() {
    if (!this.hasKey) return { icon: '🔑', label: 'Chave' };
    if (!this.hasCompass) return { icon: '🧭', label: 'Bússola' };
    return null;
  },

  /** Lista de itens coletados, para o HUD. */
  collectedItems() {
    const items = [];
    if (this.hasMapPiece) items.push('🗺️ Mapa');
    if (this.hasKey) items.push('🔑 Chave');
    if (this.hasCompass) items.push('🧭 Bússola');
    if (this.chestOpened) items.push('📦 Baú ✓');
    return items;
  },

  /** Linha única exibida no topo do WorldScene. */
  hudText() {
    const items = this.collectedItems();
    return items.length ? 'Itens: ' + items.join('   ') : '[ Converse com as pessoas! ]';
  }
};
