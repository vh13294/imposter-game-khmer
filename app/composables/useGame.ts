import { CATEGORIES } from '~/data/words'

export interface Player {
  id: string
  name: string
}

export interface GameRound {
  word: string
  categoryName: string
  imposterId: string
  playerOrder: string[]
  currentIndex: number
  phase: 'reveal' | 'discussion'
}

export function useGame() {
  const players = useState<Player[]>('players', () => [])
  const language = useState<'en' | 'km'>('language', () => 'en')
  const categoryId = useState<string>('categoryId', () => 'animals')
  const round = useState<GameRound | null>('round', () => null)

  if (import.meta.client) {
    const storedPlayers = localStorage.getItem('ig-players')
    if (storedPlayers && players.value.length === 0) {
      try { players.value = JSON.parse(storedPlayers) } catch {}
    }
    const storedLang = localStorage.getItem('ig-lang')
    if (storedLang === 'en' || storedLang === 'km') language.value = storedLang
    const storedCat = localStorage.getItem('ig-cat')
    if (storedCat) categoryId.value = storedCat

    watch(players, val => localStorage.setItem('ig-players', JSON.stringify(val)), { deep: true })
    watch(language, val => localStorage.setItem('ig-lang', val))
    watch(categoryId, val => localStorage.setItem('ig-cat', val))
  }

  function addPlayer(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    players.value = [...players.value, { id, name: trimmed }]
  }

  function removePlayer(id: string) {
    players.value = players.value.filter(p => p.id !== id)
  }

  function renamePlayer(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    players.value = players.value.map(p => p.id === id ? { ...p, name: trimmed } : p)
  }

  function startGame() {
    const cats = CATEGORIES[language.value]
    const cat = cats.find(c => c.id === categoryId.value) ?? cats[0]!
    const wordList = cat.words
    const word = wordList[Math.floor(Math.random() * wordList.length)]!
    const shuffled = [...players.value.map(p => p.id)].sort(() => Math.random() - 0.5)
    const imposterId = shuffled[Math.floor(Math.random() * shuffled.length)]!

    round.value = {
      word,
      categoryName: cat.name,
      imposterId,
      playerOrder: shuffled,
      currentIndex: 0,
      phase: 'reveal',
    }
  }

  function advancePlayer() {
    if (!round.value) return
    const next = round.value.currentIndex + 1
    if (next >= round.value.playerOrder.length) {
      round.value = { ...round.value, phase: 'discussion' }
    } else {
      round.value = { ...round.value, currentIndex: next }
    }
  }

  function resetRound() {
    round.value = null
  }

  const currentPlayer = computed<Player | null>(() => {
    if (!round.value || round.value.phase === 'discussion') return null
    const id = round.value.playerOrder[round.value.currentIndex]
    return players.value.find(p => p.id === id) ?? null
  })

  const isCurrentImposter = computed<boolean>(() => {
    if (!round.value || !currentPlayer.value) return false
    return currentPlayer.value.id === round.value.imposterId
  })

  const imposterPlayer = computed<Player | null>(() => {
    if (!round.value) return null
    return players.value.find(p => p.id === round.value!.imposterId) ?? null
  })

  return {
    players,
    language,
    categoryId,
    round,
    currentPlayer,
    isCurrentImposter,
    imposterPlayer,
    addPlayer,
    removePlayer,
    renamePlayer,
    startGame,
    advancePlayer,
    resetRound,
  }
}
