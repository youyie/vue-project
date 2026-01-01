document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 4;
    let tileArray = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    let tileElements = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    let tileContainer = document.querySelector('.tile-container');
    let realTimeScore = document.querySelector('.RT-score');
    let allTimeHighScore = document.querySelector('.ATH-score');
    let step = document.querySelector('.step');
    let newGameBtn = document.querySelector('.new-game-btn');
    let restartBtn = document.querySelector('.restart-btn');
    let continueBtn = document.querySelector('.continue-btn');
    let gameMessage = document.querySelector('.game-message');

    let RTscore = 0;
    let ATHscore = parseInt(localStorage.getItem('ATH-score') || '0');
    let steps = 0;
    let gameover = false;
    let won = false;
    let isMoving = false;

    function updateTileClasses(tileEl, val, positionClass) {
        if (!tileEl) return;
        const innerEl = tileEl.querySelector('.tile-inner');
        tileEl.className = `tile tile-${val} ${positionClass}`;
        if (innerEl) {
            innerEl.className = `tile-inner tile-${val}`;
            innerEl.textContent = val;
        }
    }

    // 初始化游戏
    function initGame() {
        isMoving = false;
        steps = 0;
        RTscore = 0;
        gameover = false;
        won = false;
        step.textContent = steps;
        realTimeScore.textContent = RTscore;
        allTimeHighScore.textContent = ATHscore;

        initTileContainer();
        addNewTile();
        addNewTile();

        gameMessage.querySelector('p').innerHTML = "";
        gameMessage.classList.remove('game-message-show');
        continueBtn.style.display = 'inline-block';
        restartBtn.style.display = 'inline-block';
    }

    // 添加新方块
    function addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (tileArray[i][j] === 0) {
                    emptyCells.push({ i, j });
                }
            }
        }
        if (emptyCells.length === 0) return;

        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        tileArray[i][j] = Math.random() < 0.9 ? 2 : 4;
        createTile(tileArray[i][j], i, j);
    }

    // 创建方块 DOM
    function createTile(val, i, j) {
        const tile = document.createElement('div');
        const tileInner = document.createElement('div');

        tile.classList.add('tile', `tile-position-${i + 1}-${j + 1}`, `tile-${val}`);
        tileInner.classList.add('tile-inner', `tile-${val}`);
        tileInner.textContent = val;

        tile.appendChild(tileInner);
        tileContainer.appendChild(tile);
        tileElements[i][j] = tile;
    }

    function initTileContainer() {
        tileContainer.innerHTML = '';
        tileArray = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        tileElements = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    }

function slide(lineVals, lineEls, fixedIdx, isRow, isReversed) {
    return new Promise((resolve) => {
        let moved = false;
        const compacted = [];
        for (let i = 0; i < lineVals.length; i++) {
            if (lineVals[i] !== 0) {
                compacted.push({
                    val: lineVals[i],
                    el: lineEls[i]
                });
            }
        }

        if (compacted.length === 0) {
            resolve({ moved: false, arr: Array(gridSize).fill(null) });
            return;
        }

        // 计算合并对和 targetCnt
        const mergeTargets = [];
        let k = 0;
        let targetCnt = 0;
        while (k < compacted.length) {
            compacted[k].targetCnt = targetCnt;
            if (k + 1 < compacted.length && compacted[k].val === compacted[k + 1].val) {
                compacted[k + 1].targetCnt = targetCnt;
                const mergedVal = compacted[k].val * 2;
                mergeTargets.push({
                    targetCnt,
                    mergedVal,
                    survivor: compacted[k].el,
                    victim: compacted[k + 1].el
                });
                RTscore += mergedVal;
                moved = true;
                k += 2;
                targetCnt++;
            } else {
                k++;
                targetCnt++;
            }
        }

        // 第一阶段：立即移动所有方块到目标位置
        for (let item of compacted) {
            let targetIndex = item.targetCnt;
            if (isReversed) {
                targetIndex = gridSize - 1 - targetIndex;
            }
            const rowPos = isRow ? (fixedIdx + 1) : (targetIndex + 1);
            const colPos = isRow ? (targetIndex + 1) : (fixedIdx + 1);
            const posClass = `tile-position-${rowPos}-${colPos}`;
            updateTileClasses(item.el, item.val, posClass);
        }

        // 计算最终数组
        const finalLine = Array(gridSize).fill(0);
        const finalArr = Array(gridSize).fill(null);
        let finalCnt = 0;
        k = 0;
        while (k < compacted.length) {
            if (k + 1 < compacted.length && compacted[k].val === compacted[k + 1].val) {
                finalLine[finalCnt] = compacted[k].val * 2;
                finalArr[finalCnt] = compacted[k].el;
                k += 2;
            } else {
                finalLine[finalCnt] = compacted[k].val;
                finalArr[finalCnt] = compacted[k].el;
                k++;
            }
            finalCnt++;
        }

        // 精确判断是否移动
        moved = JSON.stringify(lineVals) !== JSON.stringify(finalLine);

        if (isReversed) {
            finalLine.reverse();
        }

        if (isRow) {
            tileArray[fixedIdx] = finalLine;
        } else {
            for (let i = 0; i < gridSize; i++) {
                tileArray[i][fixedIdx] = finalLine[i];
            }
        }

        // 第二阶段：延迟执行合并动画
        setTimeout(() => {
            for (let m of mergeTargets) {
                if (m.victim && m.victim.parentNode) {
                    m.victim.parentNode.removeChild(m.victim);
                }

                let targetIndex = m.targetCnt;
                if (isReversed) {
                    targetIndex = gridSize - 1 - targetIndex;
                }
                const rowPos = isRow ? (fixedIdx + 1) : (targetIndex + 1);
                const colPos = isRow ? (targetIndex + 1) : (fixedIdx + 1);
                const posClass = `tile-position-${rowPos}-${colPos}`;
                updateTileClasses(m.survivor, m.mergedVal, posClass);
            }
            resolve({ moved, arr: finalArr });
        }, 100);
    });
}

    // 移动函数（async，等待所有动画完成）
    async function move(direction) {
        if (gameover || isMoving) return;
        isMoving = true;
        let moveMade = false;
        let promises = [];
        let results = [];

        switch (direction) {
            case 'left':
                for (let i = 0; i < gridSize; i++) {
                    promises.push(slide(tileArray[i], [...tileElements[i]], i, true, false));
                }
                results = await Promise.all(promises);
                for (let i = 0; i < gridSize; i++) {
                    if (results[i].moved) moveMade = true;
                    tileElements[i] = results[i].arr;
                }
                break;
            case 'right':
                for (let i = 0; i < gridSize; i++) {
                    const revVals = [...tileArray[i]].reverse();
                    const revEls = [...tileElements[i]].reverse();
                    promises.push(slide(revVals, revEls, i, true, true));
                }
                results = await Promise.all(promises);
                for (let i = 0; i < gridSize; i++) {
                    if (results[i].moved) moveMade = true;
                    tileElements[i] = [...results[i].arr].reverse();
                }
                break;
            case 'up':
                for (let j = 0; j < gridSize; j++) {
                    const colVals = tileArray.map(row => row[j]);
                    const colEls = tileElements.map(row => row[j]);
                    promises.push(slide(colVals, colEls, j, false, false));
                }
                results = await Promise.all(promises);
                for (let j = 0; j < gridSize; j++) {
                    if (results[j].moved) moveMade = true;
                    for (let i = 0; i < gridSize; i++) {
                        tileElements[i][j] = results[j].arr[i];
                    }
                }
                break;
            case 'down':
                for (let j = 0; j < gridSize; j++) {
                    const colVals = tileArray.map(row => row[j]);
                    const revColVals = [...colVals].reverse();
                    const colEls = tileElements.map(row => row[j]);
                    const revColEls = [...colEls].reverse();
                    promises.push(slide(revColVals, revColEls, j, false, true));
                }
                results = await Promise.all(promises);
                for (let j = 0; j < gridSize; j++) {
                    if (results[j].moved) moveMade = true;
                    const revArr = [...results[j].arr].reverse();
                    for (let i = 0; i < gridSize; i++) {
                        tileElements[i][j] = revArr[i];
                    }
                }
                break;
        }
        promises = [];
        results = [];

        if (moveMade) {
            steps++;
            step.textContent = steps;
            realTimeScore.textContent = RTscore;
            await new Promise(resolve => {
                setTimeout(() => {
                    addNewTile();
                    resolve();
                }, 150);
            });
        }

        if (RTscore > ATHscore) {
            ATHscore = RTscore;
            allTimeHighScore.textContent = ATHscore;
            localStorage.setItem('ATH-score', ATHscore);
        }

        checkWin();
        checkGameOver();
        isMoving = false;
    }

    function checkWin() {
        if (!won && tileArray.flat().includes(2048)) {
            won = true;
            gameMessage.querySelector('p').innerHTML = '你赢了！';
            gameMessage.classList.add('game-message-show');
            restartBtn.style.display = 'none';
            continueBtn.style.display = 'inline-block';
        }
    }

    function checkGameOver() {
        // 检查空位
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (tileArray[i][j] === 0) return;
            }
        }
        // 检查相邻可合并
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize - 1; j++) {
                if (tileArray[i][j] === tileArray[i][j + 1] || tileArray[j][i] === tileArray[j + 1][i]) {
                    return;
                }
            }
        }
        gameover = true;
        gameMessage.querySelector('p').innerHTML = won ? '你赢了,游戏结束!' : '游戏结束!';
        gameMessage.classList.add('game-message-show');
        continueBtn.style.display = 'none';
    }

    // 键盘事件
    document.addEventListener("keydown", async (e) => {
        if (isMoving || gameover) return;
        switch (e.key) {
            case 'ArrowLeft': await move('left'); e.preventDefault(); break;
            case 'ArrowRight': await move('right'); e.preventDefault(); break;
            case 'ArrowUp': await move('up'); e.preventDefault(); break;
            case 'ArrowDown': await move('down'); e.preventDefault(); break;
        }
    });

    // 触摸事件
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        if(!isMoving)
        {touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;}
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if(!isMoving)
        {e.preventDefault()}
    }, { passive: false });

    document.addEventListener('touchend', async (e) => {
        if(!isMoving)
        {const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (Math.max(absX, absY) > 30) {
            if (absX > absY) {
                await move(dx > 0 ? 'right' : 'left');
            } else {
                await move(dy > 0 ? 'down' : 'up');
            }
        }}
    }, { passive: true });

    // 按钮事件
    newGameBtn.addEventListener('click', initGame);
    restartBtn.addEventListener('click', () => {
        initGame();
        gameMessage.querySelector('p').innerHTML = '';
        continueBtn.style.display = 'inline-block';
        gameMessage.classList.remove('game-message-show');
    });
    continueBtn.addEventListener('click', () => {
        gameMessage.querySelector('p').innerHTML = '';
        restartBtn.style.display = 'inline-block';
        gameMessage.classList.remove('game-message-show');
    });

    initGame();
});