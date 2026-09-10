import CryptoJS from 'crypto-js';

/**
 * Encrypts arbitrary text or JSON payload using AES-256 derived from the user's Vault Code.
 * @param {string|object} data - Plaintext or object to encrypt
 * @param {string} vaultCode - The user's secret Vault Code (e.g. SP-623440)
 * @returns {string} Base64 encrypted ciphertext
 */
export const encryptPayload = (data, vaultCode) => {
  try {
    if (!data || !vaultCode) return '';
    const textToEncrypt = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(textToEncrypt, vaultCode).toString();
  } catch (err) {
    console.error('Encryption failed:', err);
    return '';
  }
};

/**
 * Decrypts AES-256 ciphertext using the user's Vault Code.
 * @param {string} ciphertext - Base64 encrypted payload from Supabase
 * @param {string} vaultCode - The user's secret Vault Code
 * @returns {string|object} Decrypted string or parsed JSON object
 */
export const decryptPayload = (ciphertext, vaultCode) => {
  try {
    if (!ciphertext || !vaultCode) return null;
    const bytes = CryptoJS.AES.decrypt(ciphertext, vaultCode);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) return null;

    try {
      return JSON.parse(decryptedStr);
    } catch (e) {
      return decryptedStr;
    }
  } catch (err) {
    console.error('Decryption failed:', err);
    return null;
  }
};
