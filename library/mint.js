// import { init as Irys } from "./irys";
// import { uuid4 } from "@/services/app";
import { init as Irys } from "./irys";
// import { useWallet } from 'solana-wallets-vue';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { MintLayout, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, createInitializeMintInstruction, createBurnInstruction, getAccount } from '@solana/spl-token';

import { useWallet } from "solana-wallets-vue";

import { toPublicKey } from "./misc";

import {
    createUpdateMetadataAccountInstruction,
    createUpdateMetadataAccountV2Instruction,
    createCreateMasterEditionV3Instruction,
    createCreateMetadataAccountV3Instruction,
    //DataV2,
    createMintNewEditionFromMasterEditionViaTokenInstruction,
    PROGRAM_ID as metaPROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata'; //2.13.0

/*
{
  "type": "module",
  "dependencies": {
    "@irys/sdk": "^0.1.6",
    "@metaplex-foundation/mpl-bubblegum": "^0.9.0",
    "@metaplex-foundation/mpl-core": "^0.6.1",
    "@metaplex-foundation/mpl-token-metadata": "^2.13.0",
    "@opensearch-project/opensearch": "^2.5.0",
    "@project-serum/anchor": "^0.26.0",
    "@solana/spl-account-compression": "^0.2.0",
    "@solana/spl-token": "^0.2.0",
    "@solana/web3.js": "^1.87.6",
    "borsh": "^0.7.0",
    "bs58": "^5.0.0",
    "cbor": "^9.0.1",
    "cron": "^3.1.3",
    "formidable": "^1.2.2",
    "md5": "^2.3.0",
    "mysql": "^2.18.1",
    "node-fetch": "^3.3.2",
    "nodemailer": "^6.9.7",
    "socket.io": "^4.7.2",
    "string-strip-html": "^13.4.3",
    "throttle": "^1.0.3",
    "tweetnacl": "^1.0.3"
  }
}
*/

import BN from "bn.js";


import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
    TokenProgramVersion,
    TokenStandard,
    /*createTree as */createCreateTreeInstruction,
    /*mintV1 as */createMintV1Instruction
} from "@metaplex-foundation/mpl-bubblegum"; //0.7.0

import {
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    createAllocTreeIx
} from "@solana/spl-account-compression"; //0.1.10

// import { Keypair, PublicKey } from "@solana/web3.js";

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

    console.log(merkleTreeKeypair.publicKey.toBase58())

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
    // return tx;
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

    // const offchainMetadataUri = metadataUrl;
    // const offchainMetadataUri = "https://arweave.net/blabla";

    const royalty = metadata.royalties;

    let sellerFeeBasisPoints = royalty * 100;
    // sellerFeeBasisPoints = new BN(sellerFeeBasisPoints);

    //Iterate over creator wallets and 
    // find the wallet connected and add it to the array with verified true
    // add all wallets in the wallets array but with verified false



    const creators = creatorWallets.map(item => {
        if (item.address.toBase58() === payer.toBase58()) {
            return { address: item.address, share: item.royalty, verified: true };
        } else {
            return { address: item.address, share: item.royalty, verified: false }
        }
    })


    // console.log('-- payer --')
    // console.log(payer.toBase58())
    // console.log("*****")
    // console.log(creators)
    // console.log("*****")

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

    console.log("-- traits --")
    console.log(traits)

    // metadata.files.file
    // metadata.files.cover

    let main_file = false;
    let cover_file = false;

    if (metadata.files.file) {
        main_file = await irys.bundle(metadata.files.file, false);
    }
    if (metadata.files.cover) {
        cover_file = await irys.bundle(metadata.files.cover, false);
    }

    //const irys_media_url = bundled_metadata_media_file.irys.url;

    console.log("-- media --");
    console.log(metadata.files.file.blob)
    console.log(metadata.files)
    console.log(main_file?.irys?.url);
    console.log(cover_file?.irys?.url);

    // const offchain_metadata = {
    //     name: metadata.name,
    //     description: metadata.description,
    //     seller_fee_basis_points: sellerFeeBasisPoints,
    //     symbol,
    //     properties: {
    //         files: [
    //             { type: "image/png", uri: main_file?.irys?.url },
    //             ...(cover_file ? [{ type: "image/png", uri: cover_file?.irys?.url }] : []) //si se esta poniendo un cover tmb se debe agregar como parte de los archivos del nft
    //         ],
    //         creators
    //     },
    //     //animation_url:"https://arweave.net/asdasd", //animation_url (para cuando es video, 3d, audio, o html)
    //     image: (cover_file || main_file)?.irys?.url,  //image
    //     attributes: traits,
    //     category: "image" //image, video, audio, html, vr (se usa vr para modelos 3D)
    // };

    // const type = checkFileType(main_file);
    // console.log("-- type --");
    // console.log(type);
    const offchain_metadata = {
        name: metadata.name,
        description: metadata.description,
        seller_fee_basis_points: sellerFeeBasisPoints,
        symbol,
        properties: {
            files: [
                { type: checkFileType(main_file), uri: main_file?.irys?.url },
                ...(cover_file ? [{ type: checkFileType(cover_file), uri: cover_file?.irys?.url }] : []) //si se esta poniendo un cover tmb se debe agregar como parte de los archivos del nft
            ],
            creators
        },
        //animation_url:"https://arweave.net/asdasd", //animation_url (para cuando es video, 3d, audio, o html)
        image: (cover_file || main_file)?.irys?.url,  //image
        attributes: traits,
        category: checkFileType(main_file) //image, video, audio, html, vr (se usa vr para modelos 3D)
    };

    // if (["video", "audio", "vr"].includes(checkFileType(cover_file))) {
    //     console.log('audio')
    //     offchain_metadata.animation_url = cover_file?.irys?.url;
    // } else if (checkFileType(main_file) === "image") {
    //     console.log('image')
    //     offchain_metadata.image = main_file?.irys?.url;
    // }

    // console.log('-- offchain metadata --');
    // console.log(offchain_metadata)

    const metadata_file = new Blob([JSON.stringify(offchain_metadata)], { type: "application/json" });


    const bundled_metadata_file = await irys.bundle(metadata_file, true /*aqui es true porque es metadata, para imagenes usar false*/); //Cada archivo que quieres subir a arweave, debe pasar por esta funcion
    const irys_url = bundled_metadata_file.irys.url; //Esto va a tener https://arweave.net/blabla

    // const irys_files = [bundled_metadata_file, metadata_file_url, metadata_cover_url];
    const irys_files = [bundled_metadata_file];

    if (main_file) irys_files.push(main_file);
    if (cover_file) irys_files.push(cover_file);

    const irys_ix = await irys.getFundingInstructions({ files: irys_files }); //Se calcula el costo y se crean las instrucciones
    const irys_registration = await irys.registerFiles({ files: irys_files, uuid }); //Se registran los archivos para subirse

    console.log("SUBIENDO A", irys_url)
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
        leafOwner: payer, //receiver
        leafDelegate: payer, //receiver
        merkleTree: tree,
        payer,
        treeDelegate,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
    }


    const instructions = [];

    const mint_args = { message: onchain };
    instructions.push(createMintV1Instruction(mint_accounts, mint_args))

    // return instructions;

    // const instructions = [];

    const tx = new Transaction();
    tx.add(...irys_ix.instructions, ...instructions);
    console.log("tx", tx);
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = payer;
    tx.partialSign(...signers);
    const signature = await sendTransaction(tx, connection);
    console.log("-- signature --")
    console.log(signature)
    const sent = await connection.confirmTransaction(signature, { commitment: "confirmed" });

    irys.uploadFiles({ uuid, signature, files: irys_files })

}



const createConnection = () => {
    return new Connection("https://radial-restless-asphalt.solana-devnet.quiknode.pro/ee9d638cb93948779161df8f99a04ccf17026c8a/", { commitment: "confirmed", confirmTransactionInitialTimeout: (60 * 2 * 1000) }) //creo que confirmTransactionInitialTimeout ya no se usa
}

const crearNFT = async ({ owner, files, thumbnail }) => {

    const mint = Keypair.generate();

    const creators = [
        { address: "TuWallet", verified: true, share: 50 }, //Solo se pone como verified=true, al creator quien manda la tx
        { address: "OtrasWallet", verified: false, share: 50 }
    ];

    const royalties = 10 * 100;  //Es decir, 1% = 100

    const name = "Name";
    const symbol = "Symbol";
    const uri = "https://arweave.net/blabla";

    const onchain_metadata = {
        name, //32 caracteres
        symbol, //10
        uri, //200 (Aqui va la URL del JSON de la metadata que se guarda en Arweave)
        sellerFeeBasisPoints: new BN(royalties),
        creators: creators.map(creator => ({ address: toPublicKey(creator.address), verified: creator.verified, share: new BN(creator.share) })),
        collection: null,
        uses: null,
        primarySaleHappened: false,
        editionNonce: null,
        isMutable: false,
        tokenProgramVersion: { original: true }, //No se como se tiene que especificar
        tokenStandard: { nonFungible: true }, //No se como se tiene que especificar
    };

    const description = "Description...";

    const mapped_files = [
        { uri: "https://arweave.net/blabla", type: "image/png" }
    ]

    const attributes = [
        { value: "Grande", trait_type: "Tamaño" }
    ]

    const offchain_metadata = {
        name,
        description,
        seller_fee_basis_points: royalties,
        symbol,
        properties: {
            files: mapped_files,
            creators
        },
        attributes,
        category: "image" //image, video, audio, html, vr (se usa vr para modelos)
    };

    const metadata_file = new Blob([JSON.stringify(offchain_metadata)], { type: "application/json" })
    //


    const { instructions } = await createLegacyNFT({ owner, mint, metadata: onchain_metadata });

    const signers = [mint]; //El mint debe firmar la transaccion, si o si



    // const irys = await Irys();
    // signers.push(irys.wallet);

    // //hacer for por cada archivo
    // const bundledFile = await irys.bundle(blob); //Cada archivo que quieres subir a arweave, debe pasar por esta funcion
    // const irysURL = bundledFile.url; //Esto va a tener https://arweave.net/blabla

    // const uuid = uuid4(); //Generate a random identifier
    // const bundledFiles = [bundledFile]; //Todos los archivos se ponen un un arreglo

    // const irysIX = await irys.getFundingInstructions({ files: bundledFiles }); //Se calcula el costo y se crean las instrucciones
    // const irysRegistration = await irys.registerFiles({ files: bundledFiles, uuid }); //Se registran los archivos para subirse

    // instructions.push(...irysIX.instructions);

    // const transaction = new Transaction();
    // transaction.add(...instructions);

    // transaction.partialSign(...signers); //firmar con Irys y MintKeypair


    //Enviar la transaccion con la libreria de wallet adapter

}

export const TOKEN_PROGRAM_ID = toPublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = toPublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
export const TOKEN_METADATA_PROGRAM_ID = toPublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

//Se obtiene el account del mint para el owner
//Associated Token Account
export const getATAPDA = async ({ owner, mint }) => {
    const [publicKey] = await PublicKey.findProgramAddress(
        [
            toPublicKey(owner).toBuffer(), //owner
            TOKEN_PROGRAM_ID.toBuffer(), //String
            toPublicKey(mint).toBuffer()
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    return publicKey;
}

export const getMetadataPDA = async (mint) => {
    const [publicKey] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        toPublicKey(mint).toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
}

export const createLegacyNFT = async ({ owner, mint, metadata }) => {

    const connection = createConnection();
    owner = toPublicKey(owner);
    const payer = owner;
    const updateAuthority = owner;
    mint = mint || Keypair.generate();
    const instructions = [];

    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span); //Se revisa cual es el minimum rent
    instructions.push(SystemProgram.createAccount({ fromPubkey: payer, newAccountPubkey: mint.publicKey, lamports: mintRent, space: MintLayout.span, programId: TOKEN_PROGRAM_ID })); //Aqui se crea la cuenta del NFT

    const freezeAuthority = owner;

    //Aqui si inicializa el mint
    instructions.push(
        createInitializeMintInstruction(
            mint.publicKey, //mint
            0, //decimals
            owner, //mintAuthority
            freezeAuthority, //freezeAuthority
            TOKEN_PROGRAM_ID)
    );

    //Aqui se crea el ATA relacionadl al mint con el usuario
    const ownerATA = await getATAPDA({ owner, mint: mint.publicKey });
    instructions.push(
        createAssociatedTokenAccountInstruction(
            payer,
            ownerATA, //associatedTokenAddress
            owner, //walletAddress
            mint.publicKey)
    );

    const metadataAccount = await getMetadataPDA(mint.publicKey);

    const create_accounts = {
        metadata: metadataAccount,
        mint: mint.publicKey,
        mintAuthority: payer,
        payer: payer,
        updateAuthority,
    }

    const create_args = {
        createMetadataAccountArgsV3: {
            data: metadata,
            isMutable: mutable === false ? false : true,
            collectionDetails
        }
    }

    instructions.push(createCreateMetadataAccountV3Instruction(create_accounts, create_args));
    instructions.push(createMintToInstruction(mint.publicKey, ownerATA, owner /*authority*/, 1, []));

    const supplies = { maxSupply: (supply || supply === 0) ? new BN(supply) : null };
    const editionAccount = await getEditionPDA(mint.publicKey);
    const accounts = {
        edition: editionAccount,
        mint: mint.publicKey,
        updateAuthority,
        mintAuthority: owner,
        payer,
        metadata: metadataAccount
    };
    const args = { createMasterEditionArgs: { ...supplies } };
    instructions.push(createCreateMasterEditionV3Instruction(accounts, args));

    return { instructions, mint };

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