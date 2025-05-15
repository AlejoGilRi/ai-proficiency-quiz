// API Configuration
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzef-yYKtZsBUb0ZA1B4uLTodYSBhalEK3bzxFi_DlT9uCloEkNNyUDEPtOLFlgDkQ8/exec';

// API Functions
async function submitQuizResults(userData) {
    try {
        // Mostrar pantalla de carga
        showScreen('loading-screen');
        
        // Enviar datos al endpoint
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        // Simular respuesta ya que no podemos leer la respuesta real por CORS
        // En producción, el backend debería configurarse para permitir CORS
        return simulateBackendResponse(userData.answers);
        
    } catch (error) {
        console.error('Error al enviar resultados:', error);
        // En caso de error, usar cálculo local
        return simulateBackendResponse(userData.answers);
    }
}

// Función para simular la respuesta del backend (cálculo local como fallback)
function simulateBackendResponse(answers) {
    const dimensionScores = calculateDimensionScores(answers);
    const totalScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0);
    const overallLevel = getOverallLevel(totalScore);
    const feedback = generateDetailedFeedback(dimensionScores);
    
    return {
        success: true,
        data: {
            dimensionScores: dimensionScores,
            totalScore: totalScore,
            overallLevel: overallLevel,
            feedback: feedback,
            recommendations: getRecommendations(dimensionScores)
        }
    };
}

// Calcular scores por dimensión (replicando la lógica del backend)
function calculateDimensionScores(answers) {
    const scores = {
        'Understanding AI': 0,
        'Using & Applying AI': 0,
        'Evaluating AI': 0,
        'AI Ethics & Responsibility': 0
    };
    
    // Sumar puntos por dimensión
    answers.forEach((answerLetter, index) => {
        const question = questions[index];
        const answerIndex = ['a', 'b', 'c', 'd'].indexOf(answerLetter);
        if (answerIndex !== -1) {
            scores[question.dimension] += question.options[answerIndex].points;
        }
    });
    
    return scores;
}

// Determinar el nivel general
function getOverallLevel(totalScore) {
    if (totalScore <= 20) return 'Básico';
    if (totalScore <= 35) return 'Intermedio';
    return 'Avanzado';
}

// Generar feedback detallado
function generateDetailedFeedback(scores) {
    const feedback = {};
    
    Object.entries(scores).forEach(([dimension, score]) => {
        let level;
        if (score <= 5) {
            level = 'Básico';
        } else if (score <= 9) {
            level = 'Intermedio';
        } else {
            level = 'Avanzado';
        }
        
        feedback[dimension] = {
            score: score,
            level: level,
            message: feedbackMatrix[dimension][level]
        };
    });
    
    return feedback;
}

// Obtener recomendaciones generales
function getRecommendations(scores) {
    const recommendations = [];
    
    // Identificar dimensión más débil
    const dimensions = Object.entries(scores);
    const weakest = dimensions.reduce((min, curr) => curr[1] < min[1] ? curr : min);
    
    recommendations.push(`Tu área con más oportunidad de mejora es ${weakest[0]}. Enfócate en fortalecerla primero.`);
    
    // Recomendaciones basadas en el perfil general
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 4;
    
    if (avgScore < 6) {
        recommendations.push('Comienza con herramientas básicas como ChatGPT y explora sus capacidades.');
    } else if (avgScore < 9) {
        recommendations.push('Profundiza en herramientas especializadas y mejora tu técnica de prompting.');
    } else {
        recommendations.push('Comparte tu conocimiento y lidera iniciativas de IA en tu organización.');
    }
    
    return recommendations;
}
