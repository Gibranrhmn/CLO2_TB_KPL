/**
 * Data soal kuis menggunakan pendekatan table-driven
 * Soal dikelompokkan berdasarkan kategori dan tingkat kesulitan
 */

const fs = require('fs');

/**
 * Memuat data soal kuis dari file JSON
 */
const loadQuizData = () => {
  const data = fs.readFileSync('quizQuestions.json', 'utf8');
  return JSON.parse(data);
};

const quizData = loadQuizData();

module.exports = quizData;
