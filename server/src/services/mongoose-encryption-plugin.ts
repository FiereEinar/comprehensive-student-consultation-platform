import mongoose from 'mongoose';
import { decrypt, encrypt, isEncrypted } from './encryption';

export interface EncryptionPluginOptions {
	fields: string[]; // fields to encrypt/decrypt
}

export const EncryptPlugin = (
	schema: mongoose.Schema<any, mongoose.Model<any>, mongoose.Document>,
	options: EncryptionPluginOptions
) => {
	const { fields } = options;

	/** ----------------------------------------------------
	 *  HELPER: Encrypt fields in a plain object (update ops)
	 * ---------------------------------------------------- */
	const encryptFields = (obj: any) => {
		if (!obj) return obj;

		for (const field of fields) {
			if (obj[field] && typeof obj[field] === 'string') {
				if (!isEncrypted(obj[field])) {
					obj[field] = encrypt(obj[field]);
				}
			}
		}

		return obj;
	};

	/** ----------------------------------------------------
	 *  HELPER: Decrypt fields inside a Mongoose document
	 * ---------------------------------------------------- */
	const decryptDocument = (doc: any) => {
		if (!doc) return;

		for (const field of fields) {
			const value = doc[field];

			if (typeof value === 'string' && isEncrypted(value)) {
				doc[field] = decrypt(value);
			}
		}
	};

	/** ----------------------------------------------------
	 *  PRE-SAVE — Encrypt modified fields
	 * ---------------------------------------------------- */
	schema.pre('save', function (next: any) {
		for (const field of fields) {
			if (this.isModified(field) && typeof this[field] === 'string') {
				if (!isEncrypted(this[field])) {
					this[field] = encrypt(this[field]);
				}
			}
		}
		next();
	});

	/** ----------------------------------------------------
	 *  PRE-UPDATE (findOneAndUpdate) — Encrypt update values
	 * ---------------------------------------------------- */
	schema.pre('findOneAndUpdate', function (next: any) {
		const update: any = this.getUpdate();

		if (!update) return next();

		// update.$set or root-level update
		if (update.$set) encryptFields(update.$set);
		else encryptFields(update);

		next();
	});

	/** ----------------------------------------------------
	 *  POST-FIND — Decrypt docs automatically
	 * ---------------------------------------------------- */
	schema.post('find', function (docs: any) {
		const arr = Array.isArray(docs) ? docs : [docs];

		for (const doc of arr) decryptDocument(doc);
	});

	schema.post('findOne', function (doc: any) {
		if (doc) decryptDocument(doc);
	});

	/** ----------------------------------------------------
	 *  toJSON — Decrypt before sending to frontend
	 * ---------------------------------------------------- */
	schema.set('toJSON', {
		transform: (_, ret) => {
			for (const field of fields) {
				if (ret[field] && isEncrypted(ret[field])) {
					ret[field] = decrypt(String(ret[field]));
				}
			}
			return ret;
		},
	});
};
