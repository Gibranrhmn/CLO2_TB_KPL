const QuizConfig = require('../quizConfig');
const fs = require('fs');

describe('QuizConfig', () => {
  let config;

  beforeEach(() => {
    config = new QuizConfig();
  });

  test('should load default configuration', () => {
    expect(config.get('timeLimit')).toBe(30);
    expect(config.get('shuffleQuestions')).toBe(true);
  });

  test('should set and get configuration values', () => {
    config.set('timeLimit', 60);
    expect(config.get('timeLimit')).toBe(60);
  });

  test('should throw error for invalid key', () => {
    expect(() => config.get('invalidKey')).toThrow('Konfigurasi "invalidKey" tidak ditemukan');
  });

  test('should save configuration to file', () => {
    const filePath = 'testConfig.json';
    config.saveToFile(filePath);
    const savedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(savedConfig.timeLimit).toBe(30);
    fs.unlinkSync(filePath); // Clean up
  });
});
