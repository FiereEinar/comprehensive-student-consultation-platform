import { clsx, type ClassValue } from 'clsx';
import { format, parse } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatTime = (time: string) => {
	const parsed = parse(time, 'HH:mm', new Date());
	return format(parsed, 'hh:mm a');
};

// -----------------------------
// Encryption / Decryption Utils
// -----------------------------
const algorithm = 'AES-CBC';
const keyHex = import.meta.env.VITE_DATA_ENCRYPTION_KEY; // must be 64 hex chars = 32 bytes
const keyBuffer = new Uint8Array(
	keyHex.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16))
);

const subtleCrypto = crypto.subtle;

// Convert string ↔ ArrayBuffer
// const str2ab = (str: string) => new TextEncoder().encode(str);
// const ab2hex = (buf: ArrayBuffer) =>
// 	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const hex2ab = (hex: string) =>
	new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))).buffer;

// -----------------------------
// Check if string is encrypted
// -----------------------------
export const isEncrypted = (value: any) => {
	if (typeof value !== 'string') return false;
	const parts = value.split(':');
	if (parts.length !== 2) return false;
	const [ivHex, dataHex] = parts;
	return /^[0-9a-fA-F]{32}$/.test(ivHex) && /^[0-9a-fA-F]+$/.test(dataHex);
};

// -----------------------------
// Decrypt string
// -----------------------------
export const decrypt = (encrypted: string) => {
	if (!isEncrypted(encrypted)) return encrypted;

	const [ivHex, dataHex] = encrypted.split(':');
	const iv = hex2ab(ivHex);
	const data = hex2ab(dataHex);

	return subtleCrypto
		.importKey('raw', keyBuffer, algorithm, false, ['decrypt'])
		.then((cryptoKey) =>
			subtleCrypto.decrypt({ name: algorithm, iv }, cryptoKey, data)
		)
		.then((decryptedBuffer) => new TextDecoder().decode(decryptedBuffer))
		.catch(() => encrypted); // fallback: return encrypted text if decryption fails
};

// -----------------------------
// Recursively decrypt objects/arrays
// -----------------------------
export const decryptResponseData = async (obj: any): Promise<any> => {
	if (obj === null || obj === undefined) return obj;

	if (typeof obj === 'string')
		return isEncrypted(obj) ? await decrypt(obj) : obj;

	if (Array.isArray(obj)) {
		return Promise.all(obj.map(decryptResponseData));
	}

	if (typeof obj === 'object') {
		const decryptedObj: any = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				decryptedObj[key] = await decryptResponseData(obj[key]);
			}
		}
		return decryptedObj;
	}

	return obj;
};
