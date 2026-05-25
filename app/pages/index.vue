<script setup lang="ts">
import { CATEGORIES } from '~/data/words'

const { players, language, categoryId, gameMode, addPlayer, removePlayer, renamePlayer, startGame } = useGame()

const GAME_MODES = [
  {
    id: 'hint' as const,
    icon: '🔍',
    label: { en: 'Hint Word', km: 'ពាក្យជំនួយ' },
    desc: { en: 'Imposter knows their role, gets a similar word as a hint', km: 'អ្នកក្លែងបន្លំដឹងខ្លួន ទទួលបានពាក្យស្រដៀងជំនួយ' },
  },
  {
    id: 'blind' as const,
    icon: '🎭',
    label: { en: 'Undercover', km: 'លាក់ខ្លួន' },
    desc: { en: 'Imposter doesn\'t knows their role, gets a similar word as a hint', km: 'អ្នកក្លែងបន្លំបានពាក្យស្រដៀង ប៉ុន្តែមិនដឹងខ្លួន' },
  },
  {
    id: 'category' as const,
    icon: '📂',
    label: { en: 'Category Only', km: 'ប្រភេទប៉ុណ្ណោះ' },
    desc: { en: 'Imposter knows their role, only sees the category name', km: 'អ្នកក្លែងបន្លំដឹងខ្លួន ឃើញតែប្រភេទប៉ុណ្ណោះ' },
  },
]

const newName = ref('')
const newNameInput = ref<HTMLInputElement | null>(null)
const editingId = ref<string | null>(null)
const editingName = ref('')

const categories = computed(() => CATEGORIES[language.value])
const canStart = computed(() => players.value.length >= 3)

const t = computed(() => language.value === 'km' ? {
  title: 'ហ្គេម អ្នកក្លែងបន្លំ',
  subtitle: 'ស្វែងរកអ្នកក្លែងបន្លំ!',
  mode: 'របៀបលេង',
  category: 'ជ្រើសប្រភេទ',
  players: 'អ្នកលេង',
  addPlayer: '+ បន្ថែមអ្នកលេង',
  playerName: 'ឈ្មោះអ្នកលេង',
  add: 'បន្ថែម',
  edit: 'កែ',
  save: 'រក្សា',
  delete: 'លុប',
  start: 'ចាប់ផ្ដើម',
  minPlayers: 'ត្រូវការ 3 នាក់យ៉ាងតិច',
} : {
  title: 'Imposter Game',
  subtitle: 'Find the imposter among you!',
  mode: 'Game Mode',
  category: 'Choose Category',
  players: 'Players',
  addPlayer: '+ Add Player',
  playerName: 'Player name',
  add: 'Add',
  edit: 'Edit',
  save: 'Save',
  delete: 'Remove',
  start: 'Start Game',
  minPlayers: 'Need at least 3 players',
})

function handleAdd() {
  if (!newName.value.trim()) return
  addPlayer(newName.value)
  newName.value = ''
  nextTick(() => newNameInput.value?.focus())
}

function handleAddKey(e: KeyboardEvent) {
  if (e.key === 'Enter') handleAdd()
}

function startEdit(id: string, name: string) {
  editingId.value = id
  editingName.value = name
}

function saveEdit() {
  if (editingId.value) renamePlayer(editingId.value, editingName.value)
  editingId.value = null
  editingName.value = ''
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

function handleEditKey(e: KeyboardEvent) {
  if (e.key === 'Enter') saveEdit()
  if (e.key === 'Escape') cancelEdit()
}

function handleStart() {
  if (!canStart.value) return
  startGame()
  navigateTo('/game')
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="header-title">
        <span class="spy-icon">🕵️</span>
        <div>
          <h1>{{ t.title }}</h1>
          <p class="subtitle">{{ t.subtitle }}</p>
        </div>
      </div>
      <div class="lang-toggle">
        <button :class="['lang-btn', { active: language === 'en' }]" @click="language = 'en'">EN</button>
        <button :class="['lang-btn', { active: language === 'km' }]" @click="language = 'km'">ខ្មែរ</button>
      </div>
    </header>

    <div class="content">
      <!-- Game Mode Selector -->
      <section class="section">
        <h2 class="section-title">{{ t.mode }}</h2>
        <div class="mode-list">
          <button
            v-for="m in GAME_MODES"
            :key="m.id"
            :class="['mode-btn', { active: gameMode === m.id }]"
            @click="gameMode = m.id"
          >
            <span class="mode-icon">{{ m.icon }}</span>
            <div class="mode-text">
              <span class="mode-label">{{ m.label[language] }}</span>
              <span class="mode-desc">{{ m.desc[language] }}</span>
            </div>
            <span v-if="gameMode === m.id" class="mode-check">✓</span>
          </button>
        </div>
      </section>

      <!-- Category Selector -->
      <section class="section">
        <h2 class="section-title">{{ t.category }}</h2>
        <div class="category-grid">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['cat-btn', { active: categoryId === cat.id }]"
            @click="categoryId = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </section>

      <!-- Players -->
      <section class="section">
        <h2 class="section-title">{{ t.players }} <span class="player-count">{{ players.length }}</span></h2>

        <TransitionGroup name="player" tag="ul" class="player-list">
          <li v-for="player in players" :key="player.id" class="player-item">
            <template v-if="editingId === player.id">
              <input
                v-model="editingName"
                class="edit-input"
                @keydown="handleEditKey"
                @blur="saveEdit"
                autofocus
              />
              <button class="action-btn save" @click="saveEdit">{{ t.save }}</button>
            </template>
            <template v-else>
              <span class="player-avatar">{{ player.name[0]?.toUpperCase() ?? '?' }}</span>
              <span class="player-name">{{ player.name }}</span>
              <button class="action-btn edit" @click="startEdit(player.id, player.name)">✏️</button>
              <button class="action-btn delete" @click="removePlayer(player.id)">✕</button>
            </template>
          </li>
        </TransitionGroup>

        <!-- Add player row -->
        <div class="add-row">
          <input
            ref="newNameInput"
            v-model="newName"
            :placeholder="t.playerName"
            class="add-input"
            maxlength="20"
            @keydown="handleAddKey"
          />
          <button class="add-btn" :disabled="!newName.trim()" @click="handleAdd">{{ t.add }}</button>
        </div>
      </section>
    </div>

    <!-- Start Button -->
    <div class="footer">
      <p v-if="!canStart" class="min-hint">{{ t.minPlayers }}</p>
      <button
        class="start-btn"
        :disabled="!canStart"
        @click="handleStart"
      >
        {{ t.start }}
        <span v-if="canStart" class="player-pill">{{ players.length }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: max(20px, env(safe-area-inset-top)) 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(10,10,20,0.95);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spy-icon {
  font-size: 32px;
  line-height: 1;
}

.header-title h1 {
  font-size: 18px;
  font-weight: 700;
  color: #e8e4ff;
  line-height: 1.2;
}

.subtitle {
  font-size: 12px;
  color: #6b6980;
  margin-top: 2px;
}

.lang-toggle {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 3px;
}

.lang-btn {
  border: none;
  background: transparent;
  color: #888aaa;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.15s;
}

.lang-btn.active {
  background: #7c6df0;
  color: white;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b6980;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-count {
  background: #7c6df0;
  color: white;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
}

/* Category grid */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cat-btn {
  border: 1.5px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #b0accc;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 8px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.15s;
  line-height: 1.3;
}

.cat-btn:active {
  transform: scale(0.97);
}

.cat-btn.active {
  border-color: #7c6df0;
  background: rgba(124, 109, 240, 0.15);
  color: #a99eff;
}

/* Player list */
.player-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 10px 12px;
  transition: all 0.2s;
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c6df0, #5a4fcf);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.player-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #e8e4ff;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid #7c6df0;
  border-radius: 8px;
  color: #e8e4ff;
  font-size: 16px;
  padding: 6px 10px;
  outline: none;
}

.action-btn {
  border: none;
  background: transparent;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.15s;
  flex-shrink: 0;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.edit {
  color: #888aaa;
}
.action-btn.edit:hover {
  background: rgba(255,255,255,0.08);
}

.action-btn.delete {
  color: #f0506e;
  font-weight: 700;
}
.action-btn.delete:hover {
  background: rgba(240,80,110,0.12);
}

.action-btn.save {
  color: #10d9a0;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(16,217,160,0.3);
  padding: 5px 10px;
}

/* Add row */
.add-row {
  display: flex;
  gap: 8px;
}

.add-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #e8e4ff;
  font-size: 16px;
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.15s;
}

.add-input:focus {
  border-color: #7c6df0;
}

.add-input::placeholder {
  color: #4a4a6a;
}

.add-btn {
  background: rgba(124,109,240,0.2);
  border: 1.5px solid rgba(124,109,240,0.4);
  color: #a99eff;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.15s;
  white-space: nowrap;
}

.add-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.add-btn:not(:disabled):active {
  transform: scale(0.96);
  background: rgba(124,109,240,0.35);
}

/* Footer */
.footer {
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(10,10,20,0.95);
  backdrop-filter: blur(12px);
}

.min-hint {
  text-align: center;
  color: #6b6980;
  font-size: 13px;
  margin-bottom: 10px;
}

.start-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #7c6df0, #5a4fcf);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.15s;
  box-shadow: 0 4px 24px rgba(124,109,240,0.35);
}

.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.start-btn:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(124,109,240,0.25);
}

.player-pill {
  background: rgba(255,255,255,0.2);
  font-size: 14px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

/* Mode selector */
.mode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 12px 14px;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.mode-btn:active {
  transform: scale(0.98);
}

.mode-btn.active {
  border-color: #7c6df0;
  background: rgba(124,109,240,0.12);
}

.mode-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
}

.mode-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mode-label {
  font-size: 14px;
  font-weight: 700;
  color: #e8e4ff;
}

.mode-btn.active .mode-label {
  color: #a99eff;
}

.mode-desc {
  font-size: 12px;
  color: #6b6980;
  line-height: 1.4;
}

.mode-check {
  font-size: 14px;
  font-weight: 800;
  color: #7c6df0;
  flex-shrink: 0;
}

/* Transitions */
.player-enter-active,
.player-leave-active {
  transition: all 0.2s ease;
}
.player-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.player-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
