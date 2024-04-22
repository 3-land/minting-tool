import { generalBase } from "./base";
import { app_info } from "./config";

const file_system = {
    files: ["file"],
    gen_renders: ["file"]
}
const directory = {};


export class StorageService extends generalBase {

    async cleanAll() {
        console.error("Trying to delete")
        try {
            await waitFor(() => this.loaded, 1500)
        } catch (e) { }

        /*for(const key in schemas){
          const l = await this.table(key)
          const c = await l.dexie.clear();
        }*/
        console.error("Deleting DB: 1")
        await indexedDB.deleteDatabase(this.dbname);
        console.error("Deleting DB: 2")
        await localStorage.clear();
        console.error("Deleting DB: 3")
        await readAndDeleteExpired({ store: "files" }, Date.now() + 1000 * 3600)
        console.error("Deleting DB: 4")
    }

    async load() {

        try {
            if (!this.root) this.root = await navigator.storage.getDirectory();
        } catch (e) {
            if ((e + "").includes("memory")) this.incognito = true;
        }

        const db = this.dbname;

        if (file_system) {
            const dir = db.split(":").join("_-_")

            for (const store in file_system) {
                const dirname = dir + "_--_" + store;
                try {
                    if (!directory[store]) directory[store] = await this.root.getDirectoryHandle(dirname);
                } catch (e) { }
                if (!directory[store]) directory[store] = await this.root.getDirectoryHandle(dirname, { create: true });
            }

        }

        schemas = { ...this.schemas };
        for (const key in schemas) {
            const index = schemas[key].split(",")[0].split("+").pop();
            schemas[key] = { columns: schemas[key], index }
        }


        const lt = await this.getLocal(["last_delete_check"]);
        const n = Math.floor(Date.now() / 1000);
        if (!lt?.last_delete_check || (n - lt.last_delete_check) > 3600 * 24 * 3) {
            await readAndDeleteExpired({ store: "files" })
            await this.setLocal({ last_delete_check: n });
        }

        this.loaded = true;

    }

    _postconstructor(data) {
        this.schemas = {};
        this.schema = {
            add: ({ name, columns }) => {
                this.schemas[name] = columns;
            }
        }

        this.account = {};
        this.device = {};
        this.cache = 0;
        this.version = 100;
        this.selectedDatabase = ((app_info.network == "devnet") ? "general" : "main") + "::" + this.cache;


        this.callbacks = {};


        this.dbname = ((app_info.network == "devnet") ? "storage" : "mainstorage") + "_" + this.cache;


        this.database = null;


        this.table = async (key, worker) => {

            if (this.incognito) worker = false;

            //          worker = false;
            const lista = this.schemas[key].split(",")
            const _mainkey = lista[0].split("+").pop();

            //worker = false;


            try {

                if (worker) {

                    if (!this.database) this.database = {};
                    if (!this.database[key]) this.database[key] = {};

                    if (!this.worker) {


                        this.worker = new Worker("/js/database.js");

                        this.worker.postMessage({ action: "open", payload: { file_system, db: this.dbname, schemas: this.schemas, version: this.version } });

                        let load = false;
                        let loaded = null;
                        this.worker.onmessage = async (evento) => {

                            if (evento?.data?.id) {

                                this.callbacks[evento?.data?.id]?.(evento.data.payload);
                                return
                            }
                            if (evento?.data?.action == "open") {
                                if (evento.data.error) {
                                    if (!load) {
                                        loaded = false;
                                        return;
                                    }
                                    load(false);
                                    return
                                }
                                if (!load) {
                                    loaded = true;
                                    return;
                                }
                                load(true);

                            }
                        }

                        const good = await new Promise((resolve) => {
                            if (loaded !== null) {
                                resolve(loaded);
                            } else {
                                load = resolve;
                            }
                        })

                        this.worker._opened = true;

                        if (!good) {
                            modal.new({ id: "error", props: { hideX: true, message: "corrupted_storage_2", title: "error" } });
                            return new Promise(() => { })
                        }

                    } else if (!this.worker._opened) {
                        await waitFor(() => this.worker._opened);
                    }


                } else if (!this.database?.initiated) {
                    const pre = { ...(this.database || {}) }

                    this.database = new Dexie(((app_info.network == "devnet") ? "storage" : "mainstorage") + "_" + this.cache);
                    for (const key in pre) this.database[key] = pre[key];

                    this.database.version(this.version).stores(this.schemas);
                    this.database.initiated = true;
                    await this.database.open();
                }


            } catch (e) {
                if ((e + "").includes("Not yet support for changing primary ke") || (e + "").includes("is less than the exist")) {
                    if (!location.href.includes("clear")) {
                        location.href = "/clear";
                        return
                    } else {
                        await this.cleanAll?.();
                    }
                }
                console.error("Local database error:", e);
                const lm = modal.new({ id: "error", props: { hideX: true, accept: "continue", message: "corrupted_storage", title: "New Update Available" } });

                lm.attach(this, "kill", async () => {
                    await this.cleanAll?.();
                    location.href = "/clear";
                })

                if (!location.href.includes("clear")) {
                    return new Promise(() => { })
                }
            }


            return {
                get: async (llave, valor, bucket) => {



                    if (!valor) {
                        valor = llave;
                        llave = _mainkey;
                    }

                    if (bucket) {
                        if (!this.database[key].bucket) this.database[key].bucket = {};
                        if (this.database[key].bucket[valor]) return this.database[key].bucket[valor];
                    }

                    if (worker) {
                        return new Promise((resolve) => {
                            const id = uuid4()
                            const payload = { store: key, key: llave, value: valor }
                            this.callbacks[id] = (x) => {

                                delete this.callbacks[id];
                                if (bucket) this.database[key].bucket[valor] = x;
                                resolve(x);
                            }
                            this.worker.postMessage({ action: "get", id, payload })
                        });
                    }

                    const lectura = await this.database[key].where(llave).equals(valor).toArray();


                    const files = file_system[key]
                    if (files) {
                        for (let i = 0; i < lectura.length; i++) {
                            for (let j = 0; j < files.length; j++) {
                                const _key = files[j]
                                const id = lectura[schemas[key].index]
                                const mime = lectura[i][_key];
                                lectura[i][_key] = await readFile({ store: key }, id, _key, mime);
                            }
                        }
                    }

                    if (bucket) this.database[key].bucket[valor] = lectura;

                    return lectura;


                }, set: async (...t) => {

                    const llave = _mainkey
                    const valor = t[0][llave]
                    if (this.database[key].bucket?.[valor]) delete this.database[key].bucket[valor];

                    return this.set(key, worker, ...t);
                }, dexie: (

                    worker ?

                        {
                            bulkDelete: async (ids) => {

                                return new Promise((resolve) => {
                                    const id = uuid4()
                                    is_updating_files[id] = true;
                                    const payload = { store: key, value: ids }
                                    this.callbacks[id] = (x) => {
                                        console.log("BULKDELETE", x);
                                        delete this.callbacks[id];
                                        resolve(x);
                                    }
                                    this.worker.postMessage({ action: "dexie.bulkdelete", id, payload })
                                });

                                //return this.database[key].bulkDelete(...t)
                            },
                            deleteExpiredFiles: async (fecha) => {

                                return readAndDeleteExpired({ store: key }, fecha);

                            }, delete: async (valor, ignoreFileDelete) => {

                                return new Promise((resolve) => {
                                    const id = uuid4()
                                    is_updating_files[id] = true;
                                    const payload = { store: key, ignoreFileDelete: !!ignoreFileDelete, value: valor }
                                    this.callbacks[id] = (x) => {
                                        delete this.callbacks[id];
                                        if (this.database?.[key]?.bucket?.[valor]) delete this.database[key].bucket[valor];
                                        delete is_updating_files[id];
                                        resolve(x);
                                    }
                                    this.worker.postMessage({ action: "dexie.delete", id, payload })
                                });

                            },
                            put: async (data) => {



                                return new Promise((resolve) => {
                                    const id = uuid4()
                                    const payload = { store: key, data }

                                    //
                                    is_updating_files[id] = true;
                                    this.callbacks[id] = (x) => {
                                        const llave = data[schemas[key].index];
                                        if (llave && this.database?.[key]?.bucket?.[llave]) delete this.database[key].bucket[llave];
                                        delete is_updating_files[id];
                                        resolve(x);
                                    }
                                    this.worker.postMessage({ action: "dexie.put", id, payload })
                                });

                            },
                            get: async (valor, bucket) => {
                                if (bucket && this.database?.[key]?.bucket?.[valor]) return this.database?.[key]?.bucket?.[valor];

                                return new Promise((resolve) => {
                                    const id = uuid4()
                                    is_updating_files[id] = true;
                                    const payload = { store: key, value: valor }
                                    this.callbacks[id] = (x) => {
                                        delete this.callbacks[id];
                                        if (bucket) this.database[key].bucket[valor] = x;
                                        delete is_updating_files[id];
                                        resolve(x);

                                    }
                                    this.worker.postMessage({ action: "dexie.get", id, payload })
                                });

                            }
                        }

                        :

                        {
                            bulkDelete: async (...t) => {
                                return this.database[key].bulkDelete(...t)
                            },
                            clear: () => {
                                return this.database?.[key].clear();
                            },
                            toArray: () => {
                                return this.database?.[key].toArray();
                            },
                            where: (...t) => this.database?.[key].where(...t),
                            get: async (valor, bucket) => {

                                if (bucket && this.database?.[key]?.bucket?.[valor]) return this.database?.[key]?.bucket?.[valor];
                                const lectura = await this.database?.[key].get(valor)

                                const files = file_system[key]
                                if (lectura && files) {
                                    for (let j = 0; j < files.length; j++) {
                                        const _key = files[j]
                                        if (lectura[_key]) {
                                            const mime = lectura[_key];
                                            const id = lectura[schemas[key].index]
                                            lectura[_key] = await readFile({ store: key }, id, _key, mime);
                                        }
                                    }
                                }

                                if (bucket) this.database[key].bucket[valor] = lectura;
                                return lectura;

                            },
                            deleteExpiredFiles: async (fecha) => {


                                return readAndDeleteExpired({ store: key }, fecha);

                            },
                            put: async (datax) => {

                                const id = uuid4()
                                is_updating_files[id] = true;
                                if (!Array.isArray(datax)) datax = [datax]
                                let data = false;
                                for (let i = 0; i < datax.length; i++) {
                                    data = datax[i]
                                    const guardar = { ...data };

                                    if (file_system?.[key]) {

                                        for (let j = 0; j < file_system[key].length; j++) {
                                            const _key = file_system[key][j]
                                            const id = guardar[schemas[key].index];
                                            const saving_file = guardar.hasOwnProperty(key);
                                            if (saving_file) {
                                                if (guardar[_key]) {
                                                    throw "Use worker method to write files";
                                                } else {
                                                    await deleteFile({ store: key }, id, _key);
                                                    guardar[_key] = false;
                                                }
                                            }

                                        }
                                    }

                                }
                                delete is_updating_files[id];
                                return this.database?.[key].bulkPut(datax);
                            },
                            delete: async (value, ignoreFileDelete) => {

                                const id = uuid4()
                                is_updating_files[id] = true;

                                const payload = await this.database[key].delete(value);
                                if (!ignoreFileDelete) {
                                    if (file_system?.[key]) {
                                        for (let j = 0; j < file_system[key].length; j++) {
                                            const _key = file_system[key][j]
                                            await deleteFile({ store: key }, value, _key);
                                        }
                                    }
                                }

                                delete is_updating_files[id];

                                return payload;

                            }
                        }

                )
            };
        }

        this.set = async (store, worker, values, key, update_only, bucket) => {

            if (worker) {

                return new Promise((resolve) => {
                    const id = uuid4()


                    is_updating_files[id] = true;

                    const payload = { store, values, key, update_only }
                    this.callbacks[id] = (x) => {
                        delete this.callbacks[id];


                        delete is_updating_files[id];
                        if (bucket) this.database[store].bucket[valor] = x;
                        resolve(x);
                    }
                    this.worker.postMessage({ action: "set", id, payload })
                });

            }

            const id = uuid4()
            is_updating_files[id] = true;

            let existe = null;
            if (key.includes("+")) {
                const keys = key.split("+").map(x => values[x]);
                existe = await this.database[store].where("[" + key + "]").equals(keys).toArray();
            } else {

                existe = await this.database[store].where(key).equals(values[key]).toArray();

            }

            let good = false;
            try {

                if (existe.length > 0) {

                    if (existe[0].id) {

                        const sr = this.schemas[store].split(",");
                        if (sr && sr[0].indexOf("id") > -1) {
                            good = await this.database[store].update(existe[0].id, { ...existe[0], ...values })
                            return good;
                        }

                    }

                    if (key.includes("+")) {
                        const keys = key.split("+").map(x => existe[0][x]);

                        good = await this.database[store].update(keys, { ...existe[0], ...values })
                    } else {
                        good = await this.database[store].update(existe[0][key], { ...existe[0], ...values })
                    }



                } else if (!update_only) {
                    good = await this.database[store].add(values)
                }
            } catch (e) {


                if ((e + "").indexOf("already exists") > -1) {

                    return this.set(store, values, key, update_only);
                }

                good = false;
            }

            delete is_updating_files[id];

            return good;
        }


    }
    async setLocal(data, database) {

        for (const key in data) {
            const fkey = (database ? (database + "::" + this.cache) : this.selectedDatabase) + "_" + key;

            localStorage.setItem(fkey, JSON.stringify(data[key]));
            this.emit("saved-" + key, data[key]);
        }

    }

    setDatabase(key) {
        this.selectedDatabase = key + "::" + this.cache;
    }
    getDatabase() {
        return this.selectedDatabase.split("::")[0];
    }

    async removeLocal(key, database) {

        const fkey = (database ? (database + "::" + this.cache) : this.selectedDatabase) + "_" + key;
        localStorage.removeItem(fkey);
        this.emit("saved-" + key, null);
    }

    /*async setLocal(data,database){
        for(const key in data){
            const fkey =(database ? (database+"::"+this.cache) : this.selectedDatabase)+"_"+key;
            localStorage.setItem(fkey,JSON.stringify(data[key]));
            this.emit("saved-"+key,data[key]);
        }
        
    }*/

    async getLocal(keys, database) {

        let resp = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const fkey = (database ? (database + "::" + this.cache) : this.selectedDatabase) + "_" + key;

            resp[key] = localStorage.getItem(fkey);

            if (resp[key]) {
                resp[key] = JSON.parse(resp[key]);
            } else {
                delete resp[key];
            }
        }
        return resp;
    }
}

export const storage = new StorageService();

//SCHEMAS



storage.schema.add({ name: "files", columns: "id,user,file,text,date,version" });
storage.schema.add({ name: "friend_list", columns: "id,owner,request,status,name,fecha,last_update,last_seen,world" });
storage.schema.add({ name: "nft", columns: "++id,hash,chain,date_master,master,metadata,date,type,date_das,das" });
storage.schema.add({ name: "das_asset", columns: "hash,data,raw,date,raw_date" });
storage.schema.add({ name: "nft_config", columns: "hash,data,date" });
storage.schema.add({ name: "owned_tokens", columns: "++id,owner,tokens,date" });
storage.schema.add({ name: "token_owners", columns: "++id,owner,hash,date" });
storage.schema.add({ name: "bank_vaults", columns: "++id,bank,vaults,date" });
storage.schema.add({ name: "vaults_nfts", columns: "++id,vault,nfts,date" });
storage.schema.add({ name: "tx_history", columns: "++id,hash,date,data,slot" });
storage.schema.add({ name: "owned_vaults", columns: "++id,bank,vault,owner,date, [bank+owner]" });
storage.schema.add({ name: "cache_requests", columns: "[user+url],url,type,data,user,date" });
storage.schema.add({ name: "user_info", columns: "hash,data,date" });
storage.schema.add({ name: "useraddress", columns: "hash,username,identifier,display,id,date" });
storage.schema.add({ name: "userconfig", columns: "hash,config,date,socials" });
storage.schema.add({ name: "useravatar", columns: "hash,avatar,date" });
storage.schema.add({ name: "nft_listings", columns: "hash,data,date,updated" });

storage.schema.add({ name: "collections", columns: "hash,data,date,updated" });

storage.schema.add({ name: "stream_channels", columns: "id,chat,options" });

storage.schema.add({ name: "webdata", columns: "hash,url,data,date" });

storage.schema.add({ name: "local_keyz", columns: "id,hash,account,address,app,realm,origin,provider,date,box" });

storage.schema.add({ name: "temp_keyz", columns: "id,date,data" });


storage.schema.add({ name: "zipfiles", columns: "file_id,zipid,file,name,date" });

storage.schema.add({ name: "gen_renders", columns: "id,file,date,data" });

storage.schema.add({ name: "mint_drafts", columns: "++id,uid,type,files,date,owner,data,[type+owner]" });


storage.schema.add({ name: "irys_uploads", columns: "++id,[arweave+owner],arweave,owner,uuid,status,transaction,date,data,payload" });

storage.schema.add({ name: "fast_signings", columns: "[owner+nonce],owner,hash,nonce,type,date,data" });

storage.schema.add({ name: "my_listings", columns: "++id,hash,type,data,date,tags" });

storage.schema.add({ name: "rpc_calls", columns: "[hash+method],hash,method,address,force_next,date,data" });
storage.schema.add({ name: "model_colors", columns: "hash,main" });
storage.schema.add({ name: "roomdata", columns: "hash,data,id,date,cache" });
storage.schema.add({ name: "created_nfts", columns: "[owner+offset],owner,offset,data,date" });
storage.schema.add({ name: "myreactions", columns: "[owner+hash+type],owner,hash,qty,type,data,date" });

storage.schema.add({ name: "virtual_packs", columns: "++id,redeemed,data,date" });

//storage.schema.add({name:"reactionqty", columns:"[hash+type],hash,type,data,date"});
storage.load();
window.galatic05.storage = storage;

export default {};