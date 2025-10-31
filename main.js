import { Tetris } from './Tetris.js'
import { sdk } from '@farcaster/miniapp-sdk'

// expose for other files if they need it
window.sdk = sdk

// tag the body so CSS can switch to mini layout
document.body.classList.add('fc-mini')

// mount the game
const mount = document.getElementById('game-root') || document.body
const game = new Tetris(mount)
game.start()

// optional nice-to-have
try { sdk.actions.setTitle('Sand Blast') } catch {}

// call ready after first paint so the tester catches it
requestAnimationFrame(() => {
  setTimeout(() => {
    try { sdk.actions.ready() } catch {}
  }, 0)
})
