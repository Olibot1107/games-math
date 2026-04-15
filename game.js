// VoidBase - Clean Simple Code

const state = {
    xp: 0,
    level: 1,
    streak: 0,
    combo: 0,
    correct: 0,
    total: 0,
    topic: null,
    question: null,
    qIndex: 0,
    pool: [],
    timer: 60,
    timerId: null,
    mode: null
};

const levels = ['Beginner', 'Learner', 'Student', 'Expert', 'Master', 'Wizard', 'Legend'];

const topics = [
    { id: 'algebra', name: 'Add & Sub', icon: 'fa-plus', color: '#ff6b35' },
    { id: 'multiplication', name: 'Times Tables', icon: 'fa-times', color: '#2ec4b6' },
    { id: 'division', name: 'Division', icon: 'fa-divide', color: '#ff006e' },
    { id: 'number', name: 'Numbers', icon: 'fa-hashtag', color: '#ffbe0b' },
    { id: 'geometry', name: 'Shapes', icon: 'fa-shapes', color: '#8338ec' },
    { id: 'fractions', name: 'Fractions', icon: 'fa-pie-chart', color: '#06d6a0' }
];

let questions = {};

// Load questions
async function loadQuestions() {
    try {
        const res = await fetch('questions.json');
        questions = await res.json();
    } catch(e) {
        console.log('Using default questions');
    }
    init();
}

// Start app
function init() {
    loadProgress();
    renderTopics();
    updateUI();
    document.getElementById('mainApp').style.display = 'block';
}

function loadProgress() {
    const data = JSON.parse(localStorage.getItem('vb_progress') || '{}');
    state.xp = data.xp || 0;
    state.level = data.level || 1;
    state.streak = data.streak || 0;
}

function saveProgress() {
    localStorage.setItem('vb_progress', JSON.stringify({
        xp: state.xp,
        level: state.level,
        streak: state.streak
    }));
}

function renderTopics() {
    const grid = document.getElementById('topicsGrid');
    grid.innerHTML = topics.map((t, i) => `
        <div class="topic-card" onclick="openTopic('${t.id}')">
            <i class="fas ${t.icon}"></i>
            <h3>${t.name}</h3>
            <p>+15 XP</p>
        </div>
    `).join('');
}

function updateUI() {
    const need = 50 + (state.level - 1) * 30;
    const pct = (state.xp / need) * 100;
    
    document.getElementById('xpVal').textContent = state.xp;
    document.getElementById('levelVal').textContent = state.level;
    document.getElementById('streakVal').textContent = state.streak;
    document.getElementById('levelNum').textContent = state.level;
    document.getElementById('xpText').textContent = `${state.xp} / ${need} XP`;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('levelTitle').textContent = levels[Math.min(state.level - 1, levels.length - 1)];
}

function openTopic(id) {
    state.topic = topics.find(t => t.id === id);
    state.mode = 'topic';
    state.qIndex = 0;
    state.correct = 0;
    state.combo = 0;
    
    const pool = questions[id] || getDefaultQuestions(id);
    state.pool = shuffle([...pool]).slice(0, 10);
    
    document.getElementById('modalIcon').innerHTML = `<i class="fas ${state.topic.icon}" style="color: ${state.topic.color}"></i>`;
    document.getElementById('modalTitle').textContent = state.topic.name;
    document.getElementById('modalDesc').textContent = '10 questions to learn!';
    document.getElementById('startModal').classList.add('active');
}

function getDefaultQuestions(id) {
    // Fallback simple questions
    const q = {
        algebra: [
            {q:'5 + 3',a:'8',e:'5 + 3 = 8'},
            {q:'10 - 4',a:'6',e:'10 - 4 = 6'},
            {q:'7 + 5',a:'12',e:'7 + 5 = 12'},
            {q:'15 - 8',a:'7',e:'15 - 8 = 7'},
            {q:'9 + 6',a:'15',e:'9 + 6 = 15'}
        ],
        multiplication: [
            {q:'2 × 3',a:'6',e:'2 + 2 + 2 = 6'},
            {q:'3 × 4',a:'12',e:'3 groups of 4'},
            {q:'5 × 2',a:'10',e:'double 5'},
            {q:'4 × 3',a:'12',e:'4 + 4 + 4'},
            {q:'6 × 2',a:'12',e:'double 6'}
        ],
        division: [
            {q:'6 ÷ 2',a:'3',e:'half of 6'},
            {q:'8 ÷ 2',a:'4',e:'half of 8'},
            {q:'10 ÷ 2',a:'5',e:'half of 10'},
            {q:'12 ÷ 3',a:'4',e:'3 × 4 = 12'},
            {q:'15 ÷ 3',a:'5',e:'3 × 5 = 15'}
        ],
        number: [
            {q:'50% of 20',a:'10',e:'half of 20'},
            {q:'25% of 100',a:'25',e:'quarter of 100'},
            {q:'double 15',a:'30',e:'15 × 2'},
            {q:'half of 48',a:'24',e:'48 ÷ 2'},
            {q:'10% of 50',a:'5',e:'50 ÷ 10'}
        ],
        geometry: [
            {q:'Area 4×5',a:'20',e:'4 × 5 = 20'},
            {q:'Square perimeter 3',a:'12',e:'4 × 3'},
            {q:'Pentagon sides',a:'5',e:'penta = 5'},
            {q:'Triangle corners',a:'3',e:'tri = 3'},
            {q:'Square area 4',a:'16',e:'4 × 4'}
        ],
        fractions: [
            {q:'1/2 of 10',a:'5',e:'10 ÷ 2'},
            {q:'1/4 of 20',a:'5',e:'20 ÷ 4'},
            {q:'1/3 of 9',a:'3',e:'9 ÷ 3'},
            {q:'1/2 of 8',a:'4',e:'half of 8'},
            {q:'1/5 of 20',a:'4',e:'20 ÷ 5'}
        ]
    };
    return q[id] || q.algebra;
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function startGame() {
    document.getElementById('startModal').classList.remove('active');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('gameApp').style.display = 'block';
    
    state.timer = state.mode === 'flash' ? 60 : 90;
    state.qIndex = 0;
    
    showQuestion();
    startTimer();
}

function startTimer() {
    clearInterval(state.timerId);
    updateTimerDisplay();
    
    state.timerId = setInterval(() => {
        state.timer--;
        updateTimerDisplay();
        
        if (state.timer <= 0) {
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const el = document.getElementById('gameTimer');
    el.textContent = state.timer + 's';
    el.className = 'timer' + (state.timer <= 15 ? ' danger' : state.timer <= 30 ? ' warning' : '');
}

function showQuestion() {
    if (state.qIndex >= state.pool.length) {
        endGame();
        return;
    }
    
    state.question = state.pool[state.qIndex];
    
    document.getElementById('gameTopic').textContent = state.topic?.name || 'Practice';
    document.getElementById('questionNum').textContent = `Question ${state.qIndex + 1}/${state.pool.length}`;
    document.getElementById('questionText').textContent = state.question.q;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').className = 'answer-input';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('hintBox').className = 'hint-box';
    document.getElementById('hintBtn').style.display = 'block';
    document.getElementById('answerInput').focus();
    
    updateGameUI();
}

function submitAnswer() {
    const input = document.getElementById('answerInput');
    const user = input.value.toLowerCase().trim();
    const correct = String(state.question.a).toLowerCase().trim();
    
    if (user === correct) {
        state.xp += 15;
        state.correct++;
        state.combo++;
        state.qIndex++;
        
        input.classList.add('correct');
        
        const fb = document.getElementById('feedback');
        fb.className = 'feedback show correct';
        fb.innerHTML = `✅ <strong>Correct!</strong><div class="exp">${state.question.explanation || state.question.e}</div>`;
        
        if (state.combo >= 3 && state.combo % 3 === 0) {
            showCombo(state.combo);
        }
        
        updateUI();
        saveProgress();
        
        setTimeout(() => showQuestion(), 2000);
    } else {
        state.combo = 0;
        state.qIndex++;
        
        input.classList.add('wrong');
        
        const fb = document.getElementById('feedback');
        fb.className = 'feedback show wrong';
        fb.innerHTML = `❌ <strong>Not quite...</strong><div class="exp">Answer: ${state.question.a}</div><div class="exp">${state.question.explanation || state.question.e}</div>`;
        
        updateGameUI();
        
        setTimeout(() => showQuestion(), 2500);
    }
}

function showHint() {
    document.getElementById('hintBtn').style.display = 'none';
    document.getElementById('hintBox').textContent = state.question.hint || state.question.e;
    document.getElementById('hintBox').className = 'hint-box show';
}

function updateGameUI() {
    document.getElementById('gameXp').textContent = state.xp;
    document.getElementById('gameStreak').textContent = state.combo;
}

function showCombo(n) {
    const el = document.getElementById('comboPopup');
    el.textContent = `🔥 COMBO x${n}!`;
    el.className = 'combo-popup show';
    setTimeout(() => el.className = 'combo-popup', 1000);
}

function endGame() {
    clearInterval(state.timerId);
    
    const xpEarned = state.correct * 15;
    
    document.getElementById('endTitle').textContent = state.correct >= 8 ? '🌟 Awesome!' : '🎉 Good Job!';
    document.getElementById('endMessage').textContent = `${state.correct} out of ${state.pool.length} correct`;
    document.getElementById('endStats').innerHTML = `
        <div><span class="num" style="color: #06d6a0">${state.correct}</span><span class="label">Correct</span></div>
        <div><span class="num" style="color: #ffbe0b">+${xpEarned}</span><span class="label">XP</span></div>
        <div><span class="num" style="color: #ff006e">${state.combo}</span><span class="label">Streak</span></div>
    `;
    
    checkLevelUp();
    document.getElementById('endModal').classList.add('active');
}

function checkLevelUp() {
    let need = 50 + (state.level - 1) * 30;
    while (state.xp >= need) {
        state.xp -= need;
        state.level++;
        need = 50 + (state.level - 1) * 30;
        
        const el = document.getElementById('xpPopup');
        el.textContent = `🎉 LEVEL ${state.level}!`;
        el.className = 'xp-popup show';
        setTimeout(() => el.className = 'xp-popup', 1500);
    }
    saveProgress();
}

function goHome() {
    document.getElementById('endModal').classList.remove('active');
    document.getElementById('gameApp').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateUI();
}

function quitGame() {
    clearInterval(state.timerId);
    goHome();
}

// Mini games
function startFlash() {
    state.mode = 'flash';
    state.topic = { name: 'Speed Run', icon: 'fa-bolt', color: '#ffbe0b' };
    
    let pool = [];
    Object.values(questions).forEach(qs => pool.push(...qs));
    state.pool = shuffle(pool).slice(0, 30);
    state.qIndex = 0;
    state.correct = 0;
    
    document.getElementById('startModal').classList.add('active');
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-bolt" style="color: #ffbe0b"></i>';
    document.getElementById('modalTitle').textContent = 'Speed Run';
    document.getElementById('modalDesc').textContent = 'Answer as many as you can in 60 seconds!';
}

function startChain() {
    state.mode = 'chain';
    state.topic = { name: 'Chain', icon: 'fa-link', color: '#8338ec' };
    
    let pool = [];
    Object.values(questions).forEach(qs => pool.push(...qs));
    state.pool = shuffle(pool);
    state.qIndex = 0;
    state.correct = 0;
    
    document.getElementById('startModal').classList.add('active');
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-link" style="color: #8338ec"></i>';
    document.getElementById('modalTitle').textContent = 'Chain Reaction';
    document.getElementById('modalDesc').textContent = 'Keep your streak going! One wrong = game over';
}

function startMemory() {
    document.getElementById('gameApp').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    
    // Simple memory game
    const nums = [1,2,3,4,5,6,7,8];
    const cards = shuffle([...nums, ...nums]);
    
    const main = document.querySelector('#mainApp');
    main.style.display = 'block';
    main.innerHTML = `
        <header>
            <div class="logo" onclick="location.reload()">
                <i class="fas fa-arrow-left"></i>
                <span>Memory</span>
            </div>
        </header>
        <main>
            <h2 style="text-align: center; margin: 20px 0;">Match the numbers!</h2>
            <div class="memory-grid" id="memGrid"></div>
            <p style="text-align: center; margin-top: 20px;">Matches: <span id="memScore">0</span>/8</p>
        </main>
    `;
    
    let revealed = [];
    let matches = 0;
    let first = null;
    
    const grid = document.getElementById('memGrid');
    grid.innerHTML = cards.map((n, i) => `
        <div class="memory-card" data-i="${i}" data-v="${n}">?</div>
    `).join('');
    
    grid.onclick = (e) => {
        const card = e.target;
        if (!card.classList.contains('memory-card') || revealed.includes(card.dataset.i)) return;
        
        card.textContent = card.dataset.v;
        card.classList.add('flipped');
        revealed.push(card.dataset.i);
        
        if (!first) {
            first = card;
        } else {
            if (first.dataset.v === card.dataset.v) {
                first.classList.add('matched');
                card.classList.add('matched');
                matches++;
                document.getElementById('memScore').textContent = matches;
                
                if (matches === 8) {
                    state.xp += 30;
                    checkLevelUp();
                    saveProgress();
                    setTimeout(() => alert('🎉 +30 XP!'), 300);
                }
                first = null;
            } else {
                setTimeout(() => {
                    first.textContent = '?';
                    first.classList.remove('flipped');
                    card.textContent = '?';
                    card.classList.remove('flipped');
                    first = null;
                }, 800);
            }
        }
    };
}

// Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('gameApp').style.display === 'block') {
        submitAnswer();
    }
});

// Start
loadQuestions();