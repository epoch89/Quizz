// Parte 1: Inicialização e Carregamento do Quiz

// Variáveis de estado do quiz.
let score = 0; // Pontuação do usuário.
let currentQuestionIndex = 0; // Índice da questão atual.
let questions = []; // Array para armazenar as perguntas do quiz.
let currentMode = ''; // Modo do quiz selecionado pelo usuário.

// Espera o conteúdo do DOM ser carregado antes de adicionar os ouvintes de eventos.
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona um ouvinte de evento no botão para iniciar o quiz.
    document.getElementById('start-quiz').addEventListener('click', startQuiz);

 // Adiciona os ouvintes de evento para os botões de navegação.
    // Assegure-se de que os botões já existam no seu HTML.
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', goToPreviousQuestion);
        nextButton.addEventListener('click', goToNextQuestion);
    } else {
        console.error('Botões de navegação não encontrados!');
    }

});

function startQuiz() {
    console.log('Iniciando o quiz.');
    // Obtém o modo do quiz selecionado pelo usuário.
    const modeSelected = document.querySelector('input[name="mode"]:checked');
    // Verifica se um modo foi selecionado, caso contrário, exibe um alerta.
    if (!modeSelected) {
        alert('Por favor, escolha um modo antes de começar.');
        return;
    }
    // inicia timer se modo simulado;
    if (currentMode === 'simulated') {
        startTimer();
    }
    // Define o modo atual baseado na seleção do usuário.
    currentMode = modeSelected.value;

    // Esconde apenas o botão "Iniciar Quiz".
    const startQuizButton = document.getElementById('start-quiz');
    startQuizButton.style.display = 'none';

    // Carrega o quiz com base no arquivo XML selecionado no dropdown.
    const quizSelector = document.getElementById('quiz-selector');
    loadQuiz(quizSelector.value);
}




// Função para carregar o arquivo XML do quiz.
function loadQuiz(quizFile) {
    console.log('Carregando o arquivo do quiz:', quizFile);
    // Faz uma solicitação HTTP GET para o arquivo do quiz.
    fetch(quizFile)
        .then(response => {
            // Verifica se a resposta é bem-sucedida.
            if (!response.ok) {
                throw new Error('Erro ao carregar o quiz');
            }
            // Retorna o texto da resposta para a próxima etapa de processamento.
            return response.text();
        })
        .then(parseQuizXML) // Converte o texto XML em elementos DOM.
        .then(displayQuestion) // Exibe a primeira questão.
        .catch(error => {
            // Em caso de erro, exibe um alerta com a mensagem de erro.
            console.error(error.message);
            alert(error.message);
        });
}

// Função para analisar o texto XML do quiz.
function parseQuizXML(xmlText) {
    // Cria um novo DOMParser para analisar o texto XML.
    const parser = new DOMParser();
    // Analisa o texto XML e retorna um documento XML.
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    // Converte a coleção HTML de questões em um array.
    questions = Array.from(xmlDoc.getElementsByTagName('question'));
    console.log('XML analisado com sucesso e questões carregadas.');
}

// Continuaremos com as partes seguintes em sequência.
// Parte 2: Navegação entre as Perguntas e Exibição

// Função para exibir a pergunta atual no quiz.
function displayQuestion() {
    console.log('Exibindo pergunta de índice:', currentQuestionIndex);

    // Seleciona elementos DOM que serão atualizados.
    const quizContainer = document.getElementById('quiz-container');
    const questionElement = document.getElementById('question');
    const optionsList = document.getElementById('options');
    const dataContainer = document.getElementById('data-container');
    const explanationDiv = document.getElementById('explanation');

    // Garante que o contêiner do quiz está visível.
    quizContainer.style.display = 'block';
    // Limpa o contêiner de explicação.
    explanationDiv.innerHTML = '';
    explanationDiv.style.display = 'none';

    // Obtém a questão atual baseada no índice.
    const currentQuestion = questions[currentQuestionIndex];

    // Define o texto da pergunta no elemento de questão.
    questionElement.textContent = currentQuestion.getAttribute('text');
    
    // Limpa as opções de respostas anteriores.
    optionsList.innerHTML = '';
    
    // Limpa o contêiner de dados anterior (onde as imagens podem ser exibidas).
    dataContainer.innerHTML = '';

    // Verifica se a questão atual possui uma imagem associada e a exibe.
    const imageElement = currentQuestion.querySelector('data image');
    if (imageElement) {
        const img = document.createElement('img');
        img.src = imageElement.getAttribute('src');
        img.alt = imageElement.getAttribute('alt');
        dataContainer.appendChild(img);
        console.log('Imagem associada exibida:', img.src);
    }

    // Cria e exibe as opções de resposta para a questão atual.
    const answers = currentQuestion.getElementsByTagName('answer');
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        // No modo leitura, exibe apenas as respostas corretas.
        if (currentMode === 'reading' && answer.getAttribute('correct') !== 'true') {
            continue;
        }

        const listItem = document.createElement('li');
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'answer';
        radioButton.value = i; // Valor recebe o índice da resposta.

        // No modo leitura, desabilita a seleção das respostas.
        radioButton.disabled = currentMode === 'reading';

        const label = document.createElement('label');
        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(answer.textContent));

        listItem.appendChild(label);
        optionsList.appendChild(listItem);
    }

    // Atualiza os botões de navegação com base na questão atual.
    updateNavigationButtons();
}


// Função para atualizar os botões "Anterior" e "Próximo".
function updateNavigationButtons() {
    // Seleciona os botões pelo ID.
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    // Verifica se não estamos na primeira pergunta.
    prevButton.style.display = currentQuestionIndex > 0 ? 'inline' : 'none';
    
    // Configura o evento de clique para retroceder uma pergunta.
    prevButton.onclick = goToPreviousQuestion;

    // Atualiza o texto do botão "Próximo" e o evento de clique.
    nextButton.textContent = currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Ver Resultados';
    nextButton.onclick = currentQuestionIndex < questions.length - 1 ? goToNextQuestion : showResults;

    // Exibe o botão "Próximo".
    nextButton.style.display = 'inline';
    console.log('Botões de navegação atualizados.');
}

// Função para retroceder à pergunta anterior.
function goToPreviousQuestion() {
    console.log('Retornando à pergunta anterior:', currentQuestionIndex - 1);
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Função para avançar para a próxima pergunta ou terminar o quiz.
function goToNextQuestion() {
    console.log('Avançando para a próxima pergunta.');
    const nextButton = document.getElementById('next');
    nextButton.disabled = true; // Desativa temporariamente o botão

    // Apenas no Modo Estudo, verifique se uma resposta foi selecionada.
    if (currentMode === 'study') {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            alert('Por favor, selecione uma resposta.');
            return; // Impede de avançar para a próxima pergunta se nenhuma resposta foi selecionada.
        }

        // Processa a resposta e mostra a explicação.
        processAnswer(selectedAnswer);
    }

    // Em outros modos, apenas incrementa o índice da pergunta e exibe a próxima.
    else {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }
    nextButton.disabled = false;
}

function processAnswer(selectedAnswer) {
    const isCorrect = selectedAnswer.value === 'true';
    const explanation = questions[currentQuestionIndex].getAttribute('explanation');

    alert(isCorrect ? 'Resposta correta!' : 'Resposta incorreta.' + "\nExplicação: " + explanation);

    if (isCorrect) {
        score++;
    }

    // Desmarca a resposta selecionada para a próxima pergunta.
    selectedAnswer.checked = false;

    // Incrementa o índice da pergunta para a próxima pergunta.
    currentQuestionIndex++;
    
    // Chama displayQuestion para a próxima pergunta ou showResults se for o final do quiz.
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}


// Na próxima interação, continuaremos com a exibição dos resultados e a reinicialização do quiz.
// Parte 3: Exibição dos Resultados e Reinicialização do Quiz

// Função para mostrar os resultados do quiz.
function showResults() {
    console.log('Mostrando resultados do quiz. Score:', score);

    // Seleciona o contêiner do quiz para atualizar o conteúdo.
    const quizContainer = document.getElementById('quiz-container');
    
    // Limpa o contêiner do quiz e exibe os resultados.
    quizContainer.innerHTML = `
        <h2>Resultado do Quiz</h2>
        <p>Sua pontuação é ${score} de ${questions.length}.</p>
        <button id="restart-quiz">Reiniciar Quiz</button>`;

    // Adiciona o ouvinte de evento ao botão de reiniciar para que o quiz possa ser reiniciado.
    document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
}

// Função para reiniciar o quiz.
function restartQuiz() {
    console.log('Reiniciando o quiz.');

    // Reseta as variáveis de estado do quiz.
    score = 0;
    currentQuestionIndex = 0;
    
    // Seleciona os elementos DOM relevantes para reinicializar suas visibilidades e estados.
    const quizSelector = document.getElementById('quiz-selector');
    const modeSelection = document.getElementById('mode-selection');
    const quizContainer = document.getElementById('quiz-container');
    
    // Habilita novamente o seletor de quiz.
    quizSelector.disabled = false;
    
    // Mostra a seleção de modo e esconde o contêiner do quiz.
    modeSelection.style.display = 'block';
    quizContainer.style.display = 'none';
    
    // Se necessário, reseta o timer.
    resetTimer();
}

// Função para iniciar o timer do quiz no modo simulado.
function startTimer() {
    console.log('Iniciando o timer.');

    // Reseta o timer existente para evitar múltiplas instâncias.
    resetTimer();
    
    // Seleciona o elemento do timer e o torna visível.
    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block';
    
    // Define o tempo de início.
    let startTime = Date.now();

    // Atualiza o timer a cada segundo.
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);

        // Atualiza o texto do timer com os minutos e segundos.
        timerElement.textContent = `Tempo: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Função para resetar e esconder o timer.
function resetTimer() {
    if (timerInterval) {
        console.log('Resetando o timer.');
        clearInterval(timerInterval);
        document.getElementById('timer').textContent = 'Tempo: 00:00';
        document.getElementById('timer').style.display = 'none';
        timerInterval = null;
    }
}

// Adiciona funcionalidade aos botões de navegação.
document.getElementById('next').addEventListener('click', goToNextQuestion);
document.getElementById('prev').addEventListener('click', goToPreviousQuestion);

// Inicializa o quiz ao carregar a página.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
    document.getElementById('quiz-selector').addEventListener('change', () => {
        // Se um novo quiz for selecionado após o início do quiz, recarrega o quiz.
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer.style.display !== 'none') {
            loadQuiz(document.getElementById('quiz-selector').value);
        }
    });
});
