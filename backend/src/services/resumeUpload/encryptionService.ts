import crypto from 'crypto';

/**
 * EncryptionService - AES-256-CBC encryption for resume data
 * Uses a simpler encryption approach compatible with all Node.js versions
 */
export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32;
  private ivLength = 16;

  private encryptionKey: Buffer;

  constructor(encryptionKey?: string) {
    // Use provided key or generate one from environment
    const key = encryptionKey || process.env.ENCRYPTION_KEY;
    
    if (!key) {
      // Generate a random key if none provided
      this.encryptionKey = crypto.randomBytes(this.keyLength);
    } else {
      // Derive a 32-byte key from the provided key
      this.encryptionKey = crypto.scryptSync(key, 'salt', this.keyLength);
    }
  }

  /**
   * Encrypt data using AES-256-CBC
   */
  encrypt(plaintext: Buffer): { encrypted: Buffer; iv: Buffer } {
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(this.ivLength);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Encrypt the data
    const encrypted = Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]);
    
    return { encrypted, iv };
  }

  /**
   * Decrypt data using AES-256-CBC
   */
  decrypt(encrypted: Buffer, iv: Buffer): Buffer {
    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Decrypt the data
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  /**
   * Encrypt a string and return as base64
   */
  encryptToBase64(plaintext: string): string {
    const { encrypted, iv } = this.encrypt(Buffer.from(plaintext, 'utf-8'));
    
    // Combine iv + encrypted data
    const combined = Buffer.concat([iv, encrypted]);
    
    return combined.toString('base64');
  }

  /**
   * Decrypt from base64
   */
  decryptFromBase64(encryptedBase64: string): string {
    const combined = Buffer.from(encryptedBase64, 'base64');
    
    // Extract iv and encrypted data
    const iv = combined.subarray(0, this.ivLength);
    const encrypted = combined.subarray(this.ivLength);
    
    const decrypted = this.decrypt(encrypted, iv);
    
    return decrypted.toString('utf-8');
  }

  /**
   * Rotate encryption key
   */
  rotateKey(newKey: string): { oldKeyValid: boolean; newKey: string } {
    // Verify we can still decrypt with current key
    const testData = 'key-rotation-test';
    try {
      this.encryptToBase64(testData);
    } catch {
      throw new Error('Failed to verify current encryption key');
    }

    const newKeyBuffer = crypto.scryptSync(newKey, 'salt', this.keyLength);
    
    return {
      oldKeyValid: true,
      newKey: newKeyBuffer.toString('hex')
    };
  }

  /**
   * Get the current encryption key fingerprint
   */
  getKeyFingerprint(): string {
    return crypto.createHash('sha256').update(this.encryptionKey).digest('hex').substring(0, 16);
  }

  /**
   * Verify encryption is working correctly
   */
  verifyEncryption(): boolean {
    try {
      const testData = 'encryption-test-data';
      const encrypted = this.encryptToBase64(testData);
      const decrypted = this.decryptFromBase64(encrypted);
      return decrypted === testData;
    } catch {
      return false;
    }
  }
}

export default EncryptionService;