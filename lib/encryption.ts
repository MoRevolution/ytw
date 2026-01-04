import crypto from 'crypto';

if (!process.env.ENCRYPTION_KEY) {
  console.error('[Encryption] ENCRYPTION_KEY environment variable is missing!');
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Validate encryption key format
if (!/^[a-f0-9]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
  console.error('[Encryption] ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
  console.error('[Encryption] Current length:', process.env.ENCRYPTION_KEY.length);
  throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters');
}

// Use the encryption key from environment variable
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

console.log('[Encryption] Module initialized, key length:', ENCRYPTION_KEY.length, 'bytes');

export async function encryptToken(token: string): Promise<string> {
  console.log('[Encryption] Starting, token length:', token?.length);
  
  try {
    if (!token) {
      throw new Error('Cannot encrypt empty token');
    }
    
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
    
    const base64Result = result.toString('base64');
    console.log('[Encryption] SUCCESS, result length:', base64Result.length);
    return base64Result;
  } catch (error) {
    console.error('[Encryption] FAILED:', error instanceof Error ? error.message : error);
    throw new Error(`Failed to encrypt token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  console.log('[Decryption] Starting...');
  console.log('[Decryption] Input length:', encryptedToken?.length);
  console.log('[Decryption] ENCRYPTION_KEY length:', ENCRYPTION_KEY?.length, 'bytes');
  
  try {
    // Convert from base64
    const buffer = Buffer.from(encryptedToken, 'base64');
    console.log('[Decryption] Buffer length after base64 decode:', buffer.length);
    
    // Validate buffer length
    if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      throw new Error(`Invalid encrypted token: buffer too short (${buffer.length} bytes, need at least ${IV_LENGTH + AUTH_TAG_LENGTH + 1})`);
    }
    
    // Extract IV, encrypted data, and auth tag
    const iv = buffer.slice(0, IV_LENGTH);
    const encrypted = buffer.slice(IV_LENGTH, -AUTH_TAG_LENGTH);
    const authTag = buffer.slice(-AUTH_TAG_LENGTH);
    console.log('[Decryption] IV length:', iv.length, ', encrypted length:', encrypted.length, ', authTag length:', authTag.length);
    
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
    
    const result = decrypted.toString('utf8');
    console.log('[Decryption] SUCCESS, decrypted token length:', result.length);
    return result;
  } catch (error) {
    console.error('[Decryption] FAILED');
    console.error('[Decryption] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Decryption] Error message:', error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to decrypt token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 