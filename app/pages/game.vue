<script setup lang="ts">
const { players, language, round, currentPlayer, isCurrentImposter, imposterPlayer, advancePlayer, resetRound, startGame } = useGame()

// Redirect if no active round
onMounted(() => {
  if (!round.value) navigateTo('/')
})

// Internal phase: 'passing' | 'holding' | 'revealed'
const innerPhase = ref<'passing' | 'holding' | 'revealed'>('passing')
const holdProgress = ref(0)
const showWord = ref(false)
let holdTimer: ReturnType<typeof setInterval> | null = null
let holdStartTime = 0
const HOLD_MS = 3000

// SVG ring math
const RADIUS = 48
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeOffset = computed(() => CIRCUMFERENCE * (1 - holdProgress.value / 100))

const t = computed(() => language.value === 'km' ? {
  passDevice: 'ផ្ទេរទូរស័ព្ទ',
  passInstruction: 'ប្រគល់ទូរស័ព្ទ ហើយចុចប៊ូតុង',
  holdReveal: 'ចុចឱ្យជាប់ដើម្បីមើល',
  holdHint: 'ចុចឱ្យជាប់ ២ វិនាទី',
  holdProgress: 'ចុចឱ្យជាប់...',
  citizenRole: 'អ្នកជាពលរដ្ឋ',
  imposterRole: 'អ្នកជា អ្នកក្លែងបន្លំ!',
  theWordIs: 'ពាក្យសម្ងាត់',
  citizenHint: 'ចាំ! កុំប្រាប់ពាក្យ',
  imposterHint: 'អ្នកមិនដឹងពាក្យ! ព្យាយាមលាក់ខ្លួន',
  doneNext: 'ហេីយ → ផ្ទេរឱ្យ',
  doneAll: 'ហេីយ → ចាប់ផ្ដើមជជែក',
  discussTitle: 'ជជែករកអ្នកក្លែងបន្លំ!',
  category: 'ប្រភេទ',
  totalPlayers: 'អ្នកលេង',
  imposterCount: 'អ្នកក្លែងបន្លំ',
  revealAnswer: 'បើកលទ្ធផល',
  playAgain: 'លេងម្ដងទៀត',
  changeSetup: 'ផ្លាស់ប្ដូររៀបចំ',
  theImposterWas: 'អ្នកក្លែងបន្លំគឺ',
  secretWord: 'ពាក្យសម្ងាត់',
  revealConfirm: 'ប្រាកដជាចង់ឃើញ?',
  confirmYes: 'បើក',
  confirmNo: 'ថយក្រោយ',
  player: 'ជំហានទី',
  of: 'ក្នុង',
  resetBtn: '↩ កំណត់ឡើងវិញ',
  resetTitle: 'ចង់ធ្វើអ្វី?',
  resetNewRound: '🔄 លេងជុំថ្មី',
  resetHome: '🏠 ទៅទំព័រដើម',
  resetCancel: 'បន្ត',
} : {
  passDevice: 'Pass device to',
  passInstruction: 'Hand it over, then press and hold to reveal',
  holdReveal: 'Hold to Reveal',
  holdHint: 'Hold for 2 seconds',
  holdProgress: 'Holding...',
  citizenRole: 'You are a CITIZEN',
  imposterRole: 'You are the IMPOSTER!',
  theWordIs: 'The secret word is',
  citizenHint: "Remember it — don't give it away!",
  imposterHint: "You don't know the word. Blend in!",
  doneNext: 'Done → Pass to',
  doneAll: 'Done → Start Discussion',
  discussTitle: 'Find the Imposter!',
  category: 'Category',
  totalPlayers: 'Players',
  imposterCount: 'Imposters',
  revealAnswer: 'Reveal Answer',
  playAgain: 'Play Again',
  changeSetup: 'Change Players',
  theImposterWas: 'The Imposter was',
  secretWord: 'Secret word',
  revealConfirm: 'Show the answer to everyone?',
  confirmYes: 'Reveal',
  confirmNo: 'Not yet',
  player: 'Player',
  of: 'of',
  resetBtn: '↩ Reset',
  resetTitle: 'What would you like to do?',
  resetNewRound: '🔄 New Round',
  resetHome: '🏠 Go to Setup',
  resetCancel: 'Keep Playing',
})

const nextPlayerName = computed(() => {
  if (!round.value) return ''
  const nextIdx = round.value.currentIndex + 1
  if (nextIdx >= round.value.playerOrder.length) return ''
  const nextId = round.value.playerOrder[nextIdx]
  return players.value.find(p => p.id === nextId)?.name ?? ''
})

const isLastPlayer = computed(() => {
  if (!round.value) return false
  return round.value.currentIndex >= round.value.playerOrder.length - 1
})

const progressLabel = computed(() => {
  if (!round.value) return ''
  return `${round.value.currentIndex + 1} / ${round.value.playerOrder.length}`
})

// Hold mechanics
function startHold(e: PointerEvent) {
  if (innerPhase.value !== 'passing') return
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  innerPhase.value = 'holding'
  holdStartTime = Date.now()
  holdTimer = setInterval(() => {
    const elapsed = Date.now() - holdStartTime
    holdProgress.value = Math.min(100, (elapsed / HOLD_MS) * 100)
    if (holdProgress.value >= 100) {
      stopHold()
      revealRole()
    }
  }, 16)
}

function stopHold() {
  if (holdTimer) {
    clearInterval(holdTimer)
    holdTimer = null
  }
}

function cancelHold() {
  if (innerPhase.value !== 'holding') return
  stopHold()
  holdProgress.value = 0
  innerPhase.value = 'passing'
}

function revealRole() {
  innerPhase.value = 'revealed'
  holdProgress.value = 0
  showWord.value = true
  if (navigator.vibrate) navigator.vibrate([80, 40, 80])
}

function handleNext() {
  showWord.value = false
  innerPhase.value = 'passing'
  holdProgress.value = 0
  advancePlayer()
}

// Reset / home sheet
const showResetSheet = ref(false)

function openResetSheet() {
  stopHold()
  holdProgress.value = 0
  if (innerPhase.value === 'holding') innerPhase.value = 'passing'
  showResetSheet.value = true
}

function doNewRound() {
  showResetSheet.value = false
  answerRevealed.value = false
  showRevealConfirm.value = false
  innerPhase.value = 'passing'
  holdProgress.value = 0
  startGame()
}

function doGoHome() {
  showResetSheet.value = false
  resetRound()
  answerRevealed.value = false
  navigateTo('/')
}

// Reveal answer flow
const showRevealConfirm = ref(false)
const answerRevealed = ref(false)

function revealAnswer() {
  showRevealConfirm.value = true
}
function confirmReveal() {
  showRevealConfirm.value = false
  answerRevealed.value = true
}

function handlePlayAgain() {
  answerRevealed.value = false
  showRevealConfirm.value = false
  innerPhase.value = 'passing'
  startGame()
}

function handleChangeSetup() {
  resetRound()
  answerRevealed.value = false
  navigateTo('/')
}
</script>

<template>
  <div class="page" v-if="round">

    <!-- ─── PERSISTENT TOP BAR ─── -->
    <div class="game-topbar">
      <span class="topbar-logo">🕵️ Imposter</span>
      <button class="topbar-reset-btn" @click="openResetSheet">{{ t.resetBtn }}</button>
    </div>

    <!-- ─── RESET BOTTOM SHEET ─── -->
    <Transition name="sheet">
      <div v-if="showResetSheet" class="sheet-backdrop" @click.self="showResetSheet = false">
        <div class="reset-sheet">
          <p class="sheet-title">{{ t.resetTitle }}</p>
          <button class="sheet-option new-round" @click="doNewRound">{{ t.resetNewRound }}</button>
          <button class="sheet-option home" @click="doGoHome">{{ t.resetHome }}</button>
          <button class="sheet-option cancel" @click="showResetSheet = false">{{ t.resetCancel }}</button>
        </div>
      </div>
    </Transition>

    <!-- ─── DISCUSSION PHASE ─── -->
    <div v-if="round.phase === 'discussion'" class="fullscreen discuss-phase">
      <div class="discuss-header">
        <div class="discuss-icon">🎭</div>
        <h1 class="discuss-title">{{ t.discussTitle }}</h1>
        <div class="discuss-meta">
          <span class="meta-chip">{{ t.category }}: {{ round.categoryName }}</span>
          <span class="meta-chip">{{ t.totalPlayers }}: {{ players.length }}</span>
          <span class="meta-chip red">{{ t.imposterCount }}: 1</span>
        </div>
      </div>

      <div class="discuss-body">
        <div class="discuss-card">
          <p class="discuss-rule">🟢 <strong>Citizens</strong> — discuss who doesn't know the secret word. Vote them out!</p>
          <p class="discuss-rule">🔴 <strong>Imposter</strong> — figure out the word and blend in. Don't get caught!</p>
        </div>

        <Transition name="fade">
          <div v-if="answerRevealed" class="answer-box">
            <p class="answer-label">{{ t.theImposterWas }}</p>
            <p class="answer-name">{{ imposterPlayer?.name }}</p>
            <p class="answer-label" style="margin-top: 16px;">{{ t.secretWord }}</p>
            <p class="answer-word">{{ round.word }}</p>
          </div>
        </Transition>
      </div>

      <!-- Reveal confirm overlay -->
      <Transition name="fade">
        <div v-if="showRevealConfirm" class="overlay" @click.self="showRevealConfirm = false">
          <div class="confirm-card">
            <p class="confirm-text">{{ t.revealConfirm }}</p>
            <div class="confirm-btns">
              <button class="confirm-no" @click="showRevealConfirm = false">{{ t.confirmNo }}</button>
              <button class="confirm-yes" @click="confirmReveal">{{ t.confirmYes }}</button>
            </div>
          </div>
        </div>
      </Transition>

      <div class="discuss-footer">
        <button v-if="!answerRevealed" class="reveal-btn" @click="revealAnswer">{{ t.revealAnswer }}</button>
        <button class="again-btn" @click="handlePlayAgain">{{ t.playAgain }}</button>
        <button class="setup-btn" @click="handleChangeSetup">{{ t.changeSetup }}</button>
      </div>
    </div>

    <!-- ─── REVEAL PHASE ─── -->
    <div v-else class="fullscreen reveal-phase">
      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-dots">
          <span
            v-for="(_, i) in round.playerOrder"
            :key="i"
            :class="['dot', { done: i < round.currentIndex, active: i === round.currentIndex }]"
          />
        </div>
        <span class="progress-label">{{ progressLabel }}</span>
      </div>

      <!-- ── PASSING (waiting for player to hold) ── -->
      <Transition name="slide" mode="out-in">
        <div v-if="innerPhase === 'passing'" key="passing" class="phase-view">
          <div class="pass-icon">📱</div>
          <p class="pass-to">{{ t.passDevice }}</p>
          <h2 class="pass-name">{{ currentPlayer?.name }}</h2>
          <p class="pass-hint">{{ t.passInstruction }}</p>

          <button
            class="hold-btn"
            @pointerdown="startHold"
            @pointerup="cancelHold"
            @pointerleave="cancelHold"
            @pointercancel="cancelHold"
          >
            <svg class="ring" viewBox="0 0 120 120" width="130" height="130">
              <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
              <circle
                cx="60" cy="60" :r="RADIUS"
                fill="none"
                stroke="#7c6df0"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="CIRCUMFERENCE"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span class="hold-label">{{ t.holdReveal }}</span>
            <span class="hold-hint">{{ t.holdHint }}</span>
          </button>
        </div>

        <!-- ── HOLDING (press and hold countdown) ── -->
        <div v-else-if="innerPhase === 'holding'" key="holding" class="phase-view">
          <div class="pass-icon">📱</div>
          <p class="pass-to">{{ t.passDevice }}</p>
          <h2 class="pass-name">{{ currentPlayer?.name }}</h2>

          <button
            class="hold-btn holding"
            @pointerup="cancelHold"
            @pointerleave="cancelHold"
            @pointercancel="cancelHold"
          >
            <svg class="ring" viewBox="0 0 120 120" width="130" height="130">
              <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
              <circle
                cx="60" cy="60" :r="RADIUS"
                fill="none"
                stroke="#7c6df0"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="strokeOffset"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 0.05s linear;"
              />
            </svg>
            <span class="hold-label holding-label">{{ t.holdProgress }}</span>
            <span class="hold-pct">{{ Math.round(holdProgress) }}%</span>
          </button>
        </div>

        <!-- ── REVEALED ── -->
        <div v-else key="revealed" class="phase-view">
          <Transition name="card-pop" appear>
            <div :class="['role-card', isCurrentImposter ? 'imposter' : 'citizen']">
              <div class="role-icon">{{ isCurrentImposter ? '😈' : '🟢' }}</div>
              <div class="role-title">{{ isCurrentImposter ? t.imposterRole : t.citizenRole }}</div>

              <template v-if="!isCurrentImposter">
                <div class="word-label">{{ t.theWordIs }}</div>
                <div class="word-value">{{ round.word }}</div>
                <div class="role-hint">{{ t.citizenHint }}</div>
              </template>
              <template v-else>
                <div class="role-hint imposter-hint">{{ t.imposterHint }}</div>
              </template>
            </div>
          </Transition>

          <button class="next-btn" @click="handleNext">
            <span v-if="isLastPlayer">{{ t.doneAll }}</span>
            <span v-else>{{ t.doneNext }} {{ nextPlayerName }}</span>
          </button>
        </div>
      </Transition>
    </div>

  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.fullscreen {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ─── Progress bar ─── */
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
  gap: 12px;
}

.progress-dots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  transition: all 0.3s;
}
.dot.done {
  background: rgba(124,109,240,0.5);
}
.dot.active {
  background: #7c6df0;
  box-shadow: 0 0 8px rgba(124,109,240,0.6);
  transform: scale(1.2);
}

.progress-label {
  font-size: 13px;
  color: #6b6980;
  font-weight: 600;
  white-space: nowrap;
}

/* ─── Phase view ─── */
.phase-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  gap: 12px;
  text-align: center;
}

.pass-icon {
  font-size: 48px;
  margin-bottom: 4px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.pass-to {
  font-size: 14px;
  color: #6b6980;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pass-name {
  font-size: 32px;
  font-weight: 800;
  color: #e8e4ff;
  margin-bottom: 4px;
}

.pass-hint {
  font-size: 14px;
  color: #4a4a6a;
  margin-bottom: 16px;
}

/* ─── Hold button ─── */
.hold-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  border: none;
  background: rgba(124,109,240,0.08);
  border-radius: 50%;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: background 0.15s;
  margin-top: 8px;
}

.hold-btn:active,
.hold-btn.holding {
  background: rgba(124,109,240,0.15);
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hold-label {
  font-size: 14px;
  font-weight: 700;
  color: #a99eff;
  position: relative;
  z-index: 1;
  margin-top: 4px;
}

.holding-label {
  color: #7c6df0;
}

.hold-hint {
  font-size: 11px;
  color: #4a4a6a;
  position: relative;
  z-index: 1;
  margin-top: 2px;
}

.hold-pct {
  font-size: 22px;
  font-weight: 800;
  color: #7c6df0;
  position: relative;
  z-index: 1;
}

/* ─── Role card ─── */
.role-card {
  width: 100%;
  max-width: 340px;
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.role-card.citizen {
  background: linear-gradient(145deg, rgba(16,217,160,0.15), rgba(16,217,160,0.05));
  border: 1.5px solid rgba(16,217,160,0.3);
}

.role-card.imposter {
  background: linear-gradient(145deg, rgba(240,80,110,0.2), rgba(240,80,110,0.05));
  border: 1.5px solid rgba(240,80,110,0.4);
}

.role-icon {
  font-size: 52px;
  line-height: 1;
}

.role-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.citizen .role-title { color: #10d9a0; }
.imposter .role-title { color: #f0506e; }

.word-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b6980;
  margin-top: 4px;
}

.word-value {
  font-size: 42px;
  font-weight: 900;
  color: #e8e4ff;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.role-hint {
  font-size: 13px;
  color: #6b6980;
  margin-top: 4px;
}

.imposter-hint {
  color: rgba(240,80,110,0.7);
  font-weight: 600;
}

.next-btn {
  margin-top: 20px;
  padding: 14px 28px;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  color: #e8e4ff;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.15s;
}

.next-btn:active {
  transform: scale(0.97);
  background: rgba(255,255,255,0.1);
}

/* ─── Discussion phase ─── */
.discuss-phase {
  padding: 24px 20px;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  overflow-y: auto;
}

.discuss-header {
  text-align: center;
  margin-bottom: 24px;
}

.discuss-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.discuss-title {
  font-size: 26px;
  font-weight: 800;
  color: #e8e4ff;
  margin-bottom: 12px;
}

.discuss-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.meta-chip {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  color: #888aaa;
  font-weight: 600;
}

.meta-chip.red {
  border-color: rgba(240,80,110,0.3);
  color: #f0506e;
  background: rgba(240,80,110,0.08);
}

.discuss-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.discuss-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discuss-rule {
  font-size: 14px;
  color: #b0accc;
  line-height: 1.5;
}

.answer-box {
  background: rgba(124,109,240,0.1);
  border: 1.5px solid rgba(124,109,240,0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.answer-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b6980;
  margin-bottom: 6px;
}

.answer-name {
  font-size: 28px;
  font-weight: 800;
  color: #f0506e;
}

.answer-word {
  font-size: 32px;
  font-weight: 900;
  color: #e8e4ff;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.confirm-card {
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.confirm-text {
  font-size: 16px;
  font-weight: 600;
  color: #e8e4ff;
  margin-bottom: 20px;
}

.confirm-btns {
  display: flex;
  gap: 10px;
}

.confirm-no {
  flex: 1;
  padding: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #888aaa;
  font-size: 15px;
  font-weight: 600;
}

.confirm-yes {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #7c6df0, #5a4fcf);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 700;
}

/* Footer buttons */
.discuss-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reveal-btn {
  padding: 14px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  color: #e8e4ff;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.15s;
}

.reveal-btn:active {
  transform: scale(0.98);
}

.again-btn {
  padding: 16px;
  background: linear-gradient(135deg, #7c6df0, #5a4fcf);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(124,109,240,0.3);
  transition: all 0.15s;
}

.again-btn:active {
  transform: scale(0.98);
}

.setup-btn {
  padding: 12px;
  background: transparent;
  border: none;
  color: #6b6980;
  font-size: 14px;
  font-weight: 600;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.card-pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-pop-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

/* ─── Top bar ─── */
.game-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(10,10,20,0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar-logo {
  font-size: 14px;
  font-weight: 700;
  color: #6b6980;
  letter-spacing: 0.02em;
}

.topbar-reset-btn {
  border: 1.5px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #a8a4c8;
  font-size: 13px;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 20px;
  transition: all 0.15s;
}

.topbar-reset-btn:active {
  background: rgba(255,255,255,0.1);
  transform: scale(0.96);
}

/* ─── Reset sheet ─── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: flex-end;
}

.reset-sheet {
  width: 100%;
  background: #1a1a2e;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px 20px 0 0;
  padding: 20px 16px;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sheet-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b6980;
  text-align: center;
  margin-bottom: 4px;
}

.sheet-option {
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}

.sheet-option:active {
  transform: scale(0.98);
}

.sheet-option.new-round {
  background: linear-gradient(135deg, #7c6df0, #5a4fcf);
  color: white;
  border-color: transparent;
}

.sheet-option.home {
  background: rgba(255,255,255,0.05);
  color: #e8e4ff;
  border-color: rgba(255,255,255,0.12);
}

.sheet-option.cancel {
  background: transparent;
  color: #6b6980;
  border-color: transparent;
  font-size: 14px;
}

/* Sheet transition */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .reset-sheet,
.sheet-leave-active .reset-sheet {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .reset-sheet,
.sheet-leave-to .reset-sheet {
  transform: translateY(100%);
}
</style>
