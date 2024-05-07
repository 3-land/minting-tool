import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID
} from "@metaplex-foundation/mpl-bubblegum";
import bs58 from 'bs58';
import {
    SPL_NOOP_PROGRAM_ID,
    deserializeChangeLogEventV1
} from "@solana/spl-account-compression";

import { PublicKey } from '@solana/web3.js';

import BN from "bn.js";



function getAllChangeLogEventV1FromTransaction(
    txResponse,
    noopProgramId = SPL_NOOP_PROGRAM_ID
) {

    const accountKeys = txResponse.transaction.message
        .getAccountKeys()
        .keySegments()
        .flat();

    const changeLogEvents = [];

    // locate and parse noop instruction calls via cpi (aka inner instructions)
    txResponse.meta?.innerInstructions?.forEach((compiledIx) => {
        compiledIx.instructions.forEach((innerIx) => {
            if (
                noopProgramId.toBase58() !==
                accountKeys[innerIx.programIdIndex].toBase58()
            )
                return;
            try {
                changeLogEvents.push(
                    deserializeChangeLogEventV1(Buffer.from(bs58.decode(innerIx.data)))
                );
            } catch (__) {
            }
        });
    });

    return changeLogEvents;
}

const getAssetPDA = async (index, tree) => {
    const tk = (
        await PublicKey.findProgramAddress(
            [
                Buffer.from('asset', 'utf8'), tree.toBuffer(), Uint8Array.from(new BN(index).toArray('le', 8))
            ],
            BUBBLEGUM_PROGRAM_ID
        )
    );
    return tk[0];
};


export async function getCNFtId(signature, connection) {
    const transactionInfo = await connection.getTransaction(signature, { commitment: "confirmed" });
    const k = await getAllChangeLogEventV1FromTransaction(transactionInfo);
    const ids = [];
    if (k) {
        for (let i = 0; i < k.length; i++) {

            const index = k[i].index;
            const tree = k[i].treeId;


            const asset = await getAssetPDA(index, tree)
            ids.push(asset);

        }
    }
    return ids;
}
