const Contract = require('./contract');
const QuizConfig = require('./quizConfig'); // Tambahkan ini
const { performance } = require('perf_hooks');
/**
 * Class untuk mengelola kuis
 */
class QuizManager {
  constructor(quizData, config, api = null) {
    Contract.require(quizData && typeof quizData === 'object', 'quizData harus berupa object');
    Contract.require(config instanceof QuizConfig, 'config harus instans dari QuizConfig');
    
    this.quizData = quizData;
    this.config = config;
    this.api = api; // API untuk bank soal eksternal
    this.score = 0;
    this.totalPoints = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.startTime = null;
    this.endTime = null;
    this.userId = `user-${Date.now()}`; // ID sementara untuk pengguna
  }

  async selectQuestions() {
    const categories = this.config.get('categories');
    const difficulties = this.config.get('difficulties');
    const maxQuestions = this.config.get('maxQuestions');
    const shuffleQuestions = this.config.get('shuffleQuestions');
  
    let allQuestions = [];
  
    // Jika API tersedia, gunakan API untuk mendapatkan soal
    if (this.api) {
      try {
        allQuestions = await this.api.getQuestions(categories, difficulties, maxQuestions);
        console.log(`Berhasil mendapatkan ${allQuestions.length} soal dari API`);
      } catch (error) {
        console.error(`Error fetching questions from API: ${error.message}`);
        console.log("Menggunakan data soal lokal sebagai fallback...");
  
        // Fallback ke data lokal jika API gagal
        allQuestions = this._getLocalQuestions(categories, difficulties);
      }
    } else {
      // Gunakan data lokal jika API tidak tersedia
      allQuestions = this._getLocalQuestions(categories, difficulties);
    }
  
    // Kocok soal jika diperlukan
    if (shuffleQuestions && allQuestions.length > 0) {
      allQuestions = this._shuffleArray(allQuestions);
    }
  
    // Ambil maksimal soal sesuai konfigurasi
    this.questions = allQuestions.slice(0, maxQuestions);
  
    // Debugging log
    console.log(`Soal yang dipilih: ${this.questions.length}`);
  
    // Hitung total poin yang mungkin
    this.totalPoints = this.questions.reduce((total, q) => total + q.points, 0);
  
    Contract.ensure(this.questions.length > 0, 'Daftar soal tidak boleh kosong');
    Contract.ensure(this.totalPoints > 0, 'Total poin harus lebih dari 0');
  
    return this.questions;
  }

  _getLocalQuestions(categories, difficulties) {
    let allQuestions = [];
    
    // Mengumpulkan soal dari kategori dan tingkat kesulitan yang dipilih
    categories.forEach(category => {
      Contract.require(
        category in this.quizData.categories, 
        `Kategori "${category}" tidak ditemukan`
      );
      
      difficulties.forEach(difficulty => {
        Contract.require(
          difficulty in this.quizData.categories[category].questions,
          `Tingkat kesulitan "${difficulty}" tidak ditemukan dalam kategori "${category}"`
        );
        
        const questions = this.quizData.categories[category].questions[difficulty];
        questions.forEach(q => {
          allQuestions.push({
            ...q,
            category,
            difficulty
          });
        });
      });
    });
    
    return allQuestions;
  }

  _shuffleArray(array) {
    Contract.require(Array.isArray(array), 'Parameter harus berupa array');
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async startQuiz() {
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.startTime = performance.now();
  
    await this.selectQuestions();
  
    if (this.questions.length === 0) {
      console.error('Tidak ada soal yang tersedia. Periksa konfigurasi atau data soal.');
      return false;
    }
    
    return true;
  }

  getCurrentQuestion() {
    Contract.require(
      this.questions && this.questions.length > 0,
      'Daftar soal tidak boleh kosong'
    );
    
    Contract.require(
      this.currentQuestionIndex < this.questions.length,
      'Index soal saat ini melewati batas'
    );
    
    return this.questions[this.currentQuestionIndex];
  }

  checkAnswer(answer) {
    Contract.typeCheck(answer, 'string', 'answer');
    
    const currentQuestion = this.getCurrentQuestion();
    const isCorrect = answer.toUpperCase() === currentQuestion.correctAnswer;
    
    this.answers[currentQuestion.id] = {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };
    
    if (isCorrect) {
      this.score += currentQuestion.points;
    }
    
    return isCorrect;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }

  getResults() {
    this.endTime = performance.now();
    const durationMs = this.endTime - this.startTime;
    const durationMin = Math.floor(durationMs / 60000);
    const durationSec = Math.floor((durationMs % 60000) / 1000);
    
    const percentage = (this.score / this.totalPoints) * 100;
    
    // Cari feedback berdasarkan persentase nilai
    let feedback = '';
    for (const fb of this.quizData.feedbackTable) { // Pastikan feedbackTable ada
      if (percentage >= fb.threshold) {
        feedback = fb.message;
        break;
      }
    }
    
    const results = {
      userId: this.userId,
      score: this.score,
      totalPoints: this.totalPoints,
      percentage: percentage.toFixed(2),
      questionCount: this.questions.length,
      correctCount: Object.values(this.answers).filter(a => a.isCorrect).length,
      duration: {
        minutes: durationMin,
        seconds: durationSec,
        total: `${durationMin} menit ${durationSec} detik`,
        ms: durationMs
      },
      answers: this.answers,
      feedback,
      timestamp: new Date().toISOString()
    };
    
    // Jika API tersedia, kirim hasil ke API
    if (this.api) {
      this.api.submitResults(results)
        .then(response => {
          console.log(`Hasil berhasil disimpan di API dengan ID: ${response.id}`);
        })
        .catch(error => {
          console.error(`Error menyimpan hasil: ${error.message}`);
        });
    }
    
    return results;
  }
  

  async getUserStats() {
    if (this.api) {
      try {
        return await this.api.getUserStats(this.userId);
      } catch (error) {
        console.error(`Error mendapatkan statistik: ${error.message}`);
      }
    }
    
    // Return statistik default jika tidak ada API
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestCategory: null,
      recentActivity: []
    };
  }
}

module.exports = QuizManager;
