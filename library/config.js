export const app_info = {};

export const version = /*version*/"0.0.27"/*version*/;
window.version = version;
app_info.version = version;

app_info.alert = { default: "Alert" };
app_info.loader = { default: "Loader" };
app_info.theme = "default";

const quer = (location.search || "").split("?");
if (quer[1]) {

    quer[1].split("&").forEach(x => {
        const s = x.split("=");
        if (s[0] == "net") {
            if (s[1] == "devnet") {
                app_info.candidate = "dev";
            } else {
                app_info.candidate = "prod";
            }
        }
    })
}

const appTV = { name: "TV", id: "tv", after_login: true };
const appKeyz = { name: "Keyz", id: "keyz" };
const appSheeps = { name: "Battle Sheeps", id: "battlesheepz" }
const appMSG = { name: "{{MSG}}.LAND", id: "msg", subapp: "msg" }
const appClaim = { name: "CLAIM", id: "claim", subapp: "claim" }

const local_deploy = false && appClaim; //false;// || appSheeps || appTV;

const testing = "dev";

app_info.native = false;

/*if (location.host.includes("3000kid") && local_deploy) {
    app_info.passkeys = { provider: "3000kid.com:1025", self: false, mobile: false, direct: true, any_action: true, app: "123" };
} else {
    app_info.passkeys = { provider: "keyz.id", self: false, direct: false, any_action: true, app: "123" };
}*/

app_info.passkeys = { provider: location.host, self: true, direct: false, any_action: true, app: location.href.includes("3000kid") ? "123" : "123456" };

app_info.offline = false;

const localdev = (location.href.includes("localhost") || location.href.includes("3000kid") || location.href.includes("192") || location.href.includes("10.") || location.href.includes("172.") || location.href.includes("capacitor"));

if (localdev && local_deploy) {
    app_info.app = local_deploy;
} else {
    app_info.app = location.hostname.includes("sol.fans") ? appClaim : (location.hostname.includes("msg.land") ? appMSG : (location.hostname.includes("battlesheeps.com") ? appSheeps : location.hostname.includes("3tv.chat") ? appTV : (location.hostname.includes("keyz.id") ? appKeyz : false)));
}

if (!app_info.candidate) app_info.candidate = (localdev && app_info.app.id != "msg") ? testing : ((location.href.includes("dev.") || app_info.app.id == "msg") ? "dev" : "prod");


app_info.prod = app_info.candidate == "prod";
app_info.dev = app_info.candidate == "dev";
//9XeH3JmGj1h8VJ5r5xYbNc2zEPrQM9GGNPfcCCxcn2tg
app_info.default_world = app_info.prod ? { hash: 'DLobPGBoUaVDKfvoxS3k43ZkSFL796AFQf2H7mzoY629' } : { hash: 'A3kyafyQkvkWiDcCPCnzfueXhfRyYT7MaE2Lmq3Lkq2A' };

const hashes = ["virtuaLEbwvnewXsHYFCV5FWDmPUVFX9NAiuGjbBfM8PqXczXam", "337fw8K3jMcY7D9itDPeMdcsdHkGp247LtVRtWpXmj9t", "virtuaL3LcvfEAArWuXD9LFkHahkuWN7GzkNmyLicLwuF1u7oCc", "7r4pTvCeGHqRo9BTivwHsBDJ27ywgkMweFSQmhLURDjk", "DoqCmDAMVJg1G4jTevRKimuTUyiTv4PfMTspepT1JkeY", "virtuaLEYhLu2g1p53cJnZh18FLpZEggGphA9B3Edki7y5g1AHx", "3R3QG9q6aGQqjMpZtA1rGqiRUqUwnqQ6tXCjPRKF9Wyv", "virtuaLEu8us7rfX5Y6UTomsNd7BqYNK3uckhbsCajdVLDRXLXi", "FP84HSUK8MhdLAfWnWtDQgWtg8BMKTwg5oNq8gK6x9dP", "ABzrYQaQvjuXneMc2wt7VjtmQT6A7RXuDP6XyuB6Vgnm", "AMwuGLeCQBbrjA8jyX7JXp2fpHrMKBWcyB9Bh3oSrdH", "CQbfigZ8m5WZ3qx7NorLrvt4Nm6MDGrbbms8hMDEwqZV", "DLobPGBoUaVDKfvoxS3k43ZkSFL796AFQf2H7mzoY629", "2BCAkife9W7NwneLn2dbKLUrP8HsJoUXBsvXasQiXy32", "virtuaL9D7iz6ZHQ9bFvTsgrNs29NC4TxrVC6fk15x983yYbfMn", "385dmd3vCCx1PwFmiEjjgmBtwao1HZhUcW1pGXAfiYwv", "virtuaL9kVFw3nUSuCYKcYCfQXHxMCmBF8Y5CzAtoVjNNccCMR6", "virtuaL7ZVVZaCBoJ5LFoPdLGMDdm9mhtxv4agcESJNYH9oa2GA", "virtuaLC2tzZKzUzo6aPmWkP3EG12P44yBLy9odJuf1PQsp1uko"];
if (app_info.prod) {
    app_info.default_world.hash = () => {
        const idx = Math.floor(hashes.length * Math.random());
        return hashes[idx];
    }
} else {
    app_info.default_world.hash = () => {
        return "A3kyafyQkvkWiDcCPCnzfueXhfRyYT7MaE2Lmq3Lkq2A";
    }
}

//https://api-devnet.helius.xyz/v0/addresses/HgtiJuEcdN6bN6WyYpamL3QKpyMcF8g8FxutDQNB96J9/transactions?api-key=3ec29225-2be7-4968-b3e5-6d40b690fd6d

app_info.packs = location.host.includes("3000kid");

app_info.network = app_info.candidate == "prod" ? "mainnet-beta" : "devnet";
app_info.network_id = app_info.candidate == "prod" ? "mainnet" : "devnet";

app_info.custom_network = app_info.candidate == "prod" ? { quicknode: "https://quaint-patient-road.solana-mainnet.discover.quiknode.pro/fa32669ffd41acdb3feb80e7a437e77b352af38b", alchemy_ios: "https://solana-mainnet.g.alchemy.com/v2/apU15gqVSSUHnEyLM2ouM8R1Pfnyzwgt", helius: "https://rpc.helius.xyz/?api-key=3ec29225-2be7-4968-b3e5-6d40b690fd6d", alchemy: "https://solana-mainnet.g.alchemy.com/v2/Mi18dnmTiYyE-X13z5DZGkMBbJxgPPPa", shyft: "https://rpc.shyft.to?api_key=2hQORp9MDjo3noHf" } : false;

console.log("app_info.dev", app_info.dev)

app_info.claimz = { holder: "5GRMWDMmNoCxEz3MP4A28Sp6EmcwqggdQKnLqz1kWDgK", subscribers_holder: "4GEWiseSmMWwdaQsLdtPnMrPyCLxTDudiiAyYteDAjYd", users_holder: "CZUC44opp5CwUob7LsdeTXE7Jyaa12UuJak3EeYCSdjB", subscriptions_holder: "pFZQcr26HWUspypA4MyLoUUvtGJv5wJEob6juT7tdkC", subscription_post_likes_holder: "6Qox6QkkjSQZPUogwYdprEUPRTNFyWPDRWs8NkQsJ4TP", subscription_posts_holder: "GKhHfa3oFaPQYzCDTCbs92JipTeuQgPSY65hNV3C5xpF", slot: 999 };
app_info.msg = app_info.dev ? { holder: "GYZTVgSLqDxPkXQPBFNKJRFViKrpW1U6J8YbcYeMkd53", slot: 999 } : { holder: "GYZTVgSLqDxPkXQPBFNKJRFViKrpW1U6J8YbcYeMkd53", slot: 999 };
app_info.cnfaucet = { store: "94TpknjLkxbtMsnFZ2iT9yx64rAV2hYT96myv6nGP6Jd" }
//app_info.msg = {holder:"5d8keGq3G6cQQD2opaaKXyVBvwSTfdP1jHFAhaS1ZcZX"};

app_info.debug = app_info.dev || (false && location.host.includes("3000kid")) || false || false;

app_info.paths = (app_info.app?.id == "msg" || app_info.app?.id == "claim") ? { user: "user", address: true } : (app_info.debug ? { user: "user", asset: "asset" } : { user: "u", asset: "h" });
app_info.market = { path: app_info.debug ? "/marketplace" : "/market/all" };

app_info.show_theme = false;
app_info.allow_keys = app_info.dev;


app_info.r3gion = "/?net=" + app_info.network;



