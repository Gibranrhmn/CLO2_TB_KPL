// ensiklopedia-kuis.js
// Program Kuis Ensiklopedia menggunakan teknik konstruksi Library dan Runtime configuration

const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk'); // Library untuk pewarnaan teks di terminal

// Runtime configuration menggunakan file JSON
const CONFIG_FILE = 'config.json';
let config = {};

/**
 * @contract
 * @requires CONFIG_FILE tersedia dan berformat JSON yang valid
 * @ensures config terisi dengan pengaturan dari file konfigurasi
 */
function loadConfiguration() {
  try {
    console.log(chalk.blue('Memuat konfigurasi...'));
    const rawConfig = fs.readFileSync(CONFIG_FILE, 'utf8');
    config = JSON.parse(rawConfig);
    console.log(chalk.green('Konfigurasi berhasil dimuat.'));
    return true;
  } catch (error) {
    console.log(chalk.red('Error saat memuat konfigurasi: ' + error.message));
    return false;
  }
}

// Library untuk manajemen pertanyaan kuis
const KuisManager = {
  pertanyaan: [],
  
  /**
   * @contract
   * @requires filePath adalah string dan valid
   * @ensures this.pertanyaan terisi dengan data pertanyaan dari file
   */
  muatPertanyaan: function(filePath) {
    try {
      console.log(chalk.blue('Memuat bank pertanyaan...'));
      const pertanyaanRaw = fs.readFileSync(filePath, 'utf8');
      this.pertanyaan = JSON.parse(pertanyaanRaw);
      console.log(chalk.green(`${this.pertanyaan.length} pertanyaan berhasil dimuat.`));
      return true;
    } catch (error) {
      console.log(chalk.red('Error saat memuat pertanyaan: ' + error.message));
      return false;
    }
  },

  /**
   * @contract
   * @requires this.pertanyaan sudah terisi
   * @requires jumlah adalah integer positif
   * @ensures hasil array berisi pertanyaan acak sejumlah parameter jumlah
   */
  ambilPertanyaanAcak: function(jumlah) {
    if (!Array.isArray(this.pertanyaan) || this.pertanyaan.length === 0) {
      throw new Error('Bank pertanyaan belum dimuat');
    }
    
    if (typeof jumlah !== 'number' || jumlah <= 0) {
      throw new Error('Jumlah pertanyaan harus berupa bilangan positif');
    }
    
    if (jumlah > this.pertanyaan.length) {
      jumlah = this.pertanyaan.length;
      console.log(chalk.yellow(`Hanya tersedia ${jumlah} pertanyaan.`));
    }
    
    const hasil = [];
    const indeks = new Set();
    
    while (indeks.size < jumlah) {
      const randomIndex = Math.floor(Math.random() * this.pertanyaan.length);
      if (!indeks.has(randomIndex)) {
        indeks.add(randomIndex);
        hasil.push(this.pertanyaan[randomIndex]);
      }
    }
    
    return hasil;
  }
};

// Library untuk menghitung skor dan statistik
const StatistikManager = {
  jawabanBenar: 0,
  jawabanSalah: 0,
  waktuMulai: null,
  waktuSelesai: null,
  
  /**
   * @contract
   * @ensures this.jawabanBenar, this.jawabanSalah di-reset ke 0 dan waktuMulai diatur ke waktu saat ini
   */
  mulaiKuis: function() {
    this.jawabanBenar = 0;
    this.jawabanSalah = 0;
    this.waktuMulai = new Date();
  },
  
  /**
   * @contract
   * @requires isBenar adalah boolean
   * @ensures counter yang sesuai bertambah 1
   */
  catatJawaban: function(isBenar) {
    if (typeof isBenar !== 'boolean') {
      throw new Error('Parameter isBenar harus berupa boolean');
    }
    
    if (isBenar) {
      this.jawabanBenar++;
    } else {
      this.jawabanSalah++;
    }
  },
  
  /**
   * @contract
   * @requires waktuMulai sudah diatur
   * @ensures waktuSelesai diatur ke waktu saat ini
   */
  selesaiKuis: function() {
    if (!this.waktuMulai) {
      throw new Error('Kuis belum dimulai');
    }
    
    this.waktuSelesai = new Date();
  },
  
  /**
   * @contract
   * @requires waktuMulai dan waktuSelesai sudah diatur
   * @ensures mengembalikan durasi kuis dalam detik
   */
  hitungDurasi: function() {
    if (!this.waktuMulai || !this.waktuSelesai) {
      throw new Error('Waktu mulai atau waktu selesai belum diatur');
    }
    
    return (this.waktuSelesai - this.waktuMulai) / 1000;
  },
  
  /**
   * @contract
   * @requires jawabanBenar dan jawabanSalah sudah terisi
   * @ensures mengembalikan presentase jawaban benar (0-100)
   */
  hitungPersentaseBenar: function() {
    const total = this.jawabanBenar + this.jawabanSalah;
    if (total === 0) return 0;
    return (this.jawabanBenar / total) * 100;
  },
  
  /**
   * @contract
   * @requires semua statistik sudah dihitung
   * @ensures hasil statistik ditampilkan ke konsol
   */
  tampilkanHasil: function() {
    console.log(chalk.bold.green('\n===== HASIL KUIS ====='));
    console.log(chalk.blue(`Jawaban Benar: ${this.jawabanBenar}`));
    console.log(chalk.red(`Jawaban Salah: ${this.jawabanSalah}`));
    console.log(chalk.blue(`Total Pertanyaan: ${this.jawabanBenar + this.jawabanSalah}`));
    console.log(chalk.yellow(`Persentase Benar: ${this.hitungPersentaseBenar().toFixed(2)}%`));
    console.log(chalk.magenta(`Durasi: ${this.hitungDurasi().toFixed(2)} detik`));
    
    let pesan;
    const persentase = this.hitungPersentaseBenar();
    
    if (persentase >= 80) {
      pesan = 'Luar biasa! Pengetahuan ensiklopedia Anda sangat baik!';
    } else if (persentase >= 60) {
      pesan = 'Bagus! Anda memiliki pengetahuan yang cukup baik.';
    } else if (persentase >= 40) {
      pesan = 'Cukup baik. Masih ada ruang untuk peningkatan.';
    } else {
      pesan = 'Teruslah belajar untuk meningkatkan pengetahuan Anda.';
    }
    
    console.log(chalk.bold(pesan));
    console.log(chalk.bold.green('=======================\n'));
  }
};

// Fungsi utama untuk menjalankan kuis
async function mulaiKuis() {
  if (!loadConfiguration()) {
    console.log(chalk.red('Gagal memuat konfigurasi. Program berhenti.'));
    return;
  }
  
  if (!KuisManager.muatPertanyaan(config.bankPertanyaanFile)) {
    console.log(chalk.red('Gagal memuat bank pertanyaan. Program berhenti.'));
    return;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(chalk.bold.green('==================================='));
  console.log(chalk.bold.green('   KUIS ENSIKLOPEDIA PENGETAHUAN   '));
  console.log(chalk.bold.green('==================================='));
  console.log(chalk.yellow(`Jumlah pertanyaan: ${config.jumlahPertanyaan}`));
  console.log(chalk.yellow(`Waktu per pertanyaan: ${config.waktuPerPertanyaan} detik`));
  console.log(chalk.blue('Ketik jawaban Anda dan tekan Enter untuk menjawab.'));
  console.log(chalk.bold.green('===================================\n'));
  
  // Tanya user apakah siap untuk memulai
  const jawaban = await new Promise(resolve => {
    rl.question(chalk.bold.yellow('Apakah Anda siap untuk memulai kuis? (y/n): '), answer => {
      resolve(answer.toLowerCase());
    });
  });
  
  if (jawaban !== 'y' && jawaban !== 'ya') {
    console.log(chalk.red('Kuis dibatalkan.'));
    rl.close();
    return;
  }
  
  // Ambil pertanyaan acak sesuai konfigurasi
  let pertanyaanKuis;
  try {
    pertanyaanKuis = KuisManager.ambilPertanyaanAcak(config.jumlahPertanyaan);
  } catch (error) {
    console.log(chalk.red('Error: ' + error.message));
    rl.close();
    return;
  }
  
  // Mulai menghitung statistik
  StatistikManager.mulaiKuis();
  
  // Mulai mengajukan pertanyaan
  for (let i = 0; i < pertanyaanKuis.length; i++) {
    const pertanyaan = pertanyaanKuis[i];
    
    console.log(chalk.bold.green(`\nPertanyaan ${i + 1}/${pertanyaanKuis.length}:`));
    console.log(chalk.white(pertanyaan.pertanyaan));
    
    if (pertanyaan.pilihan && Array.isArray(pertanyaan.pilihan)) {
      pertanyaan.pilihan.forEach((pilihan, index) => {
        console.log(chalk.cyan(`${String.fromCharCode(65 + index)}. ${pilihan}`));
      });
    }
    
    const jawabanUser = await new Promise(resolve => {
      // Set timeout sesuai konfigurasi
      const timeout = setTimeout(() => {
        console.log(chalk.red('\nWaktu habis!'));
        resolve('');
      }, config.waktuPerPertanyaan * 1000);
      
      rl.question(chalk.yellow('Jawaban Anda: '), answer => {
        clearTimeout(timeout);
        resolve(answer.trim());
      });
    });
    
    // Periksa jawaban
    let isBenar = false;
    
    if (pertanyaan.pilihan) {
      // Untuk pertanyaan pilihan ganda
      if (jawabanUser.length === 1) {
        const indeksPilihan = jawabanUser.toUpperCase().charCodeAt(0) - 65;
        isBenar = indeksPilihan >= 0 && indeksPilihan < pertanyaan.pilihan.length && 
                 pertanyaan.pilihan[indeksPilihan].toLowerCase() === pertanyaan.jawaban.toLowerCase();
      } else {
        isBenar = jawabanUser.toLowerCase() === pertanyaan.jawaban.toLowerCase();
      }
    } else {
      // Untuk pertanyaan jawaban pendek
      isBenar = jawabanUser.toLowerCase() === pertanyaan.jawaban.toLowerCase();
    }
    
    // Catat hasil jawaban
    StatistikManager.catatJawaban(isBenar);
    
    // Tampilkan feedback
    if (isBenar) {
      console.log(chalk.green('Benar! 👍'));
    } else {
      console.log(chalk.red(`Salah. Jawaban yang benar adalah: ${pertanyaan.jawaban}`));
    }
    
    if (pertanyaan.penjelasan) {
      console.log(chalk.blue('Penjelasan: ' + pertanyaan.penjelasan));
    }
  }
  
  // Selesai kuis
  StatistikManager.selesaiKuis();
  StatistikManager.tampilkanHasil();
  
  rl.close();
}

// Jalankan program
mulaiKuis();

// Export untuk keperluan testing
module.exports = {
  KuisManager,
  StatistikManager,
  loadConfiguration
};