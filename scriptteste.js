// Parte 1: Inicialização e Carregamento do Quiz

// Variáveis para rastrear o estado do quiz
let score = 0;
let currentQuestionIndex = 0;
let questions = [];
let currentMode = '';

// Inicialização do quiz
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
});

// Inicia o quiz selecionado
function startQuiz() {
    const modeSelected = document.querySelector('input[name="mode"]:checked');
    if (!modeSelected) {
        alert('Por favor, escolha um modo antes de começar.');
        return;
    }
    
    currentMode = modeSelected.value;
    loadQuiz(document.getElementById('quiz-selector').value);
}

// Carrega o quiz selecionado a partir do arquivo XML
function loadQuiz(quizFile) {
    // Substitua 'quiz.xml' pelo caminho do seu arquivo XML real
    fetch(quizFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o quiz');
            }
            return response.text();
        })
        .then(parseQuizXML)
        .then(displayQuestion)
        .catch(error => {
            alert(error.message);
        });
}

// Analisa a resposta XML do quiz
function parseQuizXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    questions = Array.from(xmlDoc.getElementsByTagName('question'));
}

// Parte 2: Navegação entre as perguntas e exibição

// Exibe a questão atual e as opções de respostas
function displayQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    const questionElement = document.getElementById('question');
    const optionsList = document.getElementById('options');

    // Garante que o contêiner do quiz está visível
    quizContainer.style.display = 'block';
    const currentQuestion = questions[currentQuestionIndex];
    
    // Define o texto da pergunta
    questionElement.textContent = currentQuestion.getAttribute('text');
    
    // Limpa as opções de respostas anteriores
    optionsList.innerHTML = '';
    
    // Cria as opções de respostas para a pergunta atual
    const answers = currentQuestion.getElementsByTagName('answer');
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const listItem = document.createElement('li');
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'answer';
        radioButton.value = answer.getAttribute('correct') === 'true';

        const label = document.createElement('label');
        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(answer.textContent));
        
        listItem.appendChild(label);
        optionsList.appendChild(listItem);
    }

    // Atualiza os botões de navegação
    updateNavigationButtons();
}

// Atualiza os botões "Anterior" e "Próximo" com base na questão atual
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    // Verifica se é a primeira pergunta para ocultar ou exibir o botão "Anterior"
    if (currentQuestionIndex > 0) {
        prevButton.style.display = 'inline';
        prevButton.onclick = goToPreviousQuestion;
    } else {
        prevButton.style.display = 'none';
    }
    
    // Atualiza o texto e o evento do botão "Próximo" com base na questão atual
    nextButton.style.display = 'inline';
    if (currentQuestionIndex < questions.length - 1) {
        nextButton.textContent = 'Próxima';
        nextButton.onclick = goToNextQuestion;
    } else {
        nextButton.textContent = 'Ver Resultados';
        nextButton.onclick = showResults;
    }
}

// Navega para a questão anterior
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navega para a próxima questão ou termina o quiz
function goToNextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        alert('Por favor, selecione uma resposta.');
        return;
    }
    const isCorrect = selectedAnswer.value === 'true';
    if (isCorrect) {
        score++;
    }
    selectedAnswer.checked = false; // Desmarca a resposta selecionada
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

// Continua na próxima parte...
// Parte 3: Exibição dos resultados e reinicialização do quiz

// Mostra os resultados do quiz
function showResults() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `<h2>Resultado do Quiz</h2>
        <p>Sua pontuação é ${score} de ${questions.length}.</p>
        <button id="restart-quiz">Reiniciar Quiz</button>`;

    // Adiciona evento de clique ao botão de reiniciar
    document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
}

// Reinicia o quiz
function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    const quizSelector = document.getElementById('quiz-selector');
    const modeSelection = document.getElementById('mode-selection');
    const quizContainer = document.getElementById('quiz-container');
    
    quizSelector.disabled = false; // Reativa o seletor de quiz
    modeSelection.style.display = 'block'; // Mostra a seleção de modo
    quizContainer.style.display = 'none'; // Esconde o container do quiz
    
    // Se necessário, reset o timer
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById('timer').textContent = 'Tempo: 00:00';
        timerInterval = null;
    }
}

// Função para iniciar o timer do quiz no modo simulado
function startTimer() {
    // Limpa o timer anterior se estiver rodando
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const timerElement = document.getElementById('timer');
    let startTime = new Date();
    timerElement.style.display = 'block';

    timerInterval = setInterval(() => {
        const elapsedTime = new Date() - startTime;
        const minutes = Math.floor(elapsedTime / (1000 * 60));
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        timerElement.textContent = `Tempo: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Adiciona funcionalidade para os botões "Próxima" e "Anterior"
document.getElementById('next').addEventListener('click', goToNextQuestion);
document.getElementById('prev').addEventListener('click', goToPreviousQuestion);

// Inicializa o quiz ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
    document.getElementById('quiz-selector').addEventListener('change', () => {
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer.style.display !== 'none') {
            // Opção de recarregar o quiz se um novo for selecionado após o início do quiz
            loadQuiz(document.getElementById('quiz-selector').value);
        }
    });
});
