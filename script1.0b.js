

///////////////**************************************************************************************************

    // Variáveis para rastrear o estado do quiz
let score = 0;
let currentQuestionIndex = 0;
let questions = [];
let currentMode = '';
let timerInterval = null;
let startTime;
let lastAnswerCorrect = null;
let lastExplanation = '';

// Funções
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedTime = new Date(now - startTime);
        const minutes = elapsedTime.getUTCMinutes();
        const seconds = elapsedTime.getUTCSeconds();
        document.getElementById('timer').textContent = `Tempo: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function loadQuiz(quizFile) {
   /// console.log('Tentando carregar o arquivo:', quizFile); 
    const xhr = new XMLHttpRequest();
    xhr.open('GET', quizFile, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xhr.responseText, 'application/xml');
/////// console.log('XML carregado:', quizFile);
            questions = xmlDoc.getElementsByTagName('question');
            displayQuestion();
        } else {
            console.error('Erro ao carregar o quiz:', xhr.status);
            alert('Erro ao carregar o quiz.');
        }
    };
    xhr.onerror = function() {
        console.error('Erro na rede ou ao tentar carregar o quiz.');
        alert('Erro ao carregar o quiz.');
    };
    xhr.send();
}


function processAnswer(answerIndex) {
    const question = questions[currentQuestionIndex];
    const answers = question.getElementsByTagName('answer');
    const correctAnswer = answers[answerIndex].getAttribute('correct') === 'true';
    
    console.log(`Resposta ${answerIndex} é correta:`, correctAnswer);
    
    lastAnswerCorrect = correctAnswer;
    lastExplanation = question.getAttribute('explanation');

    if (correctAnswer) {
        score++;
    }

    // Exibe o alerta de resposta correta/incorreta com explicação no modo de estudo.
    if (currentMode === 'study') {
        let message = correctAnswer ? 'Correto! ' : 'Incorreto. ';
        message += `\nExplicação: ${lastExplanation}`;
        console.log('Exibindo alerta de resposta:', message);
        alert(message);
    }
}



function goToNextQuestion() {
    console.log('Modo atual:', currentMode);
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    
    // Verifica se estamos no modo de estudo ou simulado, o que exige uma resposta selecionada.
    if (currentMode !== 'reading' && !selectedAnswer) {
        console.log('Nenhuma resposta selecionada e o modo requer uma.');
        alert('Por favor, selecione uma resposta.');
        return;
    }

    // Processa a resposta selecionada, se houver uma.
    if (selectedAnswer) {
        const selectedAnswerIndex = parseInt(selectedAnswer.value, 10);
        console.log('Processando resposta com index:', selectedAnswerIndex);
        processAnswer(selectedAnswerIndex);
    } else {
        console.log('Nenhuma resposta para processar.');
    }

    // Avança para a próxima questão ou mostra os resultados se for o fim do quiz.
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        console.log('Mostrando próxima questão.');
        displayQuestion();
        // Verifica se é a última questão e altera o texto do botão "Próximo"
        if (currentQuestionIndex === questions.length - 1) {
            const nextButton = document.querySelector('.next-button');
            nextButton.textContent = 'Ver Resultados';
        }
    } else {
        console.log('Fim do quiz, mostrando resultados.');
        removeExistingNavigationButtons();
        showResults();

    }
     console.log(`Acertos: ${score}. Erros: ${currentQuestionIndex - score}`);
}


function showResults() {
    clearInterval(timerInterval);
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `<h2>Resultados do Quiz</h2>
        <p>Acertos: ${score}</p>
        <p>Erros: ${currentQuestionIndex - score}</p>`;
}


function displayQuestion() {
   // console.log("displayQuestion chamada para a questão de índice: ", currentQuestionIndex);

    // Verifica se o quiz já foi completado e, em caso afirmativo, mostra os resultados
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    // Prepara a interface para a exibição da questão
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'block';
    document.getElementById('mode-selection').style.display = 'none';

    // Limpa o conteúdo de questões e opções anteriores
    const questionElement = document.getElementById('question');
    const optionsList = document.getElementById('options');
    const dataContainer = document.getElementById('data-container');
    questionElement.innerHTML = '';
    optionsList.innerHTML = '';
    dataContainer.innerHTML = '';

    // Recupera a questão atual e atualiza o elemento com o texto da questão
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.getAttribute('text');

    // Cria e exibe as opções de resposta para a questão atual
    const answers = question.getElementsByTagName('answer');
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const isCorrect = answer.getAttribute('correct') === 'true';

    // No Modo Leitura, apenas as respostas corretas são exibidas
        if (currentMode !== 'reading' || isCorrect) {
          const listItem = document.createElement('li');
          const input = document.createElement('input');
         input.type = 'radio';
         input.name = 'answer';
         input.value = i;
          // Desabilita os inputs no Modo Leitura
         input.disabled = currentMode === 'reading';

         const label = document.createElement('label');
         label.appendChild(input);
         label.append(answer.textContent);
        
         listItem.appendChild(label);
         optionsList.appendChild(listItem);
        }
    }
    
            addNavigationButtons();     
}

function addNavigationButtons() {

    console.log('Adicionando botões de navegação...');
     const navigationContainer = document.getElementById('data-container');
    if (!navigationContainer) {
        console.error('Container de navegação não encontrado!');
        return;
    }
     // Certifique-se de remover os botões existentes para evitar duplicações
    removeExistingNavigationButtons();

    // Cria e adiciona o botão "Anterior" se não for a primeira questão
    if (currentQuestionIndex > 0) {
        const prevButton = createNavigationButton('prev-button', 'Anterior', () => {
            currentQuestionIndex--;
            displayQuestion();
        });
        navigationContainer.appendChild(prevButton);
    }


    // Cria e adiciona o botão "Próximo" se não for a última questão
    if (currentQuestionIndex < questions.length) {
        const nextButton = createNavigationButton('next-button', 'Próximo', () => {
            goToNextQuestion();
        });
        navigationContainer.appendChild(nextButton);
    }
}

/**
 * Cria um botão de navegação com o id, texto e evento de clique fornecidos.
 * @param {string} id - O id para o botão.
 * @param {string} text - O texto a ser exibido no botão.
 * @param {Function} clickHandler - A função a ser chamada quando o botão é clicado.
 * @returns {HTMLButtonElement} O botão de navegação criado.
 */
function createNavigationButton(id, text, clickHandler) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.onclick = clickHandler;
    return button;
}


function removeExistingNavigationButtons() {
    const existingPrevButton = document.getElementById('prev-button');
    const existingNextButton = document.getElementById('next-button');
    
    existingPrevButton?.remove();
    existingNextButton?.remove();
}


document.addEventListener('DOMContentLoaded', function() {
    const startQuizButton = document.getElementById('start-quiz');
    const quizSelector = document.getElementById('quiz-selector');
    
    startQuizButton.addEventListener('click', function() {
        const modeSelected = document.querySelector('input[name="mode"]:checked');
        if (!modeSelected) {
            alert('Por favor, escolha um modo antes de começar.');
            return;
        }
        
        currentMode = modeSelected.value;
        const selectedQuiz = quizSelector.value;
        loadQuiz(selectedQuiz); // Carrega o quiz selecionado

        if (currentMode === 'simulated') {
            document.getElementById('timer').style.display = 'block';
            startTimer();
        }

        // Desabilita o combo box após o início do quiz
        quizSelector.disabled = true;
    });
});



