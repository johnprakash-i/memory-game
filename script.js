// ========================================
// MEMORY GAME - COMPLETE GAME LOGIC
// ========================================

// ========================================
// GAME STATE
// ========================================

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let canFlip = true;
let timerInterval = null;
let seconds = 0;

// Card icons - 8 pairs (16 cards total)
const cardIcons = [
    'fa-heart',
    'fa-star',
    'fa-rocket',
    'fa-crown',
    'fa-gem',
    'fa-bolt',
    'fa-fire',
    'fa-moon'
];

// ========================================
// DOM ELEMENTS
// ========================================

const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const timeDisplay = document.getElementById('time');
const bestScoreDisplay = document.getElementById('bestScore');
const restartBtn = document.getElementById('restartBtn');
const victoryModal = document.getElementById('victoryModal');
const modalContent = document.getElementById('modalContent');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalMovesDisplay = document.getElementById('finalMoves');
const finalTimeDisplay = document.getElementById('finalTime');

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initializeGame();
    setupEventListeners();
});

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
        closeVictoryModal();
        restartGame();
    });
}

// ========================================
// GAME INITIALIZATION
// ========================================

function initializeGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameStarted = false;
    canFlip = true;
    seconds = 0;
    
    // Stop timer if running
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update displays
    updateStats();
    
    // Create and shuffle cards
    createCards();
    shuffleCards();
    renderCards();
}

// ========================================
// CARD CREATION
// ========================================

function createCards() {
    cards = [];
    
    // Create pairs of cards
    cardIcons.forEach((icon, index) => {
        // First card of the pair
        cards.push({
            id: index * 2,
            icon: icon,
            isFlipped: false,
            isMatched: false
        });
        
        // Second card of the pair
        cards.push({
            id: index * 2 + 1,
            icon: icon,
            isFlipped: false,
            isMatched: false
        });
    });
}

// ========================================
// SHUFFLE ALGORITHM (Fisher-Yates)
// ========================================

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// ========================================
// RENDER CARDS TO DOM
// ========================================

function renderCards() {
    gameBoard.innerHTML = '';
    
    cards.forEach((card) => {
        const cardElement = createCardElement(card);
        gameBoard.appendChild(cardElement);
    });
}

function createCardElement(card) {
    // Main card container
    const cardDiv = document.createElement('div');
    cardDiv.className = 'memory-card no-select';
    cardDiv.dataset.id = card.id;
    
    // Card back (face-down)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    
    // Card front (face-up)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    
    // Icon on the front
    const icon = document.createElement('i');
    icon.className = `fas ${card.icon} card-icon`;
    cardFront.appendChild(icon);
    
    // Append faces to card
    cardDiv.appendChild(cardBack);
    cardDiv.appendChild(cardFront);
    
    // Add click event
    cardDiv.addEventListener('click', () => handleCardClick(card.id));
    
    return cardDiv;
}

// ========================================
// CARD FLIP LOGIC
// ========================================

function handleCardClick(cardId) {
    // Start timer on first click
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Get the card
    const card = cards.find(c => c.id === cardId);
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    
    // Validation: Can we flip this card?
    if (!canFlip || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card
    flipCard(card, cardElement);
    
    // Add to flipped cards array
    flippedCards.push({ card, cardElement });
    
    // Check if we have 2 flipped cards
    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        updateStats();
        
        // Check for match after a short delay
        setTimeout(checkForMatch, 800);
    }
}

function flipCard(card, cardElement) {
    card.isFlipped = true;
    cardElement.classList.add('flipped');
}

function unflipCard(card, cardElement) {
    card.isFlipped = false;
    cardElement.classList.remove('flipped');
    cardElement.classList.add('flip-back');
    
    // Remove flip-back class after animation
    setTimeout(() => {
        cardElement.classList.remove('flip-back');
    }, 600);
}

// ========================================
// MATCH DETECTION
// ========================================

function checkForMatch() {
    const [first, second] = flippedCards;
    
    // Check if icons match
    if (first.card.icon === second.card.icon) {
        // It's a match!
        handleMatch(first, second);
    } else {
        // Not a match
        handleMismatch(first, second);
    }
}

function handleMatch(first, second) {
    // Mark as matched
    first.card.isMatched = true;
    second.card.isMatched = true;
    
    // Add matched animation
    first.cardElement.classList.add('matched');
    second.cardElement.classList.add('matched');
    
    // Update matches count
    matchedPairs++;
    updateStats();
    
    // Reset flipped cards
    flippedCards = [];
    canFlip = true;
    
    // Check for victory
    if (matchedPairs === cardIcons.length) {
        setTimeout(handleVictory, 500);
    }
}

function handleMismatch(first, second) {
    // Shake animation
    first.cardElement.classList.add('shake');
    second.cardElement.classList.add('shake');
    
    // Unflip after delay
    setTimeout(() => {
        unflipCard(first.card, first.cardElement);
        unflipCard(second.card, second.cardElement);
        
        // Remove shake class
        first.cardElement.classList.remove('shake');
        second.cardElement.classList.remove('shake');
        
        // Reset flipped cards
        flippedCards = [];
        canFlip = true;
    }, 600);
}

// ========================================
// TIMER FUNCTIONALITY
// ========================================

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimeDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimeDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// STATS UPDATE
// ========================================

function updateStats() {
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matchedPairs;
    
    // Add pulse animation
    movesDisplay.classList.add('stat-update');
    matchesDisplay.classList.add('stat-update');
    
    setTimeout(() => {
        movesDisplay.classList.remove('stat-update');
        matchesDisplay.classList.remove('stat-update');
    }, 300);
}

// ========================================
// VICTORY HANDLING
// ========================================

function handleVictory() {
    stopTimer();
    
    // Update final stats in modal
    finalMovesDisplay.textContent = moves;
    finalTimeDisplay.textContent = timeDisplay.textContent;
    
    // Check and update best score
    updateBestScore();
    
    // Show victory modal
    showVictoryModal();
}

function showVictoryModal() {
    victoryModal.classList.remove('hidden');
    victoryModal.classList.add('modal-show');
    
    // Trigger scale animation
    setTimeout(() => {
        modalContent.style.transform = 'scale(1)';
    }, 10);
}

function closeVictoryModal() {
    modalContent.style.transform = 'scale(0)';
    
    setTimeout(() => {
        victoryModal.classList.add('hidden');
        victoryModal.classList.remove('modal-show');
    }, 300);
}

// ========================================
// BEST SCORE MANAGEMENT
// ========================================

function updateBestScore() {
    const currentScore = moves;
    const bestScore = localStorage.getItem('memoryGameBestScore');
    
    if (!bestScore || currentScore < parseInt(bestScore)) {
        localStorage.setItem('memoryGameBestScore', currentScore);
        bestScoreDisplay.textContent = currentScore;
        
        // Add celebration animation
        bestScoreDisplay.classList.add('stat-update');
        setTimeout(() => {
            bestScoreDisplay.classList.remove('stat-update');
        }, 300);
    }
}

function loadBestScore() {
    const bestScore = localStorage.getItem('memoryGameBestScore');
    if (bestScore) {
        bestScoreDisplay.textContent = bestScore;
    }
}

// ========================================
// RESTART GAME
// ========================================

function restartGame() {
    // Add loading state
    gameBoard.classList.add('loading');
    
    // Stop and reset timer completely
    stopTimer();
    seconds = 0;
    timeDisplay.textContent = '0:00';
    
    // Reinitialize after brief delay for visual feedback
    setTimeout(() => {
        initializeGame();
        gameBoard.classList.remove('loading');
    }, 300);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Prevent default text selection on double-click
document.addEventListener('selectstart', (e) => {
    if (e.target.closest('.memory-card')) {
        e.preventDefault();
    }
});

// Log game ready
console.log('✅ Memory Game Fully Loaded and Ready to Play!');
console.log('🎮 Click any card to start the game!');
console.log('🎯 Find all 8 pairs to win!');