const fs = require('fs');
const { KuisManager, StatistikManager } = require('./ensiklopedia-kuis');

/**
 * Fungsi untuk mengukur waktu eksekusi dari suatu fungsi
 * @param {Function} fn - Fungsi yang akan diukur
 * @param {...any} args - Argumen untuk fungsi tersebut
 * @returns {Object} - Objek yang berisi hasil dan waktu eksekusi dalam ms
 */
function ukurWaktuEksekusi(fn, ...args) {
  const mulai = process.hrtime.bigint();
  const hasil = fn(...args);
  const selesai = process.hrtime.bigint();
  const durasi = Number(selesai - mulai) / 1_000_000; // Konversi dari ns ke ms

  return {
    hasil,
    waktuEksekusi: durasi
  };
}

/**
 * Fungsi untuk membuat data test dummy dengan ukuran tertentu
 * @param {number} jumlah - Jumlah data yang akan dibuat
 * @returns {Array} - Array berisi objek pertanyaan dummy
 */
function buatDataDummy(jumlah) {
  const pertanyaan = [];
  for (let i = 0; i < jumlah; i++) {
    pertanyaan.push({
      pertanyaan: `Pertanyaan dummy ${i + 1}?`,
      pilihan: [`Pilihan A ${i}`, `Pilihan B ${i}`, `Pilihan C ${i}`, `Pilihan D ${i}`],
      jawaban: `Pilihan A ${i}`,
      penjelasan: `Ini adalah penjelasan untuk pertanyaan dummy ${i + 1}.`,
      kategori: i % 2 === 0 ? 'sains' : 'sejarah',
      level: i % 3 === 0 ? 'mudah' : (i % 3 === 1 ? 'sedang' : 'sulit')
    });
  }
  return pertanyaan;
}

/**
 * Fungsi untuk menjalankan performance test pada fungsi ambilPertanyaanAcak
 * @param {number[]} ukuranData - Array berisi ukuran data yang akan diuji
 * @param {number} jumlahPertanyaan - Jumlah pertanyaan yang akan diambil
 * @param {number} iterasi - Jumlah iterasi untuk setiap ukuran data
 */
function testPerformaAmbilPertanyaanAcak(ukuranData, jumlahPertanyaan, iterasi) {
  console.log('----------------------------------------------------------');
  console.log('PERFORMANCE TEST: KuisManager.ambilPertanyaanAcak()');
  console.log('----------------------------------------------------------');
  console.log(`Mengambil ${jumlahPertanyaan} pertanyaan acak dengan ${iterasi} iterasi\n`);
  console.log('| Ukuran Data | Rata-rata (ms) | Min (ms) | Max (ms) |');
  console.log('|-------------|----------------|----------|----------|');

  for (const ukuran of ukuranData) {
    // Buat data dummy dengan ukuran tertentu
    const dataDummy = buatDataDummy(ukuran);
    KuisManager.pertanyaan = dataDummy;

    let totalWaktu = 0;
    let waktuMin = Number.MAX_VALUE;
    let waktuMax = 0;

    // Jalankan fungsi sebanyak jumlah iterasi
    for (let i = 0; i < iterasi; i++) {
      const { waktuEksekusi } = ukurWaktuEksekusi(
        KuisManager.ambilPertanyaanAcak.bind(KuisManager),
        jumlahPertanyaan
      );

      totalWaktu += waktuEksekusi;
      waktuMin = Math.min(waktuMin, waktuEksekusi);
      waktuMax = Math.max(waktuMax, waktuEksekusi);
    }

    // Hitung rata-rata waktu eksekusi
    const rataRata = totalWaktu / iterasi;

    // Cetak hasil
    console.log(`| ${ukuran.toString().padEnd(11)} | ${rataRata.toFixed(4).padEnd(14)} | ${waktuMin.toFixed(4).padEnd(8)} | ${waktuMax.toFixed(4).padEnd(8)} |`);
  }

  console.log('----------------------------------------------------------\n');
}

/**
 * Fungsi untuk menjalankan performance test pada StatistikManager
 * @param {number} iterasi - Jumlah iterasi untuk setiap fungsi
 */
function testPerformaStatistikManager(iterasi) {
  console.log('----------------------------------------------------------');
  console.log('PERFORMANCE TEST: StatistikManager');
  console.log('----------------------------------------------------------');
  console.log(`Mengukur performa fungsi-fungsi StatistikManager dengan ${iterasi} iterasi\n`);
  console.log('| Fungsi               | Rata-rata (ms) | Min (ms) | Max (ms) |');
  console.log('|----------------------|----------------|----------|----------|');

  // Test untuk fungsi mulaiKuis
  let totalWaktu = 0;
  let waktuMin = Number.MAX_VALUE;
  let waktuMax = 0;

  for (let i = 0; i < iterasi; i++) {
    const { waktuEksekusi } = ukurWaktuEksekusi(
      StatistikManager.mulaiKuis.bind(StatistikManager)
    );

    totalWaktu += waktuEksekusi;
    waktuMin = Math.min(waktuMin, waktuEksekusi);
    waktuMax = Math.max(waktuMax, waktuEksekusi);
  }

  let rataRata = totalWaktu / iterasi;
  console.log(`| mulaiKuis            | ${rataRata.toFixed(4).padEnd(14)} | ${waktuMin.toFixed(4).padEnd(8)} | ${waktuMax.toFixed(4).padEnd(8)} |`);

  // Test untuk fungsi catatJawaban
  totalWaktu = 0;
  waktuMin = Number.MAX_VALUE;
  waktuMax = 0;

  for (let i = 0; i < iterasi; i++) {
    const { waktuEksekusi } = ukurWaktuEksekusi(
      StatistikManager.catatJawaban.bind(StatistikManager),
      i % 2 === 0 // Alternasi antara true dan false
    );

    totalWaktu += waktuEksekusi;
    waktuMin = Math.min(waktuMin, waktuEksekusi);
    waktuMax = Math.max(waktuMax, waktuEksekusi);
  }

  rataRata = totalWaktu / iterasi;
  console.log(`| catatJawaban         | ${rataRata.toFixed(4).padEnd(14)} | ${waktuMin.toFixed(4).padEnd(8)} | ${waktuMax.toFixed(4).padEnd(8)} |`);

  // Test untuk fungsi hitungPersentaseBenar
  // Atur nilai awal
  StatistikManager.jawabanBenar = iterasi / 2;
  StatistikManager.jawabanSalah = iterasi / 2;

  totalWaktu = 0;
  waktuMin = Number.MAX_VALUE;
  waktuMax = 0;

  for (let i = 0; i < iterasi; i++) {
    const { waktuEksekusi } = ukurWaktuEksekusi(
      StatistikManager.hitungPersentaseBenar.bind(StatistikManager)
    );

    totalWaktu += waktuEksekusi;
    waktuMin = Math.min(waktuMin, waktuEksekusi);
    waktuMax = Math.max(waktuMax, waktuEksekusi);
  }

  rataRata = totalWaktu / iterasi;
  console.log(`| hitungPersentaseBenar| ${rataRata.toFixed(4).padEnd(14)} | ${waktuMin.toFixed(4).padEnd(8)} | ${waktuMax.toFixed(4).padEnd(8)} |`);

  console.log('----------------------------------------------------------\n');
}

/**
 * Fungsi utama untuk menjalankan semua performance test
 */
function jalankanPerformanceTest() {
  console.log('\n===========================================================');
  console.log('         PERFORMANCE TESTING PROGRAM KUIS ENSIKLOPEDIA       ');
  console.log('===========================================================\n');

  // Definisikan parameter test
  const ukuranData = [100, 500, 1000, 5000, 10000];
  const jumlahPertanyaan = 10;
  const iterasi = 100;

  // Jalankan test untuk KuisManager.ambilPertanyaanAcak
  testPerformaAmbilPertanyaanAcak(ukuranData, jumlahPertanyaan, iterasi);

  // Jalankan test untuk StatistikManager
  testPerformaStatistikManager(iterasi);

  console.log('===========================================================');
  console.log('                PERFORMANCE TEST SELESAI                   ');
  console.log('===========================================================\n');
}

// Eksekusi performance test
jalankanPerformanceTest();
