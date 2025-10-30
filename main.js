// if your file on disk is tetris.js use this import
import { Tetris } from './Tetris.js'

document.body.classList.add('fc-mini')
// prevent zoom and iOS gestures inside mini frame
document.addEventListener('gesturestart', e => e.preventDefault())
document.addEventListener('gesturechange', e => e.preventDefault())
document.addEventListener('gestureend', e => e.preventDefault())

const mount = document.getElementById('game-root')
const game = new Tetris(mount)
game.start()
