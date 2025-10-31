

async function callAddToMiniApps() {
  const a = window.sdk?.actions;
  if (!a) throw new Error('no sdk');

  // must await ready right before calling sheet
  try { await a.ready(); } catch {}

  // check capability when available
  try {
    if (typeof a.isAvailable === 'function') {
      const ok = await a.isAvailable('addToMiniApps');
      if (!ok) throw new Error('unavailable');
    }
  } catch {}

  if (typeof a.addToMiniApps === 'function') {
    return a.addToMiniApps();                         // current
  }
  if (typeof a.openAddToMiniApps === 'function') {
    return a.openAddToMiniApps();                     // alt
  }
  if (typeof a.addToFavorites === 'function') {
    return a.addToFavorites();                        // legacy
  }
  throw new Error('no add action');
}

function maybeShowAddToMiniAppsPrompt() {
  try {
    if (!window.sdk) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'miniapp-prompt-overlay';
    const box = document.createElement('div');
    box.className = 'miniapp-prompt-box';
    box.innerHTML = `
      <div class="miniapp-prompt-title">Add to Mini Apps</div>
      <div class="miniapp-prompt-text">Pin Sand Tetris to your Mini Apps for quick access</div>
      <div class="miniapp-prompt-actions">
        <button class="miniapp-prompt-add">Add</button>
        <button class="miniapp-prompt-later">Not now</button>
      </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    box.querySelector('.miniapp-prompt-add').onclick = async () => {
      try {
        await callAddToMiniApps();
        localStorage.setItem('st_add_prompt_v1', 'done');  // mark only on success
        close();
      } catch (e) {
        // outside Warpcast or unsupported SDK
        alert('Open this game inside Warpcast, then try again');
        // do not mark done so it can trigger later
      }
    };

    box.querySelector('.miniapp-prompt-later').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  } catch {}
}

// keep this near your bootstrap code, once per load
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(maybeShowAddToMiniAppsPrompt, 600);
  });

  // use injected SDK only
  (async () => {
    const injected = typeof window !== 'undefined' && window.sdk && window.sdk.actions;
    if (injected) {
      try { await window.sdk.actions.ready(); } catch {}
    } else {
      console.log('Open inside Warpcast to add the Mini App');
    }
  })();
})();


export class Tetris{


    constructor(host){
        this.host = host
        this.lastFrameTime = 0
        this.width = 300;
        this.height = 500;
        this.w = 5;
        this.rows
        this.cols
        this.grid
        this.grid2
        this.nextGrid
        this.cells = []
        this.music = new Audio('./audio/music.mp3')
        this.music.volume = .2;   
        this.music.loop = true;
        
        this.ctx
        this.frameDelay = 30;
        this.fell = false;
        this.moveRight = false;
        this.moveLeft = false;
        this.play = true;
        this.chargeCount = 0;
        this.destroyArray = []
        this.registerKeyListeners()
        this.pronadjen = false
        this.rotate = false
        this.ctx2

        this.score = 0.0;
        this.level = 1;
        this.blocks = 0;
        this.active = false;

        this.isMoving=false;
        this.isRotating=false;
    }

    //Listening for keys for moving block left/right or rotating block
    registerKeyListeners(){
        window.addEventListener('keydown', (event)=>{
            if(event.key === 'ArrowLeft' || event.key === 'a'){
                this.moveLeft = true;
            } else if(event.key === 'ArrowRight' || event.key === 'd'){
                this.moveRight = true;
            }
        })
    
        window.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft'|| event.key === 'a') {
                this.moveLeft = false;
                // this.stopMoving();
            } else if (event.key === 'ArrowRight' || event.key === 'd') {
                this.moveRight = false;
                // this.stopMoving();
            }
        }); 

        window.addEventListener('keydown', (event)=>{
            if((event.key === 'ArrowUp' || event.key === 'w') && !event.repeat){
                this.rotate = true;
                // this.rotation()
            }
        })

// hard-drop on ArrowDown or S
window.addEventListener('keydown', (event) => {
  if ((event.key === 'ArrowDown' || event.key === 's') && !event.repeat) {
    this.hardDrop();
  }
});

    }

    hardDrop(){
  if (!this.active) return;

  // keep shifting the current piece (cells with initial === true) straight down
  let moved = true;
  while (moved) {
    moved = false;
    for (let j = this.rows - 2; j >= 0; j--) {      // from bottom-1 up
      for (let i = 0; i < this.cols; i++) {
        const c = this.grid[i][j];
        if (c.block && c.initial) {
          const below = this.grid[i][j + 1];
          if (below && !below.block) {
            // move one step down
            this.grid[i][j].block = false;
            this.grid[i][j].initial = false;

            below.block = true;
            below.initial = true;
            below.color = c.color;
            below.blockColor = c.blockColor;
            below.center = c.center;

            moved = true;
          }
        }
      }
    }
  }

  // settle: remove initial flags so it becomes static
  for (let i = 0; i < this.cols; i++) {
    for (let j = 0; j < this.rows; j++) {
      if (this.grid[i][j].initial) this.grid[i][j].initial = false;
    }
  }

  this.swapGrids();
  this.checkHits();

  // now we’re ready for a new piece next frame
  this.fell = true;
}

    //START
    start(){    

        
        //MAIN
        const gameContainer = document.createElement('div');
        gameContainer.classList.add('game-container');
        this.host.appendChild(gameContainer);


        //HEADER
        const gameTitle = document.createElement('div')
        gameTitle.classList.add('game-title')
        gameContainer.appendChild(gameTitle)

        const titleText = document.createElement('span')
        titleText.classList.add('title-text')
        titleText.innerHTML = "SAND TETRIS"
        gameTitle.appendChild(titleText)

        //GAME BODY
        const gameBody  = document.createElement('div')
        gameBody.classList.add('game-body')
        gameContainer.appendChild(gameBody)


        //LEFT PART - GAME DISPLAY
        const gameDisplay = document.createElement('div')
        gameDisplay.classList.add('game-display')
        gameBody.appendChild(gameDisplay)

        //POP-UPS on game display
        //STARTING SCREEN
        const startScreen = document.createElement('div')
        startScreen.classList.add('start-screen')
        gameDisplay.appendChild(startScreen)

        // move title into start screen
const homeTitle = document.createElement('div')
homeTitle.classList.add('home-title')
homeTitle.innerHTML = "SAND TETRIS"
startScreen.appendChild(homeTitle)


        //WELCOME
        const ssDivWelcome = document.createElement('div')
        ssDivWelcome.classList.add('ss-div-welcome')
        startScreen.appendChild(ssDivWelcome);

        const ssTextWelcome = document.createElement('span')
        ssTextWelcome.innerHTML = "WELCOME"
        ssTextWelcome.classList.add('ss-text-welcome')
        ssDivWelcome.appendChild(ssTextWelcome)

        //START BUTTON 
        const ssButtonStart = document.createElement('button')
        ssButtonStart.classList.add('ss-button-start')
        startScreen.appendChild(ssButtonStart);

        const textStart = document.createElement('span')
        textStart.innerHTML = "START"
        textStart.classList.add('textStart')
        ssButtonStart.appendChild(textStart)

ssButtonStart.onclick = () => {
  startScreen.style.display = 'none';
  divLine.style.display = 'flex';
  document.querySelector('.form-wrapper')?.classList.add('active');
  // hide favorites prompt if it’s still visible
  try { favPrompt.style.display = 'none'; } catch {}
  // reset state first
  this.resetGame();
  this.active = true;

  // music on
  try {
    this.music.currentTime = 0;
    this.music.play().catch(()=>{});
  } catch {}

  // pause icon state
  if (this.pauseEl) {
    this.pauseEl.on = '1';
    this.pauseEl.style.backgroundImage = 'url(./images/pause.png)';
    textPause.style.display = 'none';
  }

  this.dodajFiguru();
  this.swapGrids();
};


        //ABOUT BUTTON
        const ssDivAbout = document.createElement('div')
        ssDivAbout.classList.add('ss-div-about')
        startScreen.appendChild(ssDivAbout);

        const ssTextAbout = document.createElement('span')
        ssTextAbout.innerHTML = "ABOUT"
        ssTextAbout.classList.add('ss-text-about')
        ssDivAbout.appendChild(ssTextAbout)



        //PAUSE
        const divPause = document.createElement('div')
        divPause.classList.add('div-pause')
        gameDisplay.appendChild(divPause)

        const textPause = document.createElement('span')
        textPause.classList.add('text-pause')
        textPause.innerHTML = "PAUSE"
        divPause.appendChild(textPause)


        //END SCREEN
        const endScreen = document.createElement('div')
        endScreen.classList.add('end-screen')
        gameDisplay.appendChild(endScreen)


        const esDivGameOver = document.createElement('div')
        esDivGameOver.classList.add('es-div-game-over')
        endScreen.appendChild(esDivGameOver);

        const textGameOver = document.createElement('span')
        textGameOver.innerHTML = "GAME OVER"
        textGameOver.classList.add('es-text-game-over')
        esDivGameOver.appendChild(textGameOver)


        //LOSE-LINE
        const divLine = document.createElement('div')
        divLine.classList.add('lose-line')
        gameDisplay.appendChild(divLine)

        //REPLAY BUTTON
        const esReplay = document.createElement('button')
        esReplay.classList.add('es-replay')
        endScreen.appendChild(esReplay);

        const esTextReplay = document.createElement('span')
        esTextReplay.innerHTML = "REPLAY"
        esTextReplay.classList.add('es-text-replay')
        esReplay.appendChild(esTextReplay)

esReplay.onclick = () => {
  endScreen.style.display = 'none';
  divLine.style.display = 'flex';

  // reset state first
  this.resetGame();
  this.active = true;

  // music on
  try {
    this.music.currentTime = 0;
    this.music.play().catch(()=>{});
  } catch {}

  // pause icon state
  if (this.pauseEl) {
    this.pauseEl.on = '1';
    this.pauseEl.style.backgroundImage = 'url(./images/pause.png)';
    textPause.style.display = 'none';
  }

  this.dodajFiguru();
  this.swapGrids();
};



      // OPTIONS

// A) Sound button on HOME (start screen), bottom-right
const soundDivHome = document.createElement('div');
soundDivHome.classList.add('settings-div', 'settings-home');
startScreen.appendChild(soundDivHome);

const sound = document.createElement('div');
sound.classList.add('settings-volume');
soundDivHome.appendChild(sound);
sound.on = true;

// allow toggling even on home (no this.active check)
sound.onclick = () => {
  sound.on = !sound.on;
  sound.style.backgroundImage = sound.on
    ? 'url(./images/volume-on.png)'
    : 'url(./images/volume-off.png)';
  this.music.volume = sound.on ? 0.2 : 0.0;
};

// B) Pause button stays in-game (inside the game display)
const controlsDiv = document.createElement('div');
controlsDiv.classList.add('settings-div');
gameDisplay.appendChild(controlsDiv);

const pause = document.createElement('div');
pause.classList.add('settings-pause');
controlsDiv.appendChild(pause);
pause.on = '1';

pause.onclick = () => {
  if (this.active) {
    if (pause.on === '1') {
      this.music.pause();
      pause.on = '2';
      pause.style.backgroundImage = 'url(./images/play.png)';
      textPause.style.display = 'flex';
      this.active = false;
    }
  } else if (pause.on === '2') {
    this.music.play();
    pause.on = '1';
    pause.style.backgroundImage = 'url(./images/pause.png)';
    textPause.style.display = 'none';
    this.active = true;
  }
};



        this.createForm(gameBody)
        this.updateScore();
        this.updateBlocks();
        this.updateLevel();
        this.createCanvasNext()
        this.createCanvas(gameDisplay)
        this.enableGestures(this.canvas);
        this.draw()
        this.animate()
setTimeout(maybeShowAddToMiniAppsPrompt, 0);
    }  

    enableGestures(target){
  // thresholds
  const SWIPE_PIX = 24;      // how far to count as a swipe
  const REPEAT_MS = 120;     // min time between repeated left/right on long swipe

  let sx = 0, sy = 0, ex = 0, ey = 0;
  let lastMoveTime = 0;

  // start
  target.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    sx = ex = t.clientX;
    sy = ey = t.clientY;
    e.preventDefault();
  }, { passive: false });

  // move: horizontal swipe nudges left or right, vertical down triggers drop
  target.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    ex = t.clientX;
    ey = t.clientY;

    const dx = ex - sx;
    const dy = ey - sy;
    const now = performance.now();

    // horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_PIX && (now - lastMoveTime) > REPEAT_MS) {
      if (dx > 0) {
        this.moveRight = true; setTimeout(() => this.moveRight = false, 80);
      } else {
        this.moveLeft = true;  setTimeout(() => this.moveLeft  = false, 80);
      }
      lastMoveTime = now;
      sx = ex; sy = ey; // allow chaining swipes without lifting
    }

    // swipe down to drop
    if (Math.abs(dy) > Math.abs(dx) && dy > SWIPE_PIX) {
      this.fell = true;
      sx = ex; sy = ey;
    }

    e.preventDefault();
  }, { passive: false });

  // end: a light tap rotates
  target.addEventListener('touchend', () => {
    const dx = ex - sx;
    const dy = ey - sy;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      this.rotate = true;    // tap to rotate
    }
  }, { passive: false });
}

    //CREATES FORM
    createForm(host){

        let formWrapper = document.createElement('div')
        formWrapper.classList.add('form-wrapper')
        host.appendChild(formWrapper)

        //Next
        let fNextText = document.createElement('label')
        fNextText.innerHTML = "NEXT"
        formWrapper.appendChild(fNextText)
        
        const fNextDisplay = document.createElement('div')
        fNextDisplay.classList.add('f-next-display', 'for')
        formWrapper.appendChild(fNextDisplay)

        //Score
        let fScoreText = document.createElement('label')
        fScoreText.innerHTML = "SCORE"
        formWrapper.appendChild(fScoreText)

        const fScoreDisplay = document.createElement('div')
        fScoreDisplay.classList.add('f-score-display', 'for')
        formWrapper.appendChild(fScoreDisplay)

        let fScoreInnerText = document.createElement('span')
        fScoreInnerText.classList.add('inner-text', 'scoreText')
        fScoreDisplay.appendChild(fScoreInnerText)


        //Level
        let fLevelText = document.createElement('label')
        fLevelText.innerHTML = "LEVEL"
        formWrapper.appendChild(fLevelText)

        const fLevelDisplay = document.createElement('div')
        fLevelDisplay.classList.add('form3', 'for')
        formWrapper.appendChild(fLevelDisplay)

        let fLevelInnerText = document.createElement('span')
        fLevelInnerText.classList.add('inner-text', 'levelText')
        fLevelDisplay.appendChild(fLevelInnerText)


        //Blocks
        let fBlocksText = document.createElement('label')
        fBlocksText.innerHTML = "BLOCKS"
        formWrapper.appendChild(fBlocksText)

        const fBlocksDisplay = document.createElement('div')
        fBlocksDisplay.classList.add('form4', 'for')
        formWrapper.appendChild(fBlocksDisplay)

        let fBlocksInnerText = document.createElement('span')
        fBlocksInnerText.classList.add('inner-text', 'blocksText')
        fBlocksDisplay.appendChild(fBlocksInnerText)
    }

    //UPDATE FORM
    updateScore(){
        let score = document.body.querySelector('.scoreText');
        score.innerHTML = this.score;
    }
    updateLevel(){
        let levels = document.body.querySelector('.levelText');
        if(this.score > 3800 * this.level){
            if(this.frameDelay>5){
                this.frameDelay-=2;
            }
            this.level++
        }

        levels.innerHTML = this.level;
    }
    updateBlocks(){
        let blocks = document.body.querySelector('.blocksText');
        blocks.innerHTML = this.blocks;
    }

    //UPDATING CURRENT GRID AND CALCULATING NEXT BASED ON CURRENT
    draw(){
        //IF BLOCK TOUCHES THE LINE GAME IS OVER
        for(let i = 0; i < 30; i++){
            if(this.grid[i][16].block && !this.grid[i][16].initial){
                let eS = document.querySelector('.end-screen')                
                eS.style.display = 'flex'
                this.music.pause()
                this.active = false;
                //RESET LINE
                let divLine = document.querySelector('.lose-line')
                divLine.style.display = 'none'
                //RESET NEXT-GRID
                this.ctx2.fillStyle = 'black'
                this.ctx2.fillRect(0, 0, 120, 120)
                break;
            }
        }
        //FILLING CURRENT GRID
        for(let i = 0; i < this.cols; i++){
            for(let j = 0; j < this.rows; j++){
                if(this.grid[i][j].block == false) //&& j!=16)
                    this.ctx.fillStyle = 'black'
                else
                this.ctx.fillStyle = this.grid[i][j].color//this.grid[i][j].blockColor//color


                this.ctx.fillRect(i*this.w,j*this.w,this.w, this.w);
                this.grid2[i][j] = {
                    x: i,
                    y: j,
                    color: 'background',
                    blockColor: 'background',
                    block: false,
                    initial: false,
                    visited: false,
                    center: false
                }
            }
        }
    
        //CALCULATING GRID 2
        for(let j = this.rows-1; j >= 0; j--){
            for(let i = this.cols-1; i >= 0; i--){  
                let state = this.grid[i][j]
                if(state.block == true){
                    let below = this.grid[i][j+1]
                    if(below != undefined && below.block == false){
                        this.grid[i][j].block = false;
                        this.grid[i][j+1].block = true;
                        this.grid2[i][j+1].block = true;
                        this.grid2[i][j+1].initial = this.grid[i][j].initial
                        this.grid2[i][j+1].color = this.grid[i][j].color
                        this.grid2[i][j+1].blockColor = this.grid[i][j].blockColor
                        this.grid2[i][j+1].center = this.grid[i][j].center
                        this.grid[i][j+1].center = false;

                    }
                    else if(below != undefined && below.block == true){
                        let dRight;
                        let dLeft;
                        if(this.grid[i][j].initial){
                            this.fell = true;
                        }
                        let z = Math.random();
                        if(i<59){
                            dRight = this.grid[i+1][j+1]
                        }else{
                            dRight=undefined;
                        }
                        if(i>0){
                            dLeft = this.grid[i-1][j+1]
                        }else{
                            dLeft = undefined;
                        }
                        //PROVERA DOLE DESNO
                        if(dRight != undefined && dRight.block === false){
                                this.grid[i][j].block  = false                                
                                this.grid[i+1][j+1].block  = true
                                this.grid[i+1][j+1].initial = true;
                                this.grid2[i+1][j+1].block  = true
                                this.grid2[i+1][j+1].initial  = this.grid[i][j].initial
                                this.grid2[i+1][j+1].color  = this.grid[i][j].color
                                this.grid2[i+1][j+1].blockColor  = this.grid[i][j].blockColor
                        }
                        //PROVERA DOLE LEVO
                        else if(dLeft != undefined && dLeft.block === false && z>0.4){                                
                                this.grid[i][j].block  = false                                
                                this.grid[i-1][j+1].block  = true
                                this.grid[i-1][j+1].initial  = true
                                this.grid2[i-1][j+1].block  = true
                                this.grid2[i-1][j+1].initial  = this.grid[i][j].initial
                                this.grid2[i-1][j+1].color  = this.grid[i][j].color
                                this.grid2[i-1][j+1].blockColor  = this.grid[i][j].blockColor
                        }
                        //OSTANE TU GDE JESTE JER NEMA GDE DA PADNE?
                        else{
                            this.grid2[i][j].block = true;
                            this.grid2[i][j].initial = this.grid[i][j].initial
                            this.grid2[i][j].color = this.grid[i][j].color
                            this.grid2[i][j].blockColor = this.grid[i][j].blockColor
                            if(this.grid2[i][j].initial){
                                this.fell = true;
                            }

                        }
                    }
                    else{
                        this.grid2[i][j].block = true;
                        this.grid2[i][j].initial = this.grid[i][j].initial;
                        this.grid2[i][j].color = this.grid[i][j].color;
                        this.grid2[i][j].blockColor = this.grid[i][j].blockColor;
                        if(this.grid2[i][j].initial){
                            this.fell = true;
                        }
                    }

                }
                if(i==0 && j==0 && this.fell == true){
                    this.grid2.forEach(e=>{
                        e.forEach(e2 =>{
                            if(e2.initial)
                            e2.initial = false;
                        })
                    })
                    this.grid.forEach(e=>{
                        e.forEach(e2 =>{
                            if(e2.initial)
                            e2.initial = false;
                        })
                    }) 
                }
            }
        }

        if(this.rotate){
            this.rotation()
        }
        if(this.moveRight || this.moveLeft){
            this.checkForMoves()
        } 
        if(this.fell == true){
            this.dodajFiguru().then(()=>{
                this.fell = false
                this.swapGrids()
                this.checkHits()
            })
        }else{
            this.swapGrids()
            this.checkHits()
        }
    }

    checkForMoves(){
        // if(!this.rotate){
        
        if(this.moveRight){
            let val = true;
            for(let x = 0; x < this.rows; x++){
                if(this.grid2[this.cols-1][x].initial == true)
                    val = false;
            }
            
            for(let i = this.cols-2; i >= 0; i--){ 
                for(let j = 0; j < this.rows; j++){
                    if(val && this.grid2[i][j].block == true && this.grid2[i][j].initial == true &&  this.grid2[i+1][j].block == false){
                        this.grid2[i][j].block = false
                        this.grid2[i][j].initial = false
                        this.grid2[i+1][j].block = true
                        this.grid2[i+1][j].initial = true
                        this.grid2[i+1][j].color = this.grid2[i][j].color
                        this.grid2[i+1][j].blockColor = this.grid2[i][j].blockColor
                        this.grid2[i+1][j].center = this.grid2[i][j].center
                        // this.grid2[i][j].center = false
                    }
                }
            }
            
            
            
        }
        if(this.moveLeft){
            
            let val = true;
            for(let x = 0; x < this.rows; x++){
                if(this.grid2[0][x].initial == true)
                    val = false;
            }
            
            for(let i = 1; i < this.cols; i++){  
                for(let j = 0; j < this.rows; j++){
                    if(val && this.grid2[i][j].block == true && this.grid2[i][j].initial == true && this.grid2[i-1][j].initial == false){
                        this.grid2[i][j].block = false
                        this.grid2[i][j].initial = false
                        
                        this.grid2[i-1][j].block = true
                        this.grid2[i-1][j].initial = true
                        this.grid2[i-1][j].color =  this.grid2[i][j].color
                        this.grid2[i-1][j].blockColor =  this.grid2[i][j].blockColor
                        this.grid2[i-1][j].center = this.grid2[i][j].center
                    }

                    
                }
            }
        }
    }
    
    checkHits(){
        let lastColor = null
        for(let j = this.rows-1; j >= 0; j--){                    //od 99 do 0
            let currentColor = this.grid2[0][j].blockColor;       //boja poslednjeg elementa u prvoj koloni
            if(this.grid2[0][j].block == true){                   //ako postoji kockica koja je pala na to polje
                if(currentColor != lastColor && this.pronadjen == false){   //ovde greska jer nastavlja dalje                 //ako je njena boja razlicita od prethodne
                    this.checkDepleto(j)
                }
                lastColor = currentColor;                         //prethodna boja postaje trenutna
            }
            else{
                break;                                            //ako nije zauzeta dole levo kockica onda nisu ni one iznad nje
            }
        }    
    }

    checkDepleto(j){
        let current = {
            x: 0,
            y: j
        }
        let color = this.grid2[0][j].blockColor;
        let niz = []
        niz.push(this.grid2[0][j]);
        let rightSideReach = false;


        while(niz.length!=0){
            let current = niz.pop();
            let x = current.x
            let y = current.y
            this.grid2[x][y].visited = true;
            this.destroyArray.push(current);

            if(current.x == 59){
                rightSideReach = true;
            }
            //LEVODESNOGOREDOLE
            if(y > -1 && y < this.rows){
                //dole
                if(y < 99){
                    if(this.grid2[x][y+1].block == true && this.grid2[x][y+1].blockColor == color && this.grid2[x][y+1].visited == false && this.grid2[x][y+1].initial==false){
                        niz.push({x: x, y: y+1})
                    }
                }
                if(y > 0){

                    if(this.grid2[x][y-1].block == true && this.grid2[x][y-1].blockColor == color && this.grid2[x][y-1].visited == false && this.grid2[x][y-1].initial==false){
                        niz.push({x: x, y: y-1})
                    }
                }
            }
            if(x > -1 && x < this.cols){
                if(x < 59){
                    if(this.grid2[x+1][y].block == true && this.grid2[x+1][y].blockColor == color && this.grid2[x+1][y].visited == false&& this.grid2[x+1][y].initial==false ){
                        niz.push({x: x+1, y: y})
                    }
                }
                if(x>0){
                    if(this.grid2[x-1][y].block == true && this.grid2[x-1][y].blockColor == color && this.grid2[x-1][y].visited == false&& this.grid2[x-1][y].initial==false){
                        niz.push({x: x-1, y: y})
                    }
                }
            }
            //UKOSO
            if (y<this.rows-1 && x < this.cols-1){
                if(this.grid2[x+1][y+1].block == true && this.grid2[x+1][y+1].blockColor == color && this.grid2[x+1][y+1].visited == false && this.grid2[x+1][y+1].initial==false){
                    niz.push({x: x+1, y: y+1})
                } 
            }
            if(y< this.rows-1 && x>0){
                if(this.grid2[x-1][y+1].block == true && this.grid2[x-1][y+1].blockColor == color && this.grid2[x-1][y+1].visited == false && this.grid2[x-1][y+1].initial==false){
                    niz.push({x: x-1, y: y+1})
                } 
            }
            if(y>0 && x > 0){
                if(this.grid2[x-1][y-1].block == true && this.grid2[x-1][y-1].blockColor == color && this.grid2[x-1][y-1].visited == false && this.grid2[x-1][y-1].initial==false){
                    niz.push({x: x-1, y: y-1})
                } 
            }
            if(y>0 && x<this.cols-1){
                if(this.grid2[x+1][y-1].block == true && this.grid2[x+1][y-1].blockColor == color && this.grid2[x+1][y-1].visited == false && this.grid2[x+1][y-1].initial==false){
                    niz.push({x: x+1, y: y-1})
                } 
            }


        }
        if(rightSideReach && this.destroyArray.length !=0){
            this.play=false;
            this.pronadjen = true;
        }else{
            this.destroyArray.forEach(x=>{
                this.grid2[x.x][x.y].visited = false;
            })
            this.destroyArray.length = 0;

        }

            
        
            
    }

    destroyAnimation(){

        // console.log(this.chargeCount);
        if(this.chargeCount < 10){
            if(this.chargeCount%2==0){
                this.destroyArray.forEach(x=>{
                //this.grid2[x.x][x.y].visited = false;
                this.grid2[x.x][x.y].color = 'white';
                })
            }else{
                this.destroyArray.forEach(x=>{
                    this.grid2[x.x][x.y].color = 'green';
                })
            }
        }else if(this.chargeCount < 15){
            if(this.destroyArray.length!=0){
                this.score+= this.destroyArray.length + Math.floor(this.destroyArray.length*0.5);
                this.updateScore()
                this.updateLevel()
                this.blocks+= this.destroyArray.length
                this.updateBlocks()
                this.unisti().then(()=>{
                    this.play = true
                    this.swapGrids()
                    this.chargeCount = 0
                    this.destroyArray.length = 0;
                    this.pronadjen = false;
                });
            }        
        }
        this.chargeCount++;
        for(let i = 0; i < this.cols; i++){
            for(let j = 0; j < this.rows; j++){
                if(this.grid2[i][j].block == false)
                    this.ctx.fillStyle = 'black'
                else
                    this.ctx.fillStyle = this.grid2[i][j].color//this.grid[i][j].blockColor//color
            
                this.ctx.fillRect(i*this.w,j*this.w,this.w, this.w);
            }
        }
    }

    async unisti(){
    this.destroyArray.forEach(x=>{
        this.grid2[x.x][x.y].visited = false;
        this.grid2[x.x][x.y].block = false;
            })
    }
    rotation(){
        let obj = null;
        this.grid2.forEach(row =>{
            if(!obj){
                obj = row.find(cell => cell.center === true);
            }
        })

        if(obj.x<4){
            obj.x=4;
        }
        if(obj.x>this.cols-8){
            obj.x=this.cols-8
        }
        if(obj.y>this.rows-8){
            obj.y=this.rows-8
        }
        
        let matrix = Array.from({ length: 12 }, () => new Array(12).fill(0));

        //samo prebacimo sve okolko figure u novu matricu
        for(let i = obj.x-4; i< obj.x+8;i++){
            for(let j = obj.y-4; j< obj.y+8;j++){
                matrix[i-obj.x+4][j-obj.y+4] = {...this.grid2[i][j]};
            }
        }

        //zarotiramo te vrednosti
        const rotatedMatrix = Array.from({ length: 12 }, () => new Array(12).fill(0));
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 12; j++) {
                rotatedMatrix[j][11 - i] = {...matrix[i][j]};
            }
        }
        for(let i = obj.x-4; i< obj.x+8;i++){
            for(let j = obj.y-4; j< obj.y+8;j++){
                
                if(this.grid2[i][j].initial){
                    this.grid2[i][j] = {
                        x: i,
                        y: j,
                        color: 'background',
                        blockColor: 'background',
                        block: false,
                        initial: false,
                        visited: false,
                        center: false
                    }
                }
            }
        }


        for(let i = obj.x-4; i< obj.x+8;i++){
            for(let j = obj.y-4; j< obj.y+8;j++){

                const rotatedValue = rotatedMatrix[i - obj.x + 4][j - obj.y + 4];

                if (rotatedValue.initial) {
                    this.grid2[i][j] = {...rotatedValue}; 
                }
            }
        }

        this.rotate = false;
    }

    fillNextFigure(){

        let figurines = Math.floor(Math.random() * 3)
        figurines  = 0;
        let colors = ['red', 'blue', 'green', 'yellow']
        let rnd = Math.floor(Math.random() * colors.length);

        // i>1.  i<2.   j>3.  j<4.
        //0 -> SQUARE
        //1 -> LINE
        //2 -> T SHAPE
        //3 -> Z
        //4 -> L
        let restrictions = [[1 , 10, 1, 10],
                            [-1 , 12,  2,  8],
                            [],//[-1 , 12, 7, 12],
                            [],
                            []]
        let t = Math.floor(Math.random() * restrictions.length)
        // console.log(t)
        // t = 3
        // rnd = 3;
        for(let i = 0; i < 12; i++){
            for(let j = 0; j< 12; j++){
                if((t==0 && i > 1 && i < 10 && j > 1 && j < 10)
                || (t==1 && i > -1 && i < 12 && j > 2 && j < 8)
                || (t==2 && j > 3 && j < 8 || t==2 && i > 3 && i < 8 && j < 4) 
                || (t==3 && (i<8  && j < 4 || i < 4 && j < 4 || i > 3 && j < 8 && j > 3))
                || (t==4 && (i>3 && i<8 || i > 4 && j > 7))){
                                        //54 31 97
                    this.nextGrid[i][j].block = true;
                    this.nextGrid[i][j].color = rnd == '0' ? this.generateRandomShade({r:255, g:0, b:0}) :
                    rnd == '1' ? this.generateRandomShade({r:0, g:0, b: 255}) : 
                    rnd == '2' ? this.generateRandomShade({r:0, g:255, b: 0}) :
                    // rnd == '3' ? this.generateRandomShade({r:164, g:20, b: 215}) : 0
                    // rnd == '3' ? this.generateRandomShade({r:254, g:238, b: 125}) : 0
                    rnd == '3' ? this.generateRandomShade({r:254, g:160, b: 21}) : 0
                    this.nextGrid[i][j].block = true;
                    this.nextGrid[i][j].initial = true;
                    this.nextGrid[i][j].visited = false;
                    this.nextGrid[i][j].blockColor = colors[rnd];

                }else{
                    this.nextGrid[i][j].block = false;
                    this.nextGrid[i][j].color = 'black';
                }


                if(i > 3 && i < 8 && j > 3 && j < 8){
                    this.nextGrid[i][j].center = true
                }
            }
        }
    }



    async dodajFiguru(){

        if(this.nextGrid[0][0].color == 'initial'){
            this.fillNextFigure()
        }
            
        for(let i = 24; i < 36; i++){
            for(let j = 0; j < 12; j++){
                this.grid2[i][j] = {...this.nextGrid[i-24][j]}
            }
        }
            
        this.fillNextFigure()
        this.updateNextRect()

        this.fell = false;
    }

generateRandomShade(baseColor) {
  const { r, g, b } = baseColor;
  return `rgb(${r}, ${g}, ${b})`; // solid, no shading
}


    swapGrids(){
        this.grid = this.grid2.map(row => row.slice());
    }

    createCanvasNext(){
        const canvas = document.createElement('canvas')
        canvas.classList.add('canva-next')
        canvas.width = 60
        canvas.height = 60
        this.nextGrid = []
        for(let i = 0; i < 12; i++){
            this.nextGrid[i] = []
            for(let j = 0; j< 12; j++){
                this.nextGrid[i][j] = {
                    x: i,
                    y: j,
                    color: 'initial',
                    blockColor: 'red',
                    block: true,
                    initial: true,
                    visited: false,
                    center: false
                }
            }
        }

        let form = document.body.querySelector('.f-next-display')
        form.appendChild(canvas)

        this.ctx2 = canvas.getContext('2d');
        this.ctx2.fillStyle = 'red'
    }

    updateNextRect(){
        for(let i = 0; i < 12; i++){
            for(let j = 0; j< 12; j++){
                this.ctx2.fillStyle = this.nextGrid[i][j].color
                this.ctx2.fillRect(i*5,j*5,5,5)
            }
        }
    }

    resetGame(){

        this.fell = false;
        this.moveRight = false;
        this.moveLeft = false;
        this.play = true;
        this.chargeCount = 0;
        this.pronadjen = false
        this.rotate = false
        this.score = 0.0;
        this.level = 1;
        this.blocks = 0;
        this.active = false;
        this.isMoving=false;
        this.isRotating=false;
        this.frameDelay = 30; // reset speed to normal


        this.updateLevel()
        this.updateBlocks()
        this.updateScore()


        //RESET NEXT-GRID
        for(let i = 0; i < 12; i++){
            for(let j = 0; j < 12; j++){
                this.nextGrid[i][j] = {
                    x: i,
                    y: j,
                    color: 'initial',
                    blockColor: 'red',
                    block: true,
                    initial: true,
                    visited: false,
                    center: false
                }
            }
        }

        this.nextGrid[0][0].color == 'initial'



        //RESETING BOTH GRIDS
        for(let i = 0; i< this.cols; i++){
            for(let j = 0; j <this.rows; j++){
                this.grid[i][j] = {
                    x: i,
                    y: j,
                    color: 'background',
                    blockColor: 'background',
                    block: false,
                    initial: false,
                    visisted: false
                    
                }
                this.grid2[i][j] = {
                    x: i,
                    y: j,
                    color: 'background',
                    blockColor: 'background',
                    block: false,
                    initial: false,
                    visisted: false
                };
            }
        }


    }

    createCanvas(host){
        const canvas = document.createElement('canvas');
        canvas.classList.add('canva')
        canvas.width = this.width;
        canvas.height = this.height;
        this.cols = this.width/this.w;
        this.rows = this.height/this.w;

        this.grid = []
        this.grid2 = []
        for(let i = 0; i< this.cols; i++){
            this.grid[i] = []
            this.grid2[i] = []
            for(let j = 0; j <this.rows; j++){
                this.grid[i][j] = {
                    x: i,
                    y: j,
                    color: 'background',
                    blockColor: 'background',
                    block: false,
                    initial: false,
                    visisted: false
                    
                }
                this.grid2[i][j] = {
                    x: i,
                    y: j,
                    color: 'background',
                    blockColor: 'background',
                    block: false,
                    initial: false,
                    visisted: false
                };
            }
        }

        host.appendChild(canvas);
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

    animate(){
        const currentTime = performance.now()
        if (currentTime - this.lastFrameTime >= this.frameDelay) {
            if(this.play && this.active){
                this.ctx.resetTransform()
                this.ctx.clearRect(0, 0, this.width, this.height)
                this.draw()
                if(this.moveRight || this.moveLeft){
                    this.checkForMoves()
                }

            }
            else if(this.active){
                this.destroyAnimation();
            }
            this.lastFrameTime = currentTime
        }
        requestAnimationFrame(()=>this.animate())
    }
}
