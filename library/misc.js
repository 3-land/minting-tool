import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';


export const toPublicKey = (key) => {
	if (typeof key !== "string") return key;
	const PubKeysInternedMap = new Map()
	let result = PubKeysInternedMap.get(key);
	if (!result) {
		result = new PublicKey(key);
		PubKeysInternedMap.set(key, result);
	}
	return result;
};
