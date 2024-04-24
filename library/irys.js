import { WebIrys } from '@irys/sdk';
import { sleep, nowS } from "./utils";
import { toPublicKey } from "./misc";



import crypto from "crypto";




import { SystemProgram, Keypair } from "@solana/web3.js";

import nacl from 'tweetnacl';

nacl.encodeUTF8 = function (arr) {
	var i, s = [];
	for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
	return decodeURIComponent(escape(s.join('')));
};

nacl.decodeUTF8 = function (s) {
	if (typeof s !== 'string') throw new TypeError('expected string');
	var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
	for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
	return b;
};

function blobToBase64(blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}

const irys_network = true ? "https://devnet.irys.xyz" : "https://node2.irys.xyz";

/*function generateRandomBytes(length) {
  var values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return values;
}*/

export class IrysHelper {
	async verifyBalance(id) {
		try {
			const submited = await this.irys.funder.submitTransaction(id);
			return submited;
		} catch (e) {
			console.log("CANNOT VERIFY FUND", e);
		}
		return false;
	}
	async getBalance() {
		return this.irys.getLoadedBalance();
	}


	async bundle(file, is_metadata = false) {

		try {
			const { type, name } = file;
			const nonce = file.nonce || crypto.randomBytes(32).toString("base64").slice(0, 32)
			const tags = [{ name: "Content-Type", value: type }];
			const irys_wallet = this.irys.address;
			const data = await file.arrayBuffer();

			let transaction = this.irys.createTransaction(data, { anchor: nonce, tags })
			const { size } = transaction;
			const price = await this.irys.getPrice(transaction.size);
			const slippage_fee = Math.round(price.div(6).toNumber());
			await transaction.sign();
			const extension = this.getFileExtension(file);
			const id = transaction?.id;
			if (!id) throw "No id";
			const url = "https://arweave.net/" + id + ((extension && !file.is_metadata && !is_metadata) ? ("?ext=" + extension) : "");
			file.payload = false;
			file.irys = { id, size, url, extension, nonce, transaction, irys_wallet, price: price.toNumber(), slippage_fee }
			return file;
		} catch (e) {
			console.log("ERRORE", e);
			return false;
		}

	}

	getFileExtension(file) {
		const parts = (file?.name || "").split(".");
		const extension = parts.length > 1 ? parts.pop() : (file.type.split("/")[1] || null);
		return extension
	}

	async getFundingInstructions({ files, payer }) {
console.log("FILES",files);
		if (!payer) payer = this.owner;

		let bytes = 0;
		let price = false;
		for (const file of files) {
			const files_price = await this.irys.getPrice(file.irys.size);
			if (!price) {
				price = files_price;
			} else {
				price = price.plus(files_price);
			}
			bytes += file.irys.size;
			file.irys.price = price.toNumber();
		}

		const irys_address = await this.irys.utils.getBundlerAddress("solana");
		const slippage_fee = Math.round(price.div(6).toNumber());
		price = price.plus(slippage_fee);

		const from_user_to_manager = SystemProgram.transfer({
			fromPubkey: toPublicKey(payer),
			toPubkey: this.wallet.publicKey,
			lamports: price,
		})

		const from_manager_to_irys = SystemProgram.transfer({
			fromPubkey: this.wallet.publicKey,
			toPubkey: toPublicKey(irys_address),
			lamports: price,
		})

		return { instructions: [from_user_to_manager, from_manager_to_irys], bytes, price: price.toNumber() }

	}

	async getWallet() {
		//To-do: Save in local storage the Irys Wallet that gets created on every session, so the slippage can be reused in future arweave uploads
		/*const sc = await storage.getLocal(["irys_wallet"]);
		let wallet = false;
		if(sc?.irys_wallet){
			wallet = Keypair.fromSecretKey( new Uint8Array(sc.irys_wallet) );
		} else {*/

		const wallet = Keypair.generate();
		/*await storage.setLocal({"irys_wallet":[...wallet.secretKey]});
	}*/
		return wallet
	}

	arweaveToID(x) {
		return "irys-preupload-" + x
	}

	async uploadFiles({ uuid, signature, files/*Remove when local storage gets included*/ }) {

		await this.irys.ready();

		//Checks local storage for existance of file

		//const table = await storage.table("irys_uploads", true);
		//const files = await table.get("uuid",uuid);
		//if(!files?.[0]) return false;

		const saved_signature = files?.[0]?.transaction ? (JSON.parse(files?.[0]?.transaction)?.[0] || null) : null
		const values = { tried_at: nowS() };
		if (saved_signature) {
			await this.verifyBalance(saved_signature)
		} else if (signature) {
			values.transaction = signature;
			if (!Array.isArray(signature)) signature = [signature];
			await this.verifyBalance(signature[0])
		}

		for (const file of files) {
			if (file.status != "uploaded") {
				const data = { ...file.data, ...values }
				file.data = data;
				//Saves file in local storage so we can reupload later in case of failure
				//await table.set({data,id:file.id},"id",true); 
			}
		}

		const errors = [];
		const succeeds = [];

		for (const _file of files) {

			if (_file.status == "uploaded") {
				succeeds.push(_file.arweave);
				continue;
			}

			const blob = this.files_bridge[this.arweaveToID(_file.irys.id)];

			//const blob = (await file.readFile(this.arweaveToID(_file.arweave)))?.file;
			blob.nonce = _file.irys.nonce;
			if (!blob) {
				errors.push(_file.irys.id);
				continue;
			}
			blob.nonce = _file.irys.nonce;
			const bundled = await this.bundle(blob);
			if (succeeds.includes(bundled.irys.id)) {
				succeeds.push(bundled.irys.id);
				continue;
			}
			if (!bundled || bundled.irys.id != _file.irys.id) {
				errors.push(_file.id);
				
				continue;
			}
			try {
				const subida = await bundled.irys.transaction.upload();
				if (subida) {
					succeeds.push(bundled.irys.id);
					const data = { ..._file.data, fee_at_submit: bundled.price, uploaded_at: nowS() };
					//Marks in local storage as uploaded, so you don't retry uploading
					//await table.set({status:"uploaded",data,id:_file.id},"id",true);
				} else {
					throw "";
				}
			} catch (e) {
				const error = e + "";
				console.log("Error",e);
				if (error.includes("already received")) {
					succeeds.push(bundled.irys.id);
					//const data = { ..._file.data, fee_at_submit: bundled.price, uploaded_at: nowS() };
					//Marks in local storage as uploaded, so you don't retry uploading
					//await table.set({status:"uploaded",data,id:_file.id},"id",true);
				} else {
					errors.push(_file.id);
				}
			}
			await sleep(100);
		}

		const balance = await this.getBalance()
		console.log("UPLOADED: ", succeeds.length)
		console.log("FAILED: ", errors.length)
		console.log("POST BALANCE: ", balance.toNumber())

		return { errors, succeeds }

	}

	async clean() {

	}

	async registerFiles({ files, uuid }) {
		const owner = this.owner;

		/*
		//Local storage manager, deletes files of old sessions that never executed
		const table = await storage.table("irys_uploads", true);
		const pre = await table.get("uuid",uuid);
		for(const x of pre){
			await file.deleteFile(this.arweaveToID(x.arweave))
			await table.dexie.delete(x.id);
		}
		*/

		let same = {};
		this.files_bridge = {};
		for (const [index, _file] of files.entries()) {
			const arweave = _file.irys.id;
			const data = { type: _file.type, nonce: _file.irys.nonce, size: _file.irys.size, fee_at_submit: _file.irys.price, slippage_fee: _file.irys.slippage_fee }
			const tosave = { owner, arweave, uuid, status: "waiting", date: nowS(), data, payload: _file.payload };
			//await file.saveFile(_file, this.arweaveToID(arweave))

			this.files_bridge[this.arweaveToID(arweave)] = _file;

			//Saves file into storage
			//await table.dexie.put(tosave);
		}


		return files.length;

	}
	async sync(address) {
		if (this.owner != address) {
			return init();
		}
		return true;
	}
	async init(address) {


		const wallet = await this.getWallet();
		console.log("wallet", wallet.secretKey);
		if (!wallet) return false;
		this.wallet = wallet;

		const provider = {
			publicKey: wallet.publicKey, signMessage: async (message) => {
				const sign = nacl.sign.detached(message, this.wallet.secretKey);
				return sign
			}
		};

		console.log("provider", provider);
		this.owner = address;



		this.irys = new WebIrys({ url: irys_network, token: "solana", wallet: { rpcUrl:"https://devnet.helius-rpc.com/?api-key=6b236027-5ab9-41d9-b516-d6f0b5a5286e", provider } });
		await this.irys.ready();
		const to = await this.irys.utils.getBundlerAddress("solana");
		const bal = await this.getBalance();
		console.log("Irys address:", to);
		console.log("Irys balance:", bal.toNumber());

		//this.uploadFiles({ uuid: "e1d413a1-bc3c-4113-a225-616ffb05857f", signature: "j2EcvTvrbxyA7uqK5K1bVqpZmMgCmVNigWEoKENGQxBdnzFhddV4eyic52B451NxiNXGXzLbJEjCBp4w7bx5bQy" })

		return true;
	}
}

let global = false;
export const init = async (address) => {
	if (global) {
		const g = await global.sync();
		if (!g) global = null;
		return global;
	}
	global = new IrysHelper();
	const g = await global.init(address);
	if (!g) global = null;
	return global;
}