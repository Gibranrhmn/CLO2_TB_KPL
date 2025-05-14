const QuizManager = require('../quizManager');
const QuizConfig = require('../quizConfig');
const quizData = require('../quizData');

describe('QuizManager', () => {
  let quizManager;
  let config;

  beforeEach(() => {
    config = new QuizConfig();
    quizManager = new QuizManager(quizData, config);
  });

  test('should initialize with correct properties', () => {
    expect(quizManager.score).toBe(0);
    expect(quizManager.totalPoints).toBe(0);
    expect(quizManager.questions).toEqual([]);
    expect(quizManager.currentQuestionIndex).toBe(0);
  });

  test('should select questions correctly', async () => {
    await quizManager.selectQuestions();
    expect(quizManager.questions.length).toBeGreaterThan(0);
  });

  test('should check answer correctly', async () => {
    await quizManager.selectQuestions();
    const question = quizManager.getCurrentQuestion();
    const isCorrect = quizManager.checkAnswer(question.correctAnswer);
    expect(isCorrect).toBe(true);
    expect(quizManager.score).toBe(question.points);
  });

  test('should return results correctly', async () => {
    await quizManager.selectQuestions();
    quizManager.checkAnswer(quizManager.getCurrentQuestion().correctAnswer);
    const results = quizManager.getResults();
    expect(results).toHaveProperty('userId');
    expect(results).toHaveProperty('score');
    expect(results).toHaveProperty('totalPoints');
    expect(results).toHaveProperty('percentage');
    expect(results).toHaveProperty('feedback');
  });
});
