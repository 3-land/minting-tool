import { generalBase, queueManager, sleep } from './base';


export class FileService extends generalBase {

    flushBucket({ type }) {
        let limite = 5000;

        let arreglo = false;
        if (type && this.bucket_files[type]) {
            arreglo = this.bucket_files[type]
        } else if (this.bucket) {
            arreglo = this.bucket;
            limite = 10000;
        }

        if (arreglo) {

            const llaves = Object.keys(arreglo);
            llaves.splice(0, Math.max(llaves.length - limite), 0).forEach(x => {
                if (arreglo[x].url?.includes?.("blob:")) URL.revokeObjectURL(arreglo[x].url);
                delete arreglo[x];
            })
        }
    }

    bucketify({ file, id, type }) {

        id = "buck_" + id;
        if (!type) type = "general";

        if (!this.bucket_files[type]) this.bucket_files[type] = {};
        if (!this.bucket_files[type][id]) {

            this.flushBucket({ type });

            this.bucket_files[type][id] = { type: file.type, blob: file, url: URL.createObjectURL(file), date: Date.now() }
        }
        return this.bucket_files[type][id];

    }
    bucket_files = {};
    async textify({ file, json, id, type }) {
        id = "texto_" + id + (json ? "_j" : "");
        type = type || "general";
        if (!this.bucket_files[type]) this.bucket_files[type] = {};

        if (!this.bucket_files[type][id]) {
            let data = await file.text();
            if (json) data = JSON.parse(data);
            this.flushBucket({ type });
            this.bucket_files[type][id] = { type: file.type, date: Date.now(), data }
        }
        return this.bucket_files[type][id];

    }

    async iconify(url) {





        const ts = "tinyicon-" + this.generateKey(url);
        if (tinyicons[ts]) return tinyicons[ts];

        return parallel.work(ts, async () => {

            return new Promise((resolve) => {

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');

                    const w = 128;
                    const p = 16;

                    const width = img.naturalWidth;
                    const height = img.naturalHeight;
                    canvas.width = w;
                    canvas.height = w;

                    const context = canvas.getContext('2d');
                    context.fillStyle = "#999999"

                    context.roundRect(0, 0, w, w, [w * 0.25]);
                    context.fill();
                    context.drawImage(img, -p, -p, w + p * 2, w + p * 2);
                    const blb = canvas.toDataURL();
                    tinyicons[ts] = blb;
                    resolve(blb);
                }

                img.src = url;

            });

        });


    }

    async fixCropTransparency(url) {

        return new Promise((resolve) => {

            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');

                const width = img.naturalWidth;
                const height = img.naturalHeight;
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                const data = context.getImageData(Math.floor(width / 2), Math.floor(height / 2), 1, 1);

                if (data.data[3] == 0) {
                    data.data[3] = 1;
                }

                context.putImageData(data, Math.floor(width / 2), Math.floor(height / 2));

                const blb = canvas.toDataURL();

                resolve(blb);
            }

            img.src = url;

        })
    }

    async compressImage(...c) {
        return compressImage(...c);
    }

    ipfsURL = "api.ipfs.help"
    needToPlay = [];
    async loadImage(url, blobed, stringURL, type) {
        let urled = false;


        let avoidCompress = false;
        if (window.galatic05.app.networkCompress(type) && stringURL.includes("api/bucket/compress")) {
            avoidCompress = true;
        } else if (type.includes("gif") && (url.type?.includes?.("gif") || stringURL.includes("=gif"))) {
            avoidCompress = true;
        }

        //url = "https://anjgkysbvioqozwzqc43rj73l6idnurknrr7mzqsnes5iwywsbaa.arweave.net/A1JlYkGqHQdm2YC5uKf7X5A20ipsY_ZmEmkl1FsWkEA";
        let blob = false;
        if (url instanceof Blob) {
            blob = url;
            if (!avoidCompress && window.galatic05.app.hasWebWork() && url.size > maxS && !url.compressed) {
                urled = true;
                url = await this.generateCompressedImage(url, stringURL, false, false, type);
            } else if (blobed) {
                urled = true;
                url = blobed;
            } else {
                urled = true;
                url = URL.createObjectURL(url);
            }
        } else {

            blob = await this.cacheFile(url, { fast: true, bucket: "full", compress: !avoidCompress, compressed: !avoidCompress });
            if (blob?.url) url = blob.url;
            blob = blob.blob;
        }

        return new Promise((resolve) => {
            let img = new Image();
            img.blob = blob;
            img.onload = function () {
                resolve(this);
                // if(urled) URL.revokeObjectURL(urled);
            }
            img.onerror = function (ee) {
                resolve(false);
            }
            img.src = url;
        })
    }

    //frameImageData = tempCtx.createImageData(dims.width, dims.height)

    async gifToImage(frame) {

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');

            canvas.width = frame.dims.width;
            canvas.height = frame.dims.height;



            let ctx = canvas.getContext('2d');
            const frameImageData = ctx.createImageData(canvas.width, canvas.height)



            frameImageData.data.set(frame.patch)
            ctx.putImageData(frameImageData, 0, 0)


            canvas.toBlob(async (blob) => {

                resolve(blob);
            });

        });


    }

    screenshots = {};
    async getScreenshotFromVideo({ video, url, height, id, fast, slow, width, no_pause }) {
        console.log("URLS", { video, url, height, id, fast, slow, width, no_pause });
        if (url) {
            console.log("URLs", url);
            video = await new Promise((resolve) => {

                const c = document.createElement('video');

                c.style.position = "fixed";
                c.style.visibility = "hidden";
                c.muted = true;
                c.autoplay = true;
                c.playsInline = true;
                c.muted = true;
                c.setAttribute("muted", true);
                c.volume = 0;
                c.onloadedmetadata = () => {
                    width = c.videoWidth;
                    height = c.videoHeight;
                    resolve(c);
                }

                c.src = url;
                document.body.appendChild(c);

            })

            console.log("video", video);


        }
        if (!width) {
            width = video.videoWidth;
            height = video.videoHeight;
        }
        return new Promise(async (resolve) => {

            //console.log("PIDE SCREENSHOT");
            if (id) {
                id = "screenshot_" + file.generateKey(id);
                if (this.screenshots[id]) {
                    resolve({ ...this.screenshots[id] });
                    return;
                }
            }
            const existe = !id ? false : (await file.readFile(id));
            if (!existe) {

                const canvas = document.createElement('canvas');

                if (!window.galatic05.app.noclick) await waitFor(() => window.galatic05.app.noclick);

                const per = slow ? Math.max(1, 512 / width) : 1;

                canvas.width = width * per;
                canvas.height = height * per;
                if (!no_pause || video.paused) video.play();

                if (slow) video.currentTime = 0.1;
                if (!fast) await sleep(500 * (slow ? 2 : 1));

                let ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (!fast) await sleep(100 * (slow ? 2 : 1));
                console.log("CANVAS", canvas.width)
                canvas.toBlob(async (blob) => {
                    if (!no_pause) {
                        video.pause();
                    }

                    if (id) {
                        await file.saveFile(blob, id);
                        this.screenshots[id] = { blob, url: URL.createObjectURL(blob) }

                        resolve({ ...this.screenshots[id] });
                        return
                    }
                    resolve(blob);
                });

            } else {

                this.screenshots[id] = { blob: existe.file, url: URL.createObjectURL(existe.file) }
                resolve({ ...this.screenshots[id] });

            }

        });


    }

    thumbnailManager = new queueManager();

    async clearVirtuals() {
        virtuals = {};
    }

    async generateCompressedImage(blob, url, maxSize, filed, type) {

        let csize = type?.size ?? 512;

        const key = comprl + "_" + csize + "_" + this.generateKey(url);
        const bucket = !filed;

        const f = await this.readFile(key);

        if (f) {
            if (bucket && virtuals[key]) {
                return virtuals[key];
            } else if (bucket) {
                virtuals[key] = URL.createObjectURL(f.file);
                return virtuals[key];
            }
            return filed ? f.file : URL.createObjectURL(f.file);
        }



        const respuesta = await this.thumbnailManager.work(key, async () => {

            const comprr = await this.compressImage({ file: blob, filename: "image.png", maxWidthOrHeight: type?.size ?? 512, useWebWorker: window.galatic05.app.hasWebWork(), maxSizeMB: maxSize || maxS })

            await this.saveFile(comprr, key);

            if (filed) {
                return comprr;
            }

            const urla = URL.createObjectURL(comprr);
            if (bucket) {
                virtuals[key] = urla;
            }

            return urla;

        })

        return respuesta;
    }

    async generateURLThumbnail(url, bucket, virtual_id) {
        const key = "image_" + this.generateKey(url);
        const f = await this.readFile(key);

        if (f) {
            if (bucket && virtuals[key]) {
                return virtuals[key];
            } else if (bucket) {
                virtuals[key] = URL.createObjectURL(f.file);
                return virtuals[key];
            }
            return f.file;
        }

        const respuesta = await this.thumbnailManager.work(url, async () => {
            return new Promise((resolve) => {
                let mod = window.galatic05.modal.ui({ id: "rendering", class: "renderer_hide", component: "ViewRender", props: { hideX: true, type: "image", uri: url } });
                let killed = false;
                mod.attach(this, "render_fail", "render_fail", (z) => {
                    mod.kill();
                });
                mod.attach(this, "render", "render", async (z) => {
                    killed = true;
                    mod.kill();
                    if (z) {
                        await this.saveFile(z, key);

                        if (bucket) {
                            virtuals[key] = URL.createObjectURL(z);
                            resolve(virtuals[key]);
                            return;
                        }

                        resolve(z);
                    } else {
                        resolve(false);
                    }
                })
                mod.attach(this, "kill", () => {
                    if (!killed) {
                        resolve(false);
                    }
                })
            })
        })

        return respuesta;
    }

    async loadVideo(url, poster, autoplay, muted) {
        let urled = false;
        if (url instanceof Blob) {
            urled = true;
            url = URL.createObjectURL(url);
        } else {

            const blob = await this.cacheFile(url, { fast: true, bucket: true });
            if (blob !== false) url = blob;//URL.createObjectURL(blob);

        }
        return new Promise(async (resolve) => {

            let img = document.createElement('video');
            if (poster) img.setAttribute('poster', poster);
            img.setAttribute('playsinline', 'playsinline');
            img.setAttribute('loop', 'loop');
            img.setAttribute('type', 'video/mp4');

            img.setAttribute('webkit-playsinline', 'webkit-playsinline');

            img.loop = true;
            img.volume = 0;
            if (window.galatic05.app.ios) {
                img.muted = true;
                img.volume = 1;
            }
            if (muted) img.muted = true;
            //   img.muted = true;
            let that = this;
            img.addEventListener("loadedmetadata", function () {
                const height = this.videoHeight;
                const width = this.videoWidth;

                if (autoplay !== false) {
                    img.play().catch(() => {
                        that.needToPlay.push(img);
                    });

                    if (!window.galatic05.app.noclick) {
                        that.needToPlay.push(img);
                    }
                }


                resolve({ naturalHeight: height, naturalWidth: width, source: img });
            });
            img.onerror = function (ee) {

                resolve(false);
            }
            img.src = url;
        })
    }

    async blobFromBitmap(bmp) {


        let canvas = document.createElement('canvas');
        // resize it to the size of our ImageBitmap
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        // get a bitmaprenderer context
        const ctx = canvas.getContext('bitmaprenderer');
        ctx.transferFromImageBitmap(bmp);
        // get it back as a Blob
        const blob2 = await new Promise((res) => canvas.toBlob(res));

        return blob2;

        canvas = null;

    }

    async crop(path, opts) {
        const crop = await loadCrop();

        const tra = await this.fixCropTransparency(path);

        return crop(tra, opts);
    }

    async getFileType(url, type) {


        if (file_types[url]) {
            return { type: file_types[url] };
        }
        let blob = false;
        if (url?.includes?.("blob:")) {
            blob = await fetch(url).then(r => r.blob());
        } else {
            let file = await this.cacheFile(url, type);

            blob = file;
        }

        file_types[url] = blob.type;
        return { blob: blob };

    }

    generateKey(url) {
        let arr = url.split(":");
        if (arr.length > 1) {
            arr.shift();
        }
        arr = arr.join("-");
        const reg = /&|\?|\s|#|\.|\/|:/g
        return arr.replace(reg, "-");
    }

    change(url) {
        const ipfs = this.isIPFSUrl(url);
        if (ipfs) url = ipfs_copy[ipfs] || "https://" + this.ipfsURL + "/hash/" + ipfs;
        return url;
    }

    isIPFSUrl(url) {
        if (!url.includes("ipfs.io/") || url.includes("pinata.cloud")) {
            return false;
        }
        url = url.split("&")[0];
        url = url.split("/");
        const iof = url.indexOf("ipfs");
        if (iof > -1) return url[iof + 1];
        return false;
    }

    cleanBuckets(opts) {
        let { how, time, type } = opts || {};
        if (!time) time = 1000 * 60 * 15;
        if (this.bucket || (type && this.bucket_files[type])) {
            const now = Date.now();
            let dif = 0;

            if (type && this.bucket_files[type]) {
                for (const key in this.bucket_files[type]) {
                    if (how == "time") {
                        dif = now - this.bucket_files[type][key].date;
                        if (dif > time) {
                            URL.revokeObjectURL(this.bucket_files[type][key].url);
                            delete this.bucket_files[type][key];
                        }
                    } else if (!how) {
                        URL.revokeObjectURL(this.bucket_files[type][key].url);
                        delete this.bucket_files[type][key];
                    }
                }
                if (!Object.keys(this.bucket_files[type]).length) delete this.bucket_files[type];
            }
            if (type == "files" || !this.bucket) return;
            for (const key in this.bucket) {
                if (how == "time") {
                    dif = now - this.bucket[key].date;
                    if (dif > time) {
                        URL.revokeObjectURL(this.bucket[key].url);
                        delete this.bucket[key];
                    }
                } else if (!how) {
                    URL.revokeObjectURL(this.bucket[key].url);
                    delete this.bucket[key];
                }
            }
        }
    }

    cacheFile(url, key, type) {

        const url_og = url;
        const key_og = key;
        const type_og = type;


        if (key && typeof key != "string") {
            type = key;
            key = false;
        }
        if (!url) return false;
        if (url?.includes?.("blob:")) return false;

        //    let tester = false;
        //      if(url.includes("QmbHYNxWMGRFtsDPjnTswT1iEvriae8NQFk4Kushs7Zu56")) tester = true;
        //if(tester)          console.log("LA URL",url,type);
        //if(typetype.compress || type.compressed) console.log("COMPRESSED",type.compress,type.compressed);
        if (window.galatic05.app.networkCompress(type && (type.compress || type.compressed)) && type && (type.compress || type.compressed)) {


            if ((type.compress == "room" || (!url.includes("=gif") && type.compress == "gifroom")) && !url.includes("blob:") && !url.includes("api/bucket/compress")) {
                // console.log("LA URL COMPRIME",url);
                url = "https://api.3land.blog/api/bucket/compress/image/" + encodeURIComponent(url);
            } else {
                //console.log("LA URL",url);
            }


            if (url.includes("api/bucket/compress")) {
                delete type.compress;
                delete type.compressed;
            }
        }

        if (type && type.fast) {
            const ipfs = this.isIPFSUrl(url);
            if (ipfs) url = ipfs_copy[ipfs] || "https://" + this.ipfsURL + "/hash/" + ipfs;
        }
        const useBucket = type && type.bucket;
        if (!key && typeof url == "string") {
            key = this.generateKey(url);
        }
        let bucketKey = false;
        if (useBucket) {
            const tip = { ...type };
            delete tip.fast;
            bucketKey = key + cyrb53(JSON.stringify(tip));
        } else {
            bucketKey = key + cyrb53(JSON.stringify(type));
        }
        if (useBucket && this.bucket && this.bucket[bucketKey]) {

            const bm = useBucket == "bitmap";
            const txt = !bm && useBucket == "json";

            if (useBucket == "full" || bm || txt) {

                if (bm && this.bucket[bucketKey] && !this.bucket[bucketKey].bitmap) {
                    return new Promise(async (res) => {
                        this.bucket[bucketKey].bitmap = await createImageBitmap(this.bucket[bucketKey].blob);
                        res(this.bucket[bucketKey]);
                    });
                } else if (txt && this.bucket[bucketKey] && !this.bucket[bucketKey].json) {
                    return new Promise(async (res) => {
                        try {
                            const t = await this.bucket[bucketKey].blob.text()
                            this.bucket[bucketKey].json = JSON.parse(t);
                        } catch (e) {
                            this.bucket[bucketKey].json = {};
                        }
                        if (txt) {
                            res(this.bucket[bucketKey].json);
                            return
                        }
                        res(this.bucket[bucketKey]);
                    });
                } if (txt) {
                    return this.bucket[bucketKey].json;
                }

                return this.bucket[bucketKey];
            } else {
                return this.bucket[bucketKey].url
            }

        }

        return parallel.work("getting_" + bucketKey, async () => {

            return new Promise(async (resolver, reject) => {

                const resolve = async (b) => {
                    if (b && b.size && useBucket) {
                        if (!this.bucket) this.bucket = {};

                        const bm = useBucket == "bitmap";
                        const txt = !bm && useBucket == "json";

                        if (!this.bucket[bucketKey]) this.flushBucket({});

                        this.bucket[bucketKey] = { ...this.bucket[bucketKey], url: !txt ? URL.createObjectURL(b) : false, blob: b, type: type.bucket, date: Date.now() };

                        if (window.galatic05.app.noVideoBlob && (b.type.includes("video") || url.includes("mp4"))) {
                            this.bucket[bucketKey].url = url;
                        }

                        if (txt) {



                            if (this.bucket[bucketKey].json) {
                                resolver(this.bucket[bucketKey].json);
                                return
                            }

                            if (!b?.text) {
                                resolver(false);
                                return
                            }

                            try {

                                if (!b?.text?.length) b.text = await b?.text?.();

                                this.bucket[bucketKey].json = JSON.parse(b?.text);
                                resolver(this.bucket[bucketKey].json);
                            } catch (e) {

                                resolver(false);
                            }

                            return;
                        }


                        if (bm && !this.bucket[bucketKey].bitmap) this.bucket[bucketKey].bitmap = await createImageBitmap(this.bucket[bucketKey].blob);
                        if (txt && !this.bucket[bucketKey].json) {
                            try {
                                const t = await this.bucket[bucketKey].blob.text()
                                this.bucket[bucketKey].json = JSON.parse(t);
                            } catch (e) {
                                this.bucket[bucketKey].json = {};
                            }
                        }
                        if (useBucket == "full" || bm || txt) {
                            resolver(this.bucket[bucketKey]);
                        } else {
                            resolver(this.bucket[bucketKey].url);
                        }
                        return;
                    }
                    if (type?.json) {
                        if (!this.bucket) this.bucket = {};
                        if (this.bucket[bucketKey]?.json) {
                            resolver(this.bucket[bucketKey]?.json);
                            return
                        }



                        try {
                            if (b?.text && !b?.text?.length) b.text = await b.text();
                            this.bucket[bucketKey] = { json: JSON.parse(b?.text), text: b?.text };
                            resolver(this.bucket[bucketKey].json);
                        } catch (e) {
                            resolver(false);
                        }
                        return

                    }
                    resolver(b);
                }






                let invalidate = false;
                if (type && type.time) {
                    invalidate = type.time * 1000;
                }



                if (!key) {
                    reject("Error: No se pudo generar un ID");
                    return
                }

                let csize = type?.size ?? 512;
                const now = Date.now();

                if (type && type.compressed) {


                    const compkey = comprl + "_" + csize + "_" + key;
                    const f = await this.readFile(compkey, false, type)

                    if (f && f.file) {
                        if (!f.file.type.includes("gif") || (f.file.type.includes("gif") && type.compressed != "gif")) {
                            f.file.compressed = true;
                            resolve(f.file);
                            return;
                        } else {
                            delete type.compress;
                            delete type.compressed;
                        }
                    }

                }


                let invalidated = false;
                const f = await this.readFile(key, file_versions[url], type);

                if (type?.json && f.text) {

                    resolve(f);
                    return;
                }

                if (f && f.file && !type?.json) {



                    const retur = await fixFailData.bind(this)(f.file);



                    const enviar = async (xx) => {
                        if (type && (type.compress != "gif" || !(xx.type.includes("gif")))) {

                            if (type && type.compress && window.galatic05.app.hasWebWork() && xx.size > maxS) {

                                const fl = await this.generateCompressedImage(xx, url, false, true, type)
                                if (fl) {
                                    fl.compressed = true;

                                    xx = fl;
                                }

                            }

                        }

                        resolve(xx)
                    }

                    if (!retur) {
                        await this.deleteFile(key)

                        const try2 = await this.cacheFile(url_og, key_og, type_og);
                        await enviar(try2)
                        return;
                    }



                    const date = f.date;
                    invalidated = invalidate && (now - date > invalidate);



                    if (invalidated) {
                        if (type && type.bypass !== false) {
                            await enviar(f.file);
                        }

                    } else {


                        await enviar(f.file);
                        return;
                    }

                }


                let blob = false;
                if (typeof url == "string") {

                    try {
                        /*if(invalidated){
                          console.log("VOLVER A BAJAR",url)
                        }*/
                        blob = await this.download(url, false, type);

                        if (blob && blob?.type?.includes("image") && type && (type.compress != "gif" || !(blob.type.includes("gif")))) {

                            if (type.compress && window.galatic05.app.hasWebWork() && blob.size > maxS) {
                                const fl = await this.generateCompressedImage(blob, url, false, true, type)
                                if (fl) {
                                    fl.compressed = true;
                                    blob = fl;
                                }
                            }

                        }

                    } catch (e) {

                        resolve(false);
                        return;
                    }
                } else {
                    blob = url.blob;

                }

                if (blob) {
                    if (blob.compressed) key = comprl + "_" + csize + "_" + key;

                    await this.saveFile(blob, key, file_versions[url], type);
                }



                resolve(blob);

            });
        })
    }

    callbacks = {};

    async download(url, retry, type) {
        return new Promise((resolve, reject) => {

            try {

                let headers = false;
                if (retry) {
                    headers = {
                        'Cache-Control': 'no-cache'
                    };
                }

                request.blob(this, { url, stack: true, headers, args: {} }).then((blob) => {

                    if (!blob || (type && type.checktype && !type.checktype(blob))) {

                        reject(false);
                        return;
                    }

                    if (!blob || blob.size < 32) {

                        if (type && type.allow_small) {
                            resolve(false);
                            return;
                        }

                        if (blob.size < 8 && !retry) {

                            setTimeout(() => {
                                this.download(url, true, type).then(x => {
                                    resolve(x);
                                }).catch(x => {
                                    reject(x);
                                })
                            }, 500);
                            return;
                        }

                        if (url.indexOf("arweave") > -1) {
                            fixFailData.bind(this)(blob, url).then(x => {
                                if (!x) {

                                    reject("does_not_exist")
                                } else {
                                    if (x) {
                                        resolve(x);
                                    } else {
                                        resolve(blob);
                                    }
                                }
                            });

                            return;
                        }

                        throw "not_file_maybe";
                    } else {

                        fixFailData.bind(this)(blob, url).then(x => {
                            if (!x) {
                                reject("does_not_exist")
                            } else {
                                if (x) {
                                    resolve(x);
                                } else {
                                    resolve(blob);
                                }
                            }
                        });


                    }

                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }

            return;
            try {
                fetch(url, {}).then(res => res.blob()).then((blob) => {
                    if (!blob || blob.size < 64) {

                        throw "not_file_maybe";
                    } else {
                        resolve(blob);
                    }

                })
            } catch (e) {
                reject(e);
            }
        })


    }
    localBlobs = {};
    noBlobSupport = false;
    async saveFile(blob, key, version, type) {
        if (this.noBlobSupport) {
            this.localBlobs[key] = blob;
            return;
        }
        return new Promise(async (resolve, reject) => {
            try {
                const table = await storage.table("files", true);
                let file = blob;
                let text = false;



                if (type?.json) {

                    try {

                        if (!(blob?.text?.length)) {
                            text = await file.text();
                        } else {
                            text = blob.text;
                        }
                        blob.text = text;

                    } catch (e) {

                        resolve(false);
                        return
                    }
                    file = false;
                }
                await table.dexie.put({
                    id: key,
                    user: 0,
                    version: version ? version.now : 0,
                    file,
                    text,
                    date: Date.now()
                });
                this.emit("saved-" + key, blob);
                resolve(true);

            } catch (e) {

                if (e.message.indexOf("BlobURLs") > -1) {
                    this.noBlobSupport = true;



                    window.galatic05.modal.new({ id: "error", props: { hideX: true, message: "Off incognito", title: "Oops" } });

                }
                this.localBlobs[key] = blob;
                console.log("error", e)
                resolve(false);
                //reject(e);
            }

        })

    }

    async deleteFileURL(url, key, type) {
        if (key && typeof key != "string") {
            type = key;
            key = false;
        }
        if (!url) return
        if (url?.includes?.("blob:")) return

        if (type && type.fast) {
            const ipfs = this.isIPFSUrl(url);
            if (ipfs) url = ipfs_copy[ipfs] || "https://" + this.ipfsURL + "/hash/" + ipfs;
        }

        if (!key && typeof url == "string") {
            key = this.generateKey(url)
        }

        this.deleteFile(key);
    }

    async deleteFile(key) {
        return new Promise(async (resolve, reject) => {

            try {

                const table = await storage.table("files", true);
                await table.dexie.delete(key);
                resolve();

            } catch (e) {
                reject(e);
            }

        })
    }

    async readFile(key, version, type) {
        if (!type) type = {};
        if (this.localBlobs[key]) {

            return { file: this.localBlobs[key], date: Date.now() };
            return;
        }

        return new Promise(async (resolve, reject) => {

            try {
                const table = await storage.table("files", true);


                const blob = await table.dexie.get(key);



                if (type.text) {
                    if (blob?.text) {
                        resolve({ text: blob.text, date: blob.date });
                        return
                    } else {
                        resolve(false);
                    }
                }
                if (blob?.file && !blob.file.error && (!version || blob.version == version.now)) {

                    if (typeof blob.file == "string") {
                        resolve(false);
                        return;
                    }

                    if (type && type.checktype && !type.checktype(blob.file)) {
                        resolve(false);
                        return;
                    }


                    resolve({ file: blob.file, date: blob.date });
                } else {
                    resolve(false);
                }

            } catch (e) {

                resolve(false);
            }

        })
    }

    _postconstructor(data) {

        //window.screen.orientation.lock('portrait');
    }

}

export const file = new FileService();
file.getAverageColor = getAverageColor;
file.modelColors = {};
window.galatic05.file = file;

file.parseGIF = async (blob) => {

    /*const ran = await gifsicle.run({
      input: [{
        file: blob,
        name: '1.gif'
      }],
      command: [
        '--info 1.gif -o /out/out.txt',
      ],
    })
    console.log("gif RAN",ran)*/
}
