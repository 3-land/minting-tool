export const getProvider = (wallet) => {
    console.log("GETPROV", wallet);
    if (!wallet) {
        try {
            defaulta = window.galatic05.account.fastSession().wallet;
            wallet = defaulta;
        } catch (e) {

        }
    }

    let provider = false;
    if (wallet == "solflare") {
        provider = window.solflare;
    } else if (wallet == "phantom") {
        provider = window.solana;
    } else {
        provider = window.solana || window.solflare;
    }
    console.log("PROVIDER", provider);
    return provider;
}