const fs = require('fs');
const { KuisManager, StatistikManager } = require('./ensiklopedia-kuis');

// Mock fs.readFileSync untuk testing
jest.mock('fs');

describe('KuisManager - Unit Testing', () => {
  // Test case untuk fungsi muatPertanyaan
  describe('muatPertanyaan', () => {
    test('harus memuat pertanyaan dengan benar dari file JSON yang valid', () => {
      // Arrange: Menyiapkan data mock
      const mockData = JSON.stringify([
        { pertanyaan: 'Pertanyaan 1?', jawaban: 'Jawaban 1' },
        { pertanyaan: 'Pertanyaan 2?', jawaban: 'Jawaban 2' }
      ]);
      fs.readFileSync.mockReturnValue(mockData);

      // Act: Menjalankan fungsi yang akan diuji
      const result = KuisManager.muatPertanyaan('pertanyaan.json');

      // Assert: Memeriksa hasil
      expect(result).toBe(true);
      expect(KuisManager.pertanyaan.length).toBe(2);
      expect(KuisManager.pertanyaan[0].pertanyaan).toBe('Pertanyaan 1?');
      expect(KuisManager.pertanyaan[1].jawaban).toBe('Jawaban 2');
    });

    test('harus mengembalikan false saat terjadi error', () => {
      // Arrange: Menyiapkan kondisi error
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File tidak ditemukan');
      });

      // Act: Menjalankan fungsi yang akan diuji
      const result = KuisManager.muatPertanyaan('file-tidak-ada.json');

      // Assert: Memeriksa hasil
      expect(result).toBe(false);
    });
  });

  // Test case untuk fungsi ambilPertanyaanAcak
  describe('ambilPertanyaanAcak', () => {
    beforeEach(() => {
      // Menyiapkan data awal untuk setiap test
      KuisManager.pertanyaan = [
        { pertanyaan: 'P1', jawaban: 'J1' },
        { pertanyaan: 'P2', jawaban: 'J2' },
        { pertanyaan: 'P3', jawaban: 'J3' },
        { pertanyaan: 'P4', jawaban: 'J4' },
        { pertanyaan: 'P5', jawaban: 'J5' }
      ];
    });

    test('harus mengembalikan jumlah pertanyaan yang diminta', () => {
      // Act: Mengambil 3 pertanyaan acak
      const hasil = KuisManager.ambilPertanyaanAcak(3);

      // Assert: Memeriksa jumlah hasil
      expect(hasil.length).toBe(3);
    });

    test('harus mengembalikan semua pertanyaan jika jumlah diminta melebihi yang tersedia', () => {
      // Act: Mengambil 10 pertanyaan (melebihi jumlah tersedia)
      const hasil = KuisManager.ambilPertanyaanAcak(10);

      // Assert: Memeriksa jumlah hasil
      expect(hasil.length).toBe(5); // Hanya ada 5 pertanyaan yang tersedia
    });

    test('harus throw error jika bank pertanyaan kosong', () => {
      // Arrange: Membuat bank pertanyaan kosong
      KuisManager.pertanyaan = [];

      // Act & Assert: Memeriksa apakah fungsi melempar error
      expect(() => {
        KuisManager.ambilPertanyaanAcak(3);
      }).toThrow('Bank pertanyaan belum dimuat');
    });

    test('harus throw error jika jumlah pertanyaan negatif atau nol', () => {
      // Act & Assert: Memeriksa apakah fungsi melempar error untuk nilai negatif
      expect(() => {
        KuisManager.ambilPertanyaanAcak(-1);
      }).toThrow('Jumlah pertanyaan harus berupa bilangan positif');

      // Act & Assert: Memeriksa apakah fungsi melempar error untuk nilai nol
      expect(() => {
        KuisManager.ambilPertanyaanAcak(0);
      }).toThrow('Jumlah pertanyaan harus berupa bilangan positif');
    });
  });
});

describe('StatistikManager - Unit Testing', () => {
  // Persiapan sebelum setiap test
  beforeEach(() => {
    // Reset nilai statistik
    StatistikManager.jawabanBenar = 0;
    StatistikManager.jawabanSalah = 0;
    StatistikManager.waktuMulai = null;
    StatistikManager.waktuSelesai = null;
  });

  // Test case untuk fungsi mulaiKuis
  describe('mulaiKuis', () => {
    test('harus mengatur nilai awal dengan benar', () => {
      // Arrange: Menyiapkan kondisi awal
      StatistikManager.jawabanBenar = 5;
      StatistikManager.jawabanSalah = 3;
      
      // Act: Menjalankan fungsi yang akan diuji
      StatistikManager.mulaiKuis();
      
      // Assert: Memeriksa hasil
      expect(StatistikManager.jawabanBenar).toBe(0);
      expect(StatistikManager.jawabanSalah).toBe(0);
      expect(StatistikManager.waktuMulai).toBeInstanceOf(Date);
    });
  });

  // Test case untuk fungsi catatJawaban
  describe('catatJawaban', () => {
    test('harus menambah jawabanBenar saat jawaban benar', () => {
      // Act: Mencatat jawaban benar
      StatistikManager.catatJawaban(true);
      
      // Assert: Memeriksa hasil
      expect(StatistikManager.jawabanBenar).toBe(1);
      expect(StatistikManager.jawabanSalah).toBe(0);
    });
    
    test('harus menambah jawabanSalah saat jawaban salah', () => {
      // Act: Mencatat jawaban salah
      StatistikManager.catatJawaban(false);
      
      // Assert: Memeriksa hasil
      expect(StatistikManager.jawabanBenar).toBe(0);
      expect(StatistikManager.jawabanSalah).toBe(1);
    });
    
    test('harus throw error jika parameter bukan boolean', () => {
      // Act & Assert: Memeriksa apakah fungsi melempar error
      expect(() => {
        StatistikManager.catatJawaban('bukan boolean');
      }).toThrow('Parameter isBenar harus berupa boolean');
    });
  });

  // Test case untuk fungsi hitungPersentaseBenar
  describe('hitungPersentaseBenar', () => {
    test('harus menghitung persentase dengan benar', () => {
      // Arrange: Menyiapkan data
      StatistikManager.jawabanBenar = 8;
      StatistikManager.jawabanSalah = 2;
      
      // Act: Menghitung persentase
      const persentase = StatistikManager.hitungPersentaseBenar();
      
      // Assert: Memeriksa hasil (8 dari 10 = 80%)
      expect(persentase).toBe(80);
    });
    
    test('harus mengembalikan 0 jika belum ada jawaban', () => {
      // Act: Menghitung persentase tanpa jawaban
      const persentase = StatistikManager.hitungPersentaseBenar();
      
      // Assert: Memeriksa hasil
      expect(persentase).toBe(0);
    });
  });

  // Test case untuk fungsi hitungDurasi
  describe('hitungDurasi', () => {
    test('harus menghitung durasi dengan benar', () => {
      // Arrange: Menyiapkan waktu mulai dan selesai dengan selisih 60 detik
      StatistikManager.waktuMulai = new Date(2023, 0, 1, 12, 0, 0);
      StatistikManager.waktuSelesai = new Date(2023, 0, 1, 12, 1, 0);
      
      // Act: Menghitung durasi
      const durasi = StatistikManager.hitungDurasi();
      
      // Assert: Memeriksa hasil (selisih 60 detik)
      expect(durasi).toBe(60);
    });
    
    test('harus throw error jika waktu mulai belum diatur', () => {
      // Arrange: Hanya atur waktu selesai
      StatistikManager.waktuSelesai = new Date();
      
      // Act & Assert: Memeriksa apakah fungsi melempar error
      expect(() => {
        StatistikManager.hitungDurasi();
      }).toThrow('Waktu mulai atau waktu selesai belum diatur');
    });
    
    test('harus throw error jika waktu selesai belum diatur', () => {
      // Arrange: Hanya atur waktu mulai
      StatistikManager.waktuMulai = new Date();
      
      // Act & Assert: Memeriksa apakah fungsi melempar error
      expect(() => {
        StatistikManager.hitungDurasi();
      }).toThrow('Waktu mulai atau waktu selesai belum diatur');
    });
  });
});