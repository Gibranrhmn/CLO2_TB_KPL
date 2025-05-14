/**
 * Contract class untuk implementasi Design by Contract
 * Class ini digunakan untuk memvalidasi parameter dan hasil dari fungsi
 */
class Contract {
    static require(condition, message) {
      if (!condition) {
        throw new Error(`Precondition failed: ${message}`);
      }
    }
  
    static ensure(condition, message) {
      if (!condition) {
        throw new Error(`Postcondition failed: ${message}`);
      }
    }
  
    static invariant(condition, message) {
      if (!condition) {
        throw new Error(`Invariant failed: ${message}`);
      }
    }
  
    static typeCheck(value, type, name) {
      const actualType = typeof value;
      Contract.require(
        actualType === type,
        `Parameter ${name} harus bertipe ${type}, tetapi didapatkan ${actualType}`
      );
    }
  }
  
  module.exports = Contract;
  