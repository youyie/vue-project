document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 4;
    let tileArray = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    let tileContainer = document.querySelector('.tile-container');
    let realTimeScore = document.querySelector('.RT-score');
    let allTimeHighScore = document.querySelector('.ATH-score');
    let step = document.querySelector('.step');
    let newGameBtn = document.querySelector('.new-game-btn');
    let restartBtn = document.querySelector('.restart-btn');
    let continueBtn = document.querySelector('.continue-btn')
    let gameMessage = document.querySelector('.game-message');
    let RTscore = 0;
    let ATHscore = parseInt(localStorage.getItem('ATH-score') || '0');
    let steps = 0;
    let gameover = false;
    let won = false;

    function initGame(){
        steps = 0;
        RTscore = 0;
        gameover = false;
        won = false;
        step.textContent = steps;
        realTimeScore.textContent = RTscore;
        allTimeHighScore.textContent = ATHscore;
        tileArray = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        tileContainer.innerHTML = "";
        addNewTile();
        addNewTile();
        updatetileContainer();

        gameMessage.querySelector('p').innerHTML = "";
        gameMessage.classList.remove('game-message-show');
        continueBtn.style.display = 'inline-block';
        restartBtn.style.display = 'inline-block';
    }

    function addNewTile(){
        const emptyCells = [];
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(tileArray[i][j] === 0){
                    emptyCells.push({i, j});
                }
            }
        }
        if(emptyCells.length === 0)return;
        const{i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        tileArray[i][j] = Math.random() < 0.8 ? 2 : 4;
    }
    
    function createTile(val,i,j){
        const tile = document.createElement('div');
        const tileInner = document.createElement('div');
        tile.classList.add('tile');
        tile.classList.add(`tile-position-${i+1}-${j+1}`);
        tile.classList.add(`tile-${val}`);
        tileInner.classList.add(`tile-${val}`);
        tileInner.classList.add(`tile-inner`);
        tileInner.textContent = val
        tile.appendChild(tileInner);
        tileContainer.appendChild(tile);
    }

    function updatetileContainer(){
        tileContainer.innerHTML = '';
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(tileArray[i][j] !== 0){
                    createTile(tileArray[i][j], i, j);
                }
            }
        }
    }

    function slide(ROC){
        let newROC = ROC.filter((val) => val !== 0);
        for(let i = 0; i < newROC.length - 1; i++){
            if(newROC[i] === newROC[i+1]){
                newROC[i] *= 2;
                newROC[i+1] = 0;
                RTscore += newROC[i];
            }
        }
        newROC = newROC.filter((val) => val !== 0);
        while(newROC.length < gridSize){
            newROC.push(0);
        }
        return newROC;
    }

    function move(direction){
        if(gameover)return;
        let moveMade = false;
        switch(direction){
            case 'left':
                for(let i = 0; i < gridSize; i++){
                    const newRow = slide(tileArray[i]);
                    if(newRow.join() !== tileArray[i].join()){
                        moveMade = true;
                        tileArray[i] = newRow;
                    }
                }
                break;
            case 'right':
                for(let i = 0; i < gridSize; i++){
                    const reversedROW = tileArray[i].slice().reverse();
                    const newRow = slide(reversedROW).reverse();
                    if(newRow.join() !== tileArray[i].join()){
                        moveMade = true;
                        tileArray[i] = newRow;
                    }
                }
                break;
            case 'up':
                for(let j = 0; j < gridSize; j++){
                    const column = tileArray.map(row => row[j]);
                    const oldColStr = column.join();
                    const newColumn = slide(column);
                    if(newColumn.join() !== oldColStr){
                        moveMade = true;
                    }
                    tileArray.forEach((row, i) => {
                        row[j] = newColumn[i];
                    })
                }
                break;
            case 'down':
                for(let j = 0; j < gridSize; j++){
                    const column = tileArray.map(row => row[j]);
                    const reversed = column.slice().reverse();
                    const oldColStr = column.join();
                    const newColumn = slide(reversed).reverse();
                    if(newColumn.join() !== oldColStr){
                        moveMade = true;
                    }
                    tileArray.forEach((row, i) => {
                        row[j] = newColumn[i];
                    })
                }
                break;
        }

        if(moveMade){
            steps++;
            step.textContent = steps;
            realTimeScore.textContent = RTscore;
            addNewTile(); 
            updatetileContainer();
        }

        if(RTscore > ATHscore){
            ATHscore = RTscore;
            allTimeHighScore.textContent = ATHscore;
            localStorage.setItem('ATH-score', ATHscore);
        }

        
        checkWin();
        checkGameOver();
    }

    function checkGameOver(){
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(tileArray[i][j] === 0){
                    return;
                }   
            }
        }
        
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize - 1; j++){
                if(tileArray[i][j] === tileArray[i][j+1]){
                    return;
                }
                if(tileArray[j][i] === tileArray[j+1][i]){
                    return;
                }
            }
        }

        gameover = true;
        if(gameover && !won){
            gameMessage.querySelector('p').innerHTML = '游戏结束!';
            gameMessage.classList.add('game-message-show');
            continueBtn.style.display = 'none';
        }else if(gameover && won){
            gameMessage.querySelector('p').innerHTML = '你赢了,游戏结束!';
            gameMessage.classList.add('game-message-show');
            continueBtn.style.display = 'none';
        }
    }

    function checkWin(){
        if(!won && tileArray.flat().includes(2048)){
            won = true;
            gameMessage.querySelector('p').innerHTML = '你赢了!';
            gameMessage.classList.add('game-message-show');
            restartBtn.style.display = 'none';
            continueBtn.style.display = 'inline-block';
        }
    }

    document.addEventListener("keydown", e => {
        if (gameover) return;
        if(e.key === 'ArrowLeft'){
            e.preventDefault();
            move('left');
        }
        if(e.key === 'ArrowRight'){
            e.preventDefault();
            move('right');
        }
        if(e.key === 'ArrowUp'){
            e.preventDefault();
            move('up');
        }
        if(e.key === 'ArrowDown'){
            e.preventDefault();
            move('down');
        }
    })
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => {
        e.preventDefault();

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    })

    document.addEventListener('touchmove', e => {
        e.preventDefault();
    })

    document.addEventListener('touchend', e => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const touchX = touchEndX - touchStartX;
        const touchY = touchEndY - touchStartY;

        const absX = Math.abs(touchX);
        const absY = Math.abs(touchY);

        const threshold  = 30;
        if(Math.max(absX, absY) > threshold){
            if(absX > absY){
                move(touchX > 0 ? 'right':'left');
            }else{
                 move(touchY > 0 ? 'down':'up');
            }
        }

        touchStartX = 0;
        touchStartY = 0;
    })

    newGameBtn.addEventListener('click', () => {
        initGame();
    });

    restartBtn.addEventListener('click', () =>{
        initGame();
        gameMessage.querySelector('p').innerHTML = '';
        continueBtn.style.display = 'inline-block';
        gameMessage.classList.remove('game-message-show');
    });

    continueBtn.addEventListener("click", () => {
        gameMessage.querySelector('p').innerHTML = '';
        restartBtn.style.display = 'inline-block';
        gameMessage.classList.remove('game-message-show');
    })

    initGame();
})