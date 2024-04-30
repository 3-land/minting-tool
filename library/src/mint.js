import { init as Irys } from "./irys";
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from "solana-wallets-vue";
import { toPublicKey } from "./misc";

import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
    TokenProgramVersion,
    TokenStandard,
    createCreateTreeInstruction,
    createMintV1Instruction
} from "@metaplex-foundation/mpl-bubblegum"; //0.7.0

import {
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    createAllocTreeIx
} from "@solana/spl-account-compression"; //0.1.10


export const createTree = async ({ payer, public_tree }) => {
    const { sendTransaction } = useWallet();


    public_tree = public_tree ?? true;
    payer = toPublicKey(payer);

    const connection = createConnection();
    const signers = [];
    const merkleTreeKeypair = Keypair.generate();
    signers.push(merkleTreeKeypair);

    const maxDepth = 15;
    const maxBufferSize = 64;

    const maxDepthSizePair = { maxDepth, maxBufferSize };
    const canopyDepth = 4;


    const allocTreeIx = await createAllocTreeIx(
        connection,
        merkleTreeKeypair.publicKey,
        payer,
        maxDepthSizePair,
        canopyDepth
    );
    const [treeAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(merkleTreeKeypair.publicKey.toBytes())],
        BUBBLEGUM_PROGRAM_ID
    );
    const createTreeIxAccounts = {
        treeAuthority,
        merkleTree: merkleTreeKeypair.publicKey,
        payer,
        treeCreator: payer,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    };
    const createTreeIxArgs = {
        maxDepth: maxDepthSizePair.maxDepth,
        maxBufferSize: maxDepthSizePair.maxBufferSize,
        public: public_tree,
    };
    const createTreeIx = createCreateTreeInstruction(
        createTreeIxAccounts,
        createTreeIxArgs
    );

    const instructions = [allocTreeIx, createTreeIx];

    const tx = new Transaction();
    tx.add(...instructions);

    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = payer;
    tx.partialSign(...signers);
    const signature = await sendTransaction(tx, connection);
    return await connection.confirmTransaction(signature, { commitment: "confirmed" });
}

/*
    Parameters
    @payer = public key for the wallet connected
    @tree = merkle tree public key
    @treeDelegate = public key for the merkle tree creator
*/
export const compressNFT = async ({ payer, tree, treeDelegate, metadata, creatorWallets }) => {

    const uuid = "random_uuid_per_upload_session";

    const { sendTransaction } = useWallet();
    const connection = createConnection();

    const symbol = "Symbol";
    const name = "Name";

    tree = toPublicKey(tree);
    payer = toPublicKey(payer);
    treeDelegate = treeDelegate ? toPublicKey(treeDelegate) || payer : '';


    const royalty = metadata.royalties;

    let sellerFeeBasisPoints = royalty * 100;


    const creators = creatorWallets.map(item => {
        if (item.address.toBase58() === payer.toBase58()) {
            return { address: item.address, share: item.royalty, verified: true };
        } else {
            return { address: item.address, share: item.royalty, verified: false }
        }
    })

    const isMutable = false;

    const signers = [];

    const irys = await Irys(payer.toBase58());
    signers.push(irys.wallet);


    let traits = metadata.traits.map((item) => {
        return {
            ...item,
            trait_type: item.name
        };
    });
    traits = traits.map(item => {
        delete item.name;
        return item;
    });

    let main_file = false;
    let cover_file = false;

    if (metadata.files.file) {
        main_file = await irys.bundle(metadata.files.file, false);
    }
    if (metadata.files.cover) {
        cover_file = await irys.bundle(metadata.files.cover, false);
    }

    const offchain_metadata = {
        name: metadata.name,
        description: metadata.description,
        seller_fee_basis_points: sellerFeeBasisPoints,
        symbol,
        properties: {
            files: [
                { type: checkFileType(main_file), uri: main_file?.irys?.url },
                ...(cover_file ? [{ type: checkFileType(cover_file), uri: cover_file?.irys?.url }] : [])
            ],
            creators
        },
        image: (cover_file || main_file)?.irys?.url,
        attributes: traits,
        category: checkFileType(main_file)
    };


    const metadata_file = new Blob([JSON.stringify(offchain_metadata)], { type: "application/json" });


    const bundled_metadata_file = await irys.bundle(metadata_file, true);
    const irys_url = bundled_metadata_file.irys.url;

    const irys_files = [bundled_metadata_file];

    if (main_file) irys_files.push(main_file);
    if (cover_file) irys_files.push(cover_file);

    const irys_ix = await irys.getFundingInstructions({ files: irys_files });
    const irys_registration = await irys.registerFiles({ files: irys_files, uuid });

    const onchain = {
        name,
        symbol,
        uri: irys_url,
        sellerFeeBasisPoints,
        creators: creators.map(x => ({ ...x, address: toPublicKey(x.address) })),
        collection: null,
        uses: null,
        editionNonce: 0,
        isMutable,
        primarySaleHappened: true,
        tokenProgramVersion: TokenProgramVersion.Original,
        tokenStandard: TokenStandard.NonFungible,
    }


    const [treeAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(tree.toBytes())],
        BUBBLEGUM_PROGRAM_ID
    );

    const mint_accounts = {
        treeAuthority,
        leafOwner: payer,
        leafDelegate: payer,
        merkleTree: tree,
        payer,
        treeDelegate,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
    }


    const instructions = [];

    const mint_args = { message: onchain };
    instructions.push(createMintV1Instruction(mint_accounts, mint_args))

    const tx = new Transaction();
    tx.add(...irys_ix.instructions, ...instructions);
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = payer;
    tx.partialSign(...signers);
    const signature = await sendTransaction(tx, connection);
    const sent = await connection.confirmTransaction(signature, { commitment: "confirmed" });

    irys.uploadFiles({ uuid, signature, files: irys_files })

}



const createConnection = () => {
    return new Connection("https://radial-restless-asphalt.solana-devnet.quiknode.pro/ee9d638cb93948779161df8f99a04ccf17026c8a/", { commitment: "confirmed", confirmTransactionInitialTimeout: (60 * 2 * 1000) })
}

export const uuid4 = () => {
    const ho = (n, p) => n.toString(16).padStart(p, 0); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const data = crypto.getRandomValues(new Uint8Array(16)); /// Fill the buffer with random data
    data[6] = (data[6] & 0xf) | 0x40; /// Patch the 6th byte to reflect a version 4 UUID
    data[8] = (data[8] & 0x3f) | 0x80; /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    const view = new DataView(data.buffer); /// Create a view backed by a 16-byte buffer
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
};

export const checkFileType = (file) => {
    return file?.type?.includes("image")
        ? "image"
        : file?.type?.includes("audio")
            ? "audio"
            : file?.type?.includes("video")
                ? "video"
                : file?.name?.includes(".glb")
                    ? "vr"
                    : null;
};