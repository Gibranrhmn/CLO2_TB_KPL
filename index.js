const QuizConfig = require('./quizConfig');
const quizData = require('./quizData');
const QuizManager = require('./quizManager'); // Assume this is defined in a separate file
const QuizTerminalUI = require('./quizTerminalUI');
const QuizAPI = require('./quizAPI'); // If using API

(async () => {
  const config = new QuizConfig(); // Load default or custom config
  const quizManager = new QuizManager(quizData, config);
  const quizUI = new QuizTerminalUI(quizManager);

  // Start the application
  quizUI.showMainMenu();
})();
