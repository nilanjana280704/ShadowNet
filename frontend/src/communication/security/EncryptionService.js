/**
 * EncryptionService — message encryption seam.
 *
 * DEV PLACEHOLDER: this is a reversible keyed transform for demonstrating the
 * encryption flag and delivery pipeline. It is NOT secure. Production must
 * replace this with real end-to-end crypto (e.g. libsodium / X25519 + XChaCha20)
 * behind this same interface — callers only use encrypt()/decrypt().
 */
const DEV_KEY = 'shadownet-dev-key';

export default class EncryptionService {
  constructor(key = DEV_KEY) {
    this.key = key;
    this.algorithm = 'xor-dev-placeholder';
  }

  _xor(input) {
    let out = '';
    for (let i = 0; i < input.length; i += 1) {
      // XOR is intentional for this placeholder cipher.
      // eslint-disable-next-line no-bitwise
      const code = input.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length);
      out += String.fromCharCode(code);
    }
    return out;
  }

  encrypt(plain) {
    const transformed = this._xor(String(plain));
    let hex = '';
    for (let i = 0; i < transformed.length; i += 1) {
      hex += transformed.charCodeAt(i).toString(16).padStart(4, '0');
    }
    return { cipher: hex, encrypted: true, algorithm: this.algorithm };
  }

  decrypt(hex) {
    let transformed = '';
    for (let i = 0; i < hex.length; i += 4) {
      transformed += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
    }
    return this._xor(transformed);
  }
}
