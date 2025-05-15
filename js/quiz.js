// Quiz State
let currentQuestionIndex = 0;
let answers = [];
let dimensionScores = {};

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
    showScreen('welcome-screen');
});

// Start quiz
function startQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    showScreen('question-screen');
    loadQuestion();
}

// Show specific screen
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Load current question
function loadQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update question header
    document.getElementById('question-number').textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
    document.getElementById('dimension-badge').textContent = question.dimension;
    
    // Update question text
    document.getElementById('question-text').textContent = question.text;
    
    // Update options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectOption(index);
        
        // Check if this option was previously selected
        const savedAnswer = answers[currentQuestionIndex];
        if (savedAnswer && savedAnswer === answerMapping[index]) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-radio">
                <div class="option-radio-inner"></div>
            </div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    const prevButton = document.querySelector('.nav-buttons .btn-secondary');
    const nextButton = document.querySelector('.nav-buttons .btn-primary');
    
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = !answers[currentQuestionIndex];
    
    // Update next button text
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.textContent = 'FINALIZAR →';
    } else {
        nextButton.textContent = 'CONTINUAR →';
    }
}

// Select an option
function selectOption(index) {
    // Save answer
    answers[currentQuestionIndex] = answerMapping[index];
    
    // Update visual selection
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
        if (i === index) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Enable next button
    const nextButton = document.querySelector('.nav-buttons .btn-primary');
    nextButton.disabled = false;
}

// Navigate to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Navigate to next question or finish quiz
function nextQuestion() {
    if (!answers[currentQuestionIndex]) {
        alert('Por favor selecciona una respuesta antes de continuar.');
        return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

// Finish quiz and submit results
async function finishQuiz() {
    // Prepare user data
    const userData = {
        nombre: "Usuario Anónimo", // En producción, podrías pedir estos datos
        email: "usuario@ejemplo.com",
        linkedin: "https://linkedin.com/in/usuario",
        answers: answers
    };
    
    // Submit results and get feedback
    const results = await submitQuizResults(userData);
    
    if (results.success) {
        displayResults(results.data);
    } else {
        alert('Hubo un error al procesar tus resultados. Por favor intenta de nuevo.');
    }
}

// Display results
function displayResults(data) {
    showScreen('results-screen');
    
    // Update level badge
    const levelBadge = document.getElementById('level-badge');
    levelBadge.textContent = `Nivel: ${data.overallLevel}`;
    
    // Update level badge color based on score
    levelBadge.className = 'level-badge';
    if (data.totalScore > 35) {
        levelBadge.style.background = 'linear-gradient(45deg, #10b981, #3b82f6)';
    } else if (data.totalScore > 20) {
        levelBadge.style.background = 'linear-gradient(45deg, #f59e0b, #10b981)';
    } else {
        levelBadge.style.background = 'linear-gradient(45deg, #ef4444, #f59e0b)';
    }
    
    // Create dimension cards
    const dimensionCardsContainer = document.getElementById('dimension-cards');
    dimensionCardsContainer.innerHTML = '';
    
    Object.entries(data.dimensionScores).forEach(([dimension, score]) => {
        const percentage = Math.round((score / 12) * 100);
        const card = document.createElement('div');
        card.className = 'dimension-card';
        card.innerHTML = `
            <div class="dimension-name">${dimension}</div>
            <div class="dimension-bar">
                <div class="dimension-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="dimension-score">${percentage}%</div>
        `;
        dimensionCardsContainer.appendChild(card);
    });
    
    // Update feedback
    const generalFeedback = document.getElementById('general-feedback');
    const averageScore = Math.round(data.totalScore / 4);
    const averagePercentage = Math.round((averageScore / 12) * 100);
    
    generalFeedback.textContent = `Tu nivel general es ${data.overallLevel} con una puntuación promedio de ${averagePercentage}%. ${
        averageScore >= 8 
            ? '¡Felicidades! Tienes un buen dominio de la IA.' 
            : 'Hay áreas en las que puedes mejorar para aumentar tu competencia en IA.'
    }`;
    
    // Update dimension feedback
    const dimensionFeedbackList = document.getElementById('dimension-feedback');
    dimensionFeedbackList.innerHTML = '';
    
    Object.entries(data.feedback).forEach(([dimension, feedback]) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${dimension}:</strong> ${feedback.message}`;
        dimensionFeedbackList.appendChild(li);
    });
    
    // Create radar chart
    createRadarChart(data.dimensionScores);
}

// Create radar chart
function createRadarChart(scores) {
    const ctx = document.getElementById('radar-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = Object.keys(scores).map(label => {
        // Shorten labels for mobile
        if (window.innerWidth < 480) {
            return label.split(' ').map(word => word[0]).join('');
        }
        return label;
    });
    
    const dataValues = Object.values(scores).map(score => Math.round((score / 12) * 100));
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tu Perfil de IA',
                data: dataValues,
                fill: true,
                backgroundColor: 'rgba(247, 37, 133, 0.2)',
                borderColor: '#F72585',
                pointBackgroundColor: '#F72585',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#F72585',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: '#fff',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: '#444'
                    },
                    angleLines: {
                        color: '#666'
                    },
                    pointLabels: {
                        color: '#fff',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.r + '%';
                        }
                    }
                }
            }
        }
    });
}

// Restart quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    startQuiz();
}

// Share results on LinkedIn
function shareResults() {
    const levelBadge = document.getElementById('level-badge').textContent;
    
    // Prepare share text
    const shareText = `¡Acabo de completar el Test de Competencia en IA! 🤖✨ Mi resultado: ${levelBadge}
    
¿Quieres conocer tu nivel de preparación para el mundo de la IA? 
Toma el test gratuito aquí: https://alejogilri.github.io/ai-proficiency-quiz/

#InteligenciaArtificial #IA #AILiteracy #TransformaciónDigital`;
    
    // LinkedIn sharing URL
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://alejogilri.github.io/ai-proficiency-quiz/')}&summary=${encodeURIComponent(shareText)}`;
    
    // Open in new window
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
}

// Save progress to localStorage
function saveProgress() {
    const progress = {
        currentQuestionIndex,
        answers,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('quizProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        // Check if progress is less than 24 hours old
        const savedTime = new Date(progress.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            currentQuestionIndex = progress.currentQuestionIndex;
            answers = progress.answers;
            return true;
        }
    }
    return false;
}