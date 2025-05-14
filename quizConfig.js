const fs = require('fs');
const Contract = require('./contract');

/**
 * Class untuk konfigurasi yang dapat diubah saat runtime
 */
class QuizConfig {
  constructor(configPath = null) {
    this.config = {
      timeLimit: 30,
      shuffleQuestions: true,
      maxQuestions: 5,
      categories: ["programming", "mathematics"],
      difficulties: ["easy", "medium", "hard"],
      showFeedback: true,
      showTimer: true,
      theme: {
        correct: "\x1b[32m",
        incorrect: "\x1b[31m",
        normal: "\x1b[0m",
        highlight: "\x1b[1m",
        timer: "\x1b[33m"
      }
    };

    if (configPath && fs.existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = { ...this.config, ...fileConfig };
      } catch (err) {
        console.error(`Error loading configuration: ${err.message}`);
      }
    }
  }

  get(key) {
    Contract.require(typeof key === 'string', 'Key harus berupa string');
    Contract.require(key in this.config, `Konfigurasi "${key}" tidak ditemukan`);
    
    return this.config[key];
  }

  set(key, value) {
    Contract.require(typeof key === 'string', 'Key harus berupa string');
    Contract.require(key in this.config, `Konfigurasi "${key}" tidak ditemukan`);
    
    this.config[key] = value;
  }

  saveToFile(path) {
    Contract.require(typeof path === 'string', 'Path harus berupa string');
    
    try {
      fs.writeFileSync(path, JSON.stringify(this.config, null, 2));
      return true;
    } catch (err) {
      console.error(`Error saving configuration: ${err.message}`);
      return false;
    }
  }
}

module.exports = QuizConfig;
