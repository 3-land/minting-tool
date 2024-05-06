import { PublicKey } from "@solana/web3.js";


export const sleep = (t) => {
	return new Promise((res) => {
		setTimeout(res, t);
	})
}

export const nowS = () => (Date.now() / 1000);

export const validateSolAddress = (address) => {
	try {
		let pubkey = new PublicKey(address);
		return PublicKey.isOnCurve(pubkey.toBuffer());
	} catch (error) {
		return false;
	}
}