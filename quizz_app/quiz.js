

// Tabel soal 
const questions = [
    {
      question: "Apa ibu kota Indonesia?",
      options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
      answer: "Jakarta"
    },
    {
      question: "Siapa penemu lampu pijar?",
      options: ["Isaac Newton", "Nikola Tesla", "Thomas Edison", "Albert Einstein"],
      answer: "Thomas Edison"
    },
    {
      question: "Planet terbesar di tata surya adalah?",
      options: ["Bumi", "Mars", "Jupiter", "Venus"],
      answer: "Jupiter"
    }
  ];
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Fungsi validasi jawaban (parameterized dinamis)
  function validateAnswer(correct, userAnswer) {
    return correct === userAnswer;
  }
  
  let score = 0;
  let current = 0;
  
  function askQuestion() {
    const q = questions[current];
    console.log(`\n${current + 1}. ${q.question}`);
    q.options.forEach((opt, idx) => {
      console.log(`${idx + 1}. ${opt}`);
    });
  
    rl.question("Jawaban Anda (1-4): ", (input) => {
      const answerIndex = parseInt(input) - 1;
      if (answerIndex >= 0 && answerIndex < q.options.length) {
        const isCorrect = validateAnswer(q.answer, q.options[answerIndex]);
        if (isCorrect) {
          console.log("Benar!");
          score++;
        } else {
          console.log(`Salah. Jawaban yang benar adalah: ${q.answer}`);
        }
      } else {
        console.log("Input tidak valid. Jawaban dianggap salah.");
      }
  
      current++;
      if (current < questions.length) {
        askQuestion();
      } else {
        console.log(`\nKuis selesai! Skor Anda: ${score}/${questions.length}`);
        rl.close();
      }
    });
  }
  
  console.log("Selamat datang di Kuis Ensiklopedia!");
  askQuestion();
  