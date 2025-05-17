import crypto from 'crypto';

if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Use the encryption key from environment variable
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export async function encryptToken(token: string): Promise<string> {
  try {
    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      iv
    );
    
    // Encrypt the token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    const result = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag
    ]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Failed to encrypt token');
  }
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    // Convert from base64
    const buffer = Buffer.from(encryptedToken, 'base64');
    
    // Extract IV, encrypted data, and auth tag
    const iv = buffer.slice(0, IV_LENGTH);
    const encrypted = buffer.slice(IV_LENGTH, -AUTH_TAG_LENGTH);
    const authTag = buffer.slice(-AUTH_TAG_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      iv
    );
    
    // Set the auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Error decrypting token:', error);
    throw new Error('Failed to decrypt token');
  }
} 