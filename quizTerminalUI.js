const readline = require('readline');
const Contract = require('./contract');
const QuizManager = require('./quizManager'); // Tambahkan ini
/**
 * Class untuk antarmuka pengguna berbasis terminal
 * Menggunakan library readline bawaan Node.js
 */
class QuizTerminalUI {
  constructor(quizManager) {
    Contract.require(quizManager instanceof QuizManager, 'quizManager harus instans dari QuizManager');
    
    this.quizManager = quizManager;
    this.config = quizManager.config;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.timer = null;
  }

  showBanner() {
    console.clear();
    const theme = this.config.get('theme');
    console.log(`${theme.highlight}================================================${theme.normal}`);
    console.log(`${theme.highlight}                QUIZ TERMINAL                   ${theme.normal}`);
    console.log(`${theme.highlight}================================================${theme.normal}`);
    console.log(`Selamat datang di aplikasi Quiz Terminal!\n`);
  }

  /**
   * Menampilkan menu utama
   */
  showMainMenu() {
    this.showBanner();
    console.log('Pilih opsi:');
    console.log('1. Mulai Kuis');
    console.log('2. Pengaturan');
    console.log('3. Keluar');
    
    this.rl.question('\nPilihan Anda: ', (answer) => {
      switch (answer) {
        case '1':
          this.startQuiz();
          break;
        case '2':
          this.showSettings();
          break;
        case '3':
          this.exitQuiz();
          break;
        default:
          console.log('\nPilihan tidak valid. Silakan coba lagi.');
          setTimeout(() => this.showMainMenu(), 1500);
      }
    });
  }

  /**
   * Menampilkan menu pengaturan
   */
  showSettings() {
    this.showBanner();
    console.log('== PENGATURAN ==\n');
    console.log(`1. Batas Waktu per Soal: ${this.config.get('timeLimit')} detik`);
    console.log(`2. Acak Soal: ${this.config.get('shuffleQuestions') ? 'Ya' : 'Tidak'}`);
    console.log(`3. Jumlah Soal: ${this.config.get('maxQuestions')}`);
    console.log(`4. Tampilkan Timer: ${this.config.get('showTimer') ? 'Ya' : 'Tidak'}`);
    console.log('5. Kembali ke Menu Utama');
    
    this.rl.question('\nPilihan Anda: ', (answer) => {
      switch (answer) {
        case '1':
          this.setSetting('timeLimit');
          break;
        case '2':
          this.toggleSetting('shuffleQuestions');
          break;
        case '3':
          this.setSetting('maxQuestions');
          break;
        case '4':
          this.toggleSetting('showTimer');
          break;
        case '5':
          this.showMainMenu();
          break;
        default:
          console.log('\nPilihan tidak valid. Silakan coba lagi.');
          setTimeout(() => this.showSettings(), 1500);
      }
    });
  }

  /**
   * Mengubah pengaturan numerik
   * @param {string} setting - Nama pengaturan
   */
  setSetting(setting) {
    const currentValue = this.config.get(setting);
    this.rl.question(`\nMasukkan nilai baru untuk ${setting} (saat ini: ${currentValue}): `, (value) => {
      const numValue = parseInt(value);
      
      if (!isNaN(numValue) && numValue > 0) {
        this.config.set(setting, numValue);
        console.log(`\n${setting} berhasil diubah menjadi ${numValue}`);
      } else {
        console.log('\nNilai tidak valid. Harus berupa angka positif.');
      }
      
      setTimeout(() => this.showSettings(), 1500);
    });
  }

  /**
   * Mengganti pengaturan boolean
   * @param {string} setting - Nama pengaturan
   */
  toggleSetting(setting) {
    const currentValue = this.config.get(setting);
    this.config.set(setting, !currentValue);
    console.log(`\n${setting} berhasil diubah menjadi ${!currentValue ? 'Tidak' : 'Ya'}`);
    setTimeout(() => this.showSettings(), 1500);
  }

  /**
   * Memulai kuis
   */
  async startQuiz() {
    console.log("Memulai kuis...");
    const quizStarted = await this.quizManager.startQuiz();
    
    if (!quizStarted) {
      console.log("Tidak dapat memulai kuis. Kembali ke menu utama...");
      setTimeout(() => this.showMainMenu(), 2000);
      return;
    }
    
    this.showQuestion();
  }

  /**
   * Menampilkan soal saat ini
   */
  showQuestion() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    const theme = this.config.get('theme');
    
    // Pastikan terdapat soal yang dapat ditampilkan
    if (!this.quizManager.questions || this.quizManager.questions.length === 0) {
      console.log("Tidak ada soal yang tersedia. Kembali ke menu utama...");
      setTimeout(() => this.showMainMenu(), 2000);
      return;
    }
    
    // Pastikan index soal tidak melewati batas
    if (this.quizManager.currentQuestionIndex >= this.quizManager.questions.length) {
      console.log("Semua soal sudah dijawab. Menampilkan hasil...");
      this.showResults();
      return;
    }
    
    const currentQuestion = this.quizManager.getCurrentQuestion();
    const questionNumber = this.quizManager.currentQuestionIndex + 1;
    const totalQuestions = this.quizManager.questions.length;
    
    console.clear();
    console.log(`${theme.highlight}================================================${theme.normal}`);
    console.log(`${theme.highlight} Soal ${questionNumber} dari ${totalQuestions} - ${currentQuestion.category} (${currentQuestion.difficulty}) ${theme.normal}`);
    console.log(`${theme.highlight}================================================${theme.normal}\n`);
    
    console.log(currentQuestion.question + '\n');
    
    currentQuestion.options.forEach(option => {
      console.log(option);
    });
    
    // Set timer jika diperlukan
    const timeLimit = this.config.get('timeLimit');
    const showTimer = this.config.get('showTimer');
    let timerInterval;
    
    if (showTimer) {
      console.log(`\n${theme.timer}Waktu tersisa: ${timeLimit} detik${theme.normal}`);
      
      let timeLeft = timeLimit;
      timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
          // Clear previous line and update timer
          process.stdout.write(`\r${theme.timer}Waktu tersisa: ${timeLeft} detik${' '.repeat(10)}${theme.normal}`);
        }
      }, 1000);
      
      this.timer = setTimeout(() => {
        clearInterval(timerInterval);
        console.log(`\n\n${theme.incorrect}Waktu habis!${theme.normal}`);
        this.quizManager.answers[currentQuestion.id] = {
          question: currentQuestion.question,
          userAnswer: "",
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: false
        };
        
        setTimeout(() => this.handleNextQuestion(), 2000);
      }, timeLimit * 1000);
    }
    
    this.rl.question('\nJawaban Anda (A/B/C/D): ', (answer) => {
      // Hentikan timer jika ada
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      
      if (showTimer) {
        clearInterval(timerInterval);
      }
      
      const isValid = /^[A-Da-d]$/.test(answer);
      
      if (!isValid) {
        console.log(`\n${theme.incorrect}Jawaban tidak valid. Harus berupa A, B, C, atau D.${theme.normal}`);
        setTimeout(() => this.showQuestion(), 1500);
        return;
      }
      
      const isCorrect = this.quizManager.checkAnswer(answer);
      
      if (isCorrect) {
        console.log(`\n${theme.correct}Benar! +${currentQuestion.points} poin${theme.normal}`);
      } else {
        console.log(`\n${theme.incorrect}Salah! Jawaban yang benar adalah ${currentQuestion.correctAnswer}${theme.normal}`);
      }
      
      setTimeout(()      => this.handleNextQuestion(), 2000);
    });
  }

  /**
   * Menangani pindah ke soal berikutnya
   */
  handleNextQuestion() {
    const hasNext = this.quizManager.nextQuestion();
    if (hasNext) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  }

  /**
   * Menampilkan hasil kuis
   */
  showResults() {
    const results = this.quizManager.getResults();
    const theme = this.config.get('theme');

    console.clear();
    console.log(`${theme.highlight}================================================${theme.normal}`);
    console.log(`${theme.highlight}                  HASIL KUIS                    ${theme.normal}`);
    console.log(`${theme.highlight}================================================${theme.normal}`);
    console.log(`ID Pengguna: ${results.userId}`);
    console.log(`Skor: ${results.score} dari ${results.totalPoints} (${results.percentage}%)`);
    console.log(`Jumlah Soal: ${results.questionCount}`);
    console.log(`Jumlah Benar: ${results.correctCount}`);
    console.log(`Durasi: ${results.duration.total}`);
    console.log(`Feedback: ${results.feedback}`);
    console.log(`${theme.highlight}================================================${theme.normal}`);

    // Tampilkan jawaban yang diberikan
    console.log(`\nDetail Jawaban:`);
    for (const answer of Object.values(results.answers)) {
      console.log(`Soal: ${answer.question}`);
      console.log(`Jawaban Anda: ${answer.userAnswer} | Jawaban Benar: ${answer.correctAnswer}`);
      console.log(`Status: ${answer.isCorrect ? 'Benar' : 'Salah'}`);
      console.log(`${theme.highlight}------------------------------------------------${theme.normal}`);
    }

    this.rl.question('\nTekan Enter untuk kembali ke menu utama...', () => {
      this.showMainMenu();
    });
  }

  /**
   * Keluar dari aplikasi
   */
  exitQuiz() {
    console.log("Terima kasih telah menggunakan aplikasi Quiz Terminal. Sampai jumpa!");
    this.rl.close();
    process.exit(0);
  }
}

module.exports = QuizTerminalUI;