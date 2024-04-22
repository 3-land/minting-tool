export class AccountManager extends generalBase {
    hashManager = new queueManager();
    async getAccountFrom(hash) {

        const table = await storage.table("user_info");
        const now = Date.now() / 1000;
        const cache = await table.get("hash", hash);
        if (cache && cache[0]) {
            const date = cache[0].date;
            if (now - date < 60 * 60 * 24 * 30) {
                return cache[0].data;
            }
        }

        const respuesta = await this.hashManager.work(hash, async () => {
            const url = request.buildUrl({ path: "/users/public/info" });
            return request.request(this, { url, stack: true, method: "POST", args: { hash } });
        })
        if (respuesta?.data?.success) {

            const data = respuesta.data.info;

            await table.set({ hash, data, date: now }, "hash")

            return data;
        }
        return respuesta;
    }

    _postconstructor(data) {
        this.sessions = false;
        this.getActiveSession().then(async (session) => {

            if (session?.profile?.address) {

                const urihash = location.hash.length > 0 ? location.hash : false;

                const ph = parseHash();
                if (ph?.linked) {

                    const type = ph.linked;
                    let app = ph?.app;
                    const username = ph?.username;
                    if (username) {


                        if (app) await this.clearLinkedAccountsCache({ app });
                        await userConfigManager.clearHash(session.profile.address);


                        app = app || "main";
                        const name = type.substring(0, 1).toUpperCase() + type.substring(1, type.length)
                        sysend.broadcast("account:" + type + ":" + app + ":link", username)


                        const from = {
                            index: "custom",
                            props: {
                                component: "SocialMediaConnectionLoader",
                                type,
                                linked: true
                            },
                        };

                        const mod = modal.card({
                            alert: true,
                            cardType: "animated centered limitheight full medium_desktop",
                            props: {
                                canCancel: false,
                                hideNavigation: true,
                                from,
                            },
                            component: "ConnectFlow",
                        });

                    } else {

                        app = app || "main";
                        const name = type.substring(0, 1).toUpperCase() + type.substring(1, type.length)
                        sysend.broadcast("account:" + type + ":" + app + ":link", false)

                        const from = {
                            index: "custom",
                            props: {
                                component: "SocialMediaConnectionLoader",
                                type,
                                linked: false
                            },
                        };

                        const mod = modal.card({
                            alert: true,
                            cardType: "animated centered limitheight full medium_desktop",
                            props: {
                                canCancel: false,
                                hideNavigation: true,
                                from,
                            },
                            component: "ConnectFlow",
                        });

                    }


                    //            alert("poner que el ususario tenga que aceptar algo para que se cierre y te mande a la otra ventana")
                    //              await sleep(5000);
                    //            window.close();

                } else if (urihash?.startsWith?.("#linked-")) {




                    const str = urihash.split("#linked-")[1].split("-");
                    const type = str[0];

                    if (str[1]) {
                        await this.clearLinkedAccountsCache({ app: str[1] });
                    } else {
                        await userConfigManager.clearHash(session.profile.address);
                    }
                    const app = str[1] ? str[1] : "main";

                    const name = type.substring(0, 1).toUpperCase() + type.substring(1, type.length)
                    sysend.broadcast("account:" + type + ":" + app + ":link")

                    if (app == "main") {
                        modal.new({ id: type + "_linked", props: { message: "Your " + name + " has been linked to your 3.land account.<br><br>Please allow some minutes to propagate 😎", title: name + " Linked" } })
                    } else {
                        modal.new({ id: type + "_linked", props: { message: "Your " + name + " has been linked to your 3.land account.<br><br>Please allow some minutes to propagate 😎", title: name + " Linked" } })
                    }

                    await sleep(500);
                    window.location.hash = '';

                }

            }

        })
    }

    getLanguage() {
        return app.language?.id || "en";
    }

    async saveToken(cual) {
        if (!cual) {
            return cual;
        }
        const ses = await this.getSessions();
        for (const key in ses) {
            if (ses[key].device) {
                ses[key].device.push = cual;
            }
        }

        this.sessions = { ...ses };

        await this.saveSessions();
    }

    async newWalletDetected({ address, wallet }) {
        console.log("WALLET CM");
        if (address) {

            const sesion = await this.getActiveSession();
            if (sesion?.wallet != wallet || sesion?.device?.token?.includes("guest")) {
                return
            }

            let lastActive = false;
            let foundOne = false;
            for (const key in this.sessions) {
                if (this.sessions[key].active) {
                    lastActive = key;
                }
                if (key.includes("guest")) {
                    this.sessions[key] = false;
                    delete this.sessions[key];
                } else {
                    this.sessions[key].active = false;
                }
                if (this.sessions[key]?.profile?.address == address && this.sessions[key].wallet == wallet) {
                    this.sessions[key].active = true;
                    foundOne = key;
                }
            }
            console.log("FOUND ONE", foundOne, lastActive)
            if (foundOne && foundOne != lastActive) {
                const load = modal.loader({ id: "load", props: { message: "verifying wallet..." } });
                const verify = await this.verifyToken({ id: foundOne });
                load.kill();
                if (!verify || verify?.error) {

                    const _data = { connection: [this.sessions[foundOne]?.profile?.address], type: wallet, wallet };
                    modal.card({ event: false, id: "login", alert: true, cardType: "animated centered", props: { hideBack: true, from: { index: "ask_wallet", props: { _data, login: null } } }, component: "ConnectFlow" });

                    return
                };
                await this.saveSessions();
                window.reload();
            } else if (!foundOne && lastActive) {
                this.sessions[lastActive].active = true;
            }
        }
    }

    async walletConnected({ address, wallet }) {
        if (address) {

            const sesion = await this.getActiveSession();

            if (sesion?.wallet != wallet || sesion?.device?.token?.includes("guest")) {
                return
            }

            let lastActive = false;
            let foundOne = false;
            for (const key in this.sessions) {
                if (this.sessions[key].active) {
                    lastActive = key;
                }
                if (key.includes("guest")) {
                    this.sessions[key] = false;
                    delete this.sessions[key];
                } else {
                    this.sessions[key].active = false;
                }
                if (this.sessions[key]?.profile?.address == address && this.sessions[key].wallet == wallet) {
                    this.sessions[key].active = true;
                    foundOne = key;
                }
            }
            return foundOne
        }
    }

    async verifyToken({ id }) {
        const url = request.buildUrl({ path: "/account/verify" });
        const args = { id, _device: (await this.getDevice({ id })) };
        return request.request(this, { url, method: "POST", args });
    }

    async verifyWallet({ address }) {
        const url = request.buildUrl({ path: "/account/wallet/verify" });
        const args = { address };
        return request.request(this, { url, method: "POST", args });
    }

    async addAccount(account) {
        if (account?.device?.push) {
            await window.galatic05.storage.setLocal({ pushNotification: account.device.push });
        }

        const sesion = await this.getActiveSession();
        for (const key in this.sessions) {
            if (key.includes("guest")) {
                this.sessions[key] = false;
                delete this.sessions[key];
            } else {
                this.sessions[key].active = false;
            }
        }
        if (!this.sessions) this.sessions = {};
        this.sessions[account.profile.id] = account;
        this.sessions[account.profile.id].active = true;
        await this.saveSessions();
    }

    async getDevice(opts) {
        const { skip_auto_activate, id } = opts || {};
        const ses = id ? this.sessions[id] : (await this.getActiveSession(skip_auto_activate));

        if (!ses?.device?.uuid) {
            const type = (window.Capacitor?.platform && window.Capacitor?.platform != "web") ? window.Capacitor.platform : (app.isMobile() ? "mobile" : "web");
            const token = ses?.device?.token || false;

            const push = app.pushNotification || (ses?.device?.push);

            return { uuid: uuid4(), push: false, token, type: type, lang: this.getLanguage(), name: app.getBrowser() };
        } else {

            if (app.pushNotification) ses.device.push = app.pushNotification;
            return ses.device;
        }
    }

    async getUserId() {
        const ses = await this.getActiveSession();
        return (!ses?.device || ses.device.token == "guest") ? "guest" : ses.profile.id;
    }

    async initGuest() {

        if (!this.sessions) this.sessions = {};

        const word = window.skipSolana ? "iphone" : "guest";

        for (const key in this.sessions) {
            if ((this.sessions[key].profile.id + "").includes(word)) {
                this.sessions[key].active = true;
                delete this.sessions[key].wallet;
                return this.sessions[key];
            }
        }

        const id = uuid4();
        const dev = { ...(await this.getDevice({ skip_auto_activate: true })) };

        dev.token = word;
        if (word == "iphone") {
            dev.uuid = "iphone";
        }

        const guest = { profile: { id: word + id }, device: dev, active: true };
        this.sessions[guest.profile.id] = guest;
        return guest;
    }

    async logout(opts) {
        window.login_time = false;
        if (opts?.direct) {
            await this.changeToAddress(false)
            if (!opts?.noreload) window.reload();
            return
        }

        app.native?.haptics?.notification?.error?.()
        const out = await new Promise((resolve) => {

            if (!opts) opts = {};

            const mod = modal.card({ event: false, id: "login", alert: true, cardType: "animated centered", props: { from: { index: "logout", props: { title: translate('logging_out'), message: translate('are_you_sure_you_want_to_log_out_from_your_account'), buttons: [{ action: "super:accept", color: "theme-error", label: translate('log_out') }, { action: "close", color: "neutral", label: "cancel" }] } } }, component: "ConnectFlow" });

            let aceptada = false;
            mod.attach(this, "kill", "morir", () => {
                if (aceptada) return
                resolve(false);
            })

            mod.attach(this, "accept", "aceptar", () => {
                aceptada = true;
                mod.kill();
                resolve(true);
            })

        })

        if (out) {
            await this.changeToAddress(false)
            if (!opts?.noreload) window.reload();
        }
    }

    async clearLinkedAccountsCache({ app }) {
        const url = request.buildUrl({ path: "/account/linked" });
        const obj = { url, method: "POST", cache: { time: 3600, id: "account-linked" }, args: { app } };
        return request.clear_cache(obj);
    }

    async isLinked({ app }) {
        const url = request.buildUrl({ path: "/account/linked" });
        return (await request.request(this, { url, method: "POST", cache: { time: 3600, id: "account-linked" }, args: { app } }))?.data;
    }

    async prelogin({ type, account, passkeys }) {
        const r = await this.verifyAccount({ type, account, passkeys })
        if (r?.data?.user?.design && (typeof r.data.user.design) == "string") r.data.user.design = JSON.parse(r.data.user.design);
        if (r?.error) return r;
        return r?.data;
    }

    async verifyAccount({ type, account, passkeys }) {
        const url = request.buildUrl({ path: "/account/find" });
        const args = { type, account };
        if (passkeys) {
            if (passkeys.provider) passkeys.provider = passkeys.provider.split(":")[0];
            args.passkeys = passkeys;
        }
        return request.request(this, { url, method: "POST", cache: { time: 15, id: "account-find" }, args });
    }


    async verifyLogin({ type, account, create, hash, wallet, password, manual }) {
        try {
            console.log("WALLETADD", { type, account, create, hash, wallet, password, manual });
            const url = request.buildUrl({ path: "/account/" + (create ? "signup" : "signin") });

            const passkey = password?.passkey

            const args = create ? { type, account, create, password } : { type, account, password };
            if (hash) args.hash = hash;

            if (app_info?.app?.id) args.app = app_info?.app?.id || "default";

            const logged = await request.request(this, { url, method: "POST", args });
            if (logged?.data?.account) {

                window.login_time = Date.now();

                if (!manual && create && app.getOnboardingType()) storage.setLocal({ onboard: true });


                if (!manual) {
                    const acct = { ...logged.data.account, passkey };
                    if (!wallet) { //Wallet provider name not found, trying to guess it
                        if (passkey) {
                            wallet = "keyz.id";
                        } else {
                            const keys = connectedPublics();
                            for (const key in keys) {
                                if (keys[key] == acct.profile.address) {
                                    wallet = key;
                                    break;
                                }
                            }
                        }
                    }
                    if (wallet) acct.wallet = wallet;
                    await this.addAccount(acct)
                }
                return logged?.data
            }
            return logged?.error ? logged : false;
        } catch (e) {
            return false;
        }
    }

    async login() {


        // const solanaGate = window.galatic05.solana;
        const modal = window.galatic05.modal;
        modal.card({ event, id: "login", alert: true, cardType: "animated centered", props: { hideBack: true }, component: "ConnectFlow" });


    }

    async changeToAddress(address) {
        if (this.appData && address) {
            this.appData = null
        }
        /*try{
          if(!address){
            if(window.galatic05.solana?.provider){
                window.galatic05.solana.provider.publicKey = null;
            }
          }
        }catch(e){}*/

        if (!this.sessions) this.sessions = {};

        const word = "guest";

        let guest = false;

        for (const key in this.sessions) {
            this.sessions[key].active = false;
        }

        for (const key in this.sessions) {
            if (address && this.sessions[key].profile.address === address) {
                this.sessions[key].active = true;

                await this.saveSessions();
                return this.sessions[key];
            }

            if ((this.sessions[key].profile.id + "").includes(word)) {
                guest = key;
            }
        }

        if (!address) {
            await storage.removeLocal("phantom_session");
            await storage.removeLocal("phantom_sign");
            await storage.removeLocal("phantom_link");
        }

        if (guest) {
            console.log("HAY GUEST")
            this.sessions[guest].active = true;
            delete this.sessions[guest].wallet;

            await this.saveSessions();
            return this.sessions[guest];
        } else {
            console.log("SE PONE");
            const g = await this.initGuest();
            await this.saveSessions();

            return g;
        }

    }

    async getToken() {
        const sesion = await this.getActiveSession();
        if (!sesion) {
            const guest = await this.initGuest();
            await this.saveSessions();

            return guest.profile.id + ":" + guest.device.token;
        } else {

            return sesion.profile.id + ":" + sesion.device.token;
        }

    }

    guest() {

        for (const key in this.sessions) {
            if (this.sessions[key].active) {
                return this.sessions[key].device.token == "guest";
            }
        }
        return true;
    }

    fastSession() {

        for (const key in this.sessions) {
            if (this.sessions[key].active) {
                return this.sessions[key];
            }
        }
        return false;
    }

    address() {

        for (const key in this.sessions) {
            if (this.sessions[key].active) {
                return this.sessions[key].profile.address;
            }
        }
        return false;
    }

    async saveProfileData(address, data) {

        for (const key in this.sessions) {
            if (this.sessions[key].profile && this.sessions[key].profile.address == address) {
                for (const key2 in data) {
                    if (data[key2] !== undefined) this.sessions[key].profile[key2] = data[key2];
                }
            }
        }
        await this.saveSessions();

    }

    async getActiveSession(skip_auto_activate) {
        const ses = await this.getSessions();

        for (const key in ses) {
            if (ses[key].active) {
                if (ses[key].device.token == "guest") {
                    this.sessions[key].profile = { id: "guest" + ses[key].device.uuid };
                }

                return ses[key];
            }
        }
        if (ses && Object.keys(ses)[0] && !skip_auto_activate) {
            this.sessions[Object.keys(ses)[0]].active = true;
            await this.saveSessions();

            const sesa = this.sessions[Object.keys(ses)[0]];
            if (sesa.device.token == "guest") {
                this.sessions[Object.keys(ses)[0]].profile = { id: "guest" + sesa.device.uuid };
            }

            return this.sessions[Object.keys(ses)[0]];
        } else {
            /*if(JSON.stringify(this.sessions)!=JSON.stringify(ses)){
                this.sessions = false;
                await this.saveSessions();
            }*/
            return false;
        }
    }

    async saveSessions() {
        if (this.sessions && Object.keys(this.sessions).length) {
            await storage.setLocal({ "sessions": this.sessions });
            //    sysend.broadcast("session:saved");
            await this.syncAppData();
        } else if (this.sessions === false) {
            await storage.removeLocal("phantom_session");
            await storage.removeLocal("phantom_sign");
            await storage.removeLocal("phantom_link");
            await storage.removeLocal("sessions");
            //  sysend.broadcast("session:saved");
            await this.syncAppData();
        }
        this.emit("login:update");
    }

    app = { loaded: false };
    async syncApp(id) {

        const n = id || null
        if (this.app.id !== n) {
            this.app.id = n;
            this.syncAppData(n)
        } else {
            this.app.id = n;
        }


    }

    appData = {};
    async syncAppData() {
        const now = Date.now();
        if (this.sessions && window.login_time && (now - window.login_time) < 1000) {
            console.log("HIZO LOGIN")
            this.emit("logged_in");
        }
        if (this.app.id || this.app.id === null) {
            const cual = this.app?.id || "default";
            if (!this.appData) this.appData = {};
            if (this.sessions && !this.appData[cual]) {
                this.appData[cual] = await appInfo(cual);
            } else if (!this.sessions && this.appData) {
                this.appData = {};
            }
        }
    }

    async getSessions() {
        if (this.sessions) {
            return this.sessions;
        }
        const ses = await storage.getLocal(["sessions"])
        if (ses.sessions) {
            this.sessions = ses.sessions;
        } else {
            this.sessions = false;
        }
        await this.syncAppData();
        return this.sessions;
    }


}

export const account = new AccountManager();