import crypto from 'crypto';
import { DATA_ENCRYPTION_KEY } from '../constants/env';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(DATA_ENCRYPTION_KEY, 'hex');

export const encrypt = (plain: string) => {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(algorithm, key, iv);

	const encrypted = cipher.update(plain, 'utf8', 'hex') + cipher.final('hex');

	// combine into one string
	return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encrypted: string) => {
	if (!isEncrypted(encrypted)) {
		return encrypted;
	}

	const [ivHex, dataHex] = encrypted.split(':');

	const iv = Buffer.from(String(ivHex), 'hex');

	const decipher = crypto.createDecipheriv(algorithm, key, iv);

	return (
		decipher.update(String(dataHex), 'hex', 'utf8') + decipher.final('utf8')
	);
};

/**
 * used to decrypt fields from aggregate queries
 * @param obj
 * @param fields
 * @returns
 */
export const decryptFields = (obj: any, fields: string[]) => {
	for (const f of fields) {
		if (obj[f]) {
			try {
				obj[f] = decrypt(obj[f]);
			} catch (e) {
				console.error('Decrypt failed for field:', f);
			}
		}
	}
	return obj;
};

export const isEncrypted = (value: any) => {
	if (typeof value !== 'string') return false;

	const parts = value.split(':');
	if (parts.length !== 2) return false;

	const [ivHex, dataHex] = parts;

	// IV must be 32 hex chars
	const ivValid = /^[0-9a-fA-F]{32}$/.test(String(ivHex));

	// Data must be hex
	const dataValid = /^[0-9a-fA-F]+$/.test(String(dataHex));

	return ivValid && dataValid;
};

/**
 * Recursively encrypt all string values in an object/array
 * @param obj - The object, array, or primitive
 */
const fieldsToSkip = ['_id', 'id', 'createdAt', 'updatedAt'];
export const encryptResponseData = (obj: any): any => {
	if (obj === null || obj === undefined) return obj;

	if (obj._doc) obj = obj._doc;

	// primitive string
	if (typeof obj === 'string') {
		return isEncrypted(obj) ? obj : encrypt(obj);
	}

	// array → recursively encrypt each element
	if (Array.isArray(obj)) {
		return obj.map(encryptResponseData);
	}

	if (obj instanceof Date) {
		return obj; // <-- keep Date objects as-is
	}

	// object → recursively encrypt each key
	if (typeof obj === 'object') {
		const encryptedObj: any = {};
		for (const key in obj) {
			if (
				Object.prototype.hasOwnProperty.call(obj, key) &&
				!fieldsToSkip.includes(key)
			) {
				encryptedObj[key] = encryptResponseData(obj[key]);
			} else {
				encryptedObj[key] = obj[key];
			}
		}
		return encryptedObj;
	}

	// other primitive types (number, boolean, etc.) → leave as is
	return obj;
};

// -----------------------------
// Recursively decrypt objects/arrays
// -----------------------------
export const decryptRequestData = async (obj: any): Promise<any> => {
	if (obj === null || obj === undefined) return obj;

	if (typeof obj === 'string') return isEncrypted(obj) ? decrypt(obj) : obj;

	if (Array.isArray(obj)) {
		return Promise.all(obj.map(decryptRequestData));
	}

	if (typeof obj === 'object') {
		const decryptedObj: any = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				decryptedObj[key] = await decryptRequestData(obj[key]);
			}
		}
		return decryptedObj;
	}

	return obj;
};
