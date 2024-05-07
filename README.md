# Solana Open Source cNFTs Minting Tool

## Description

Open Source tool for minting compressed NFTs on Solana.

## UI Features
- Images, Videos, audios and 3D files supported
- Configuration panel for managing RPCs
- One single transaction to create the cNFT and upload the assets to Arweave

## Running the UI
1. Clone the repository ```git clone https://github.com/3-land/minting-tool.git ```
2. Navigate to the repository ``` cd cloned-repo ```
3. Install dependencies ``` npm install ```
4. Run the project ``` npm run dev ```

## SDK
> NPM - https://www.npmjs.com/package/@3land/minting

## SDK Features
- Mint cNFT
- Merkle Tree Creation

## SDK Methods
#### createTree()
**Description**
This asynchronous function creates a new merkle tree on the blockchain.

**Parameters**
- `payer`: A string or PublicKey representing the payer's public key.
- `public_tree`: A boolean indicating whether the tree is public. Defaults to `true`.
- `options`: An object containing the following properties:
  - `rpc`: A string representing the RPC endpoint of the blockchain.

**Returns**
An object containing the transaction (`tx`) that creates the tree.

**Details**
The function performs the following steps:
1. Converts the `payer` to a PublicKey.
2. Creates a connection to the blockchain using the provided RPC endpoint.
3. Generates a new keypair for the Merkle tree.
4. Prepares the parameters for creating the tree, including the maximum depth and buffer size.
5. Creates an instruction (`allocTreeIx`) to allocate space for the tree on the blockchain.
6. Finds the program address for the tree authority.
7. Prepares the accounts and arguments for the `createTreeIx` instruction.
8. Creates the `createTreeIx` instruction.
9. Adds the instructions to a new transaction.
10. Signs the transaction with the signers.
11. Returns the transaction.

**Example**
```javascript
const payer = "B3tZ7ZiMoVJGVTsW6zWjKW6EvGjqJMgDZLzQZjNZED8e";
const public_tree = true;
const options = { rpc: "https://api.mainnet-beta.solana.com" };
const result = await createTree({ payer, public_tree, options });
console.log(result.tx);
```

#### compressNFT()
**Description**
This asynchronous function compresses an NFT by creating a transaction that includes the NFT's metadata and other related information.

**Parameters**
- `payer`: A string or PublicKey representing the payer's public key.
- `tree`: A string or PublicKey representing the tree's public key.
- `treeDelegate`: A string or PublicKey representing the tree delegate's public key. If not provided, it defaults to the payer's public key.
- `metadata`: An object containing the metadata of the NFT.
- `creatorWallets`: An array of objects, each representing a creator's wallet.
- `options`: An object containing the following properties:
  - `rpc`: A string representing the RPC endpoint of the blockchain.

**Returns**
An object containing the transaction (`tx`) that compresses the NFT and an `upload` function that uploads the files associated with the NFT.

**Details**
The function performs the following steps:
1. Converts the `payer`, `tree`, and `treeDelegate` to PublicKey.
2. Creates a connection to the blockchain using the provided RPC endpoint.
3. Prepares the creators, traits, and files for the NFT.
4. Bundles the metadata file and any main or cover files.
5. Gets the funding instructions and registers the files with Irys.
6. Prepares the on-chain metadata and mint accounts.
7. Creates the mint instruction and adds it to a new transaction.
8. Signs the transaction with the signers.
9. Returns the transaction and the upload function.

**Example**
```javascript
const payer = "B3tZ7ZiMoVJGVTsW6zWjKW6EvGjqJMgDZLzQZjNZED8e";
const tree = "B3tZ7ZiMoVJGVTsW6zWjKW6EvGjqJMgDZLzQZjNZED8e";
const treeDelegate = "B3tZ7ZiMoVJGVTsW6zWjKW6EvGjqJMgDZLzQZjNZED8e";
const metadata = { ... };
const creatorWallets = [ ... ];
const options = { rpc: "https://api.mainnet-beta.solana.com" };
const result = await compressNFT({ payer, tree, treeDelegate, metadata, creatorWallets, options });
console.log(result.tx);
```
#### getCNFtId()
**Description**
This asynchronous function retrieves the IDs of assets associated with a given transaction signature.

**Parameters**
- `signature`: A string representing the transaction signature.
- `connection`: An object representing the connection to the blockchain.

**Returns**
An array of asset IDs associated with the given transaction signature.

**Details**
The function performs the following steps:
1. Retrieves the transaction information associated with the given signature.
2. Retrieves all change log events from the transaction.
3. For each change log event, it retrieves the index and tree ID.
4. It then retrieves the asset associated with the index and tree ID and adds it to the `ids` array.
5. Finally, it returns the `ids` array.

**Example**
```javascript
const signature = "5JPy8Zg7z4P7UjZj9Dq6xkTy3VRmogqAqDjJjwBzCqTk";
const connection = new Connection("https://api.mainnet-beta.solana.com");
const ids = await getCNFtId(signature, connection);
console.log(ids);
```


## Contributing
First off, thank you for considering contributing to this project! It's people like you that make the open source community such a fantastic place to learn, inspire, and create. Every contribution helps and is greatly appreciated.

### How to Contribute

1. **Fork** the project repository: Click on the 'Fork' button at the top right of this page. This will create a copy of the repository in your GitHub account.

2. **Clone** the forked repository to your local machine
3. **Create a new branch** - ```git checkout -b [branch-name]``` 
4. **Make changes in the source code**
5. **Commit the changes** - ```git commit -m "[commit message]"```
6. **Push the changes** - ```git push origin [branch-name]"```
7. **Submit a pull request** - Go to the GitHub page of your forked repository and click on ‘Pull request’. Click the ‘New pull request’ button and select the branch that contains your changes. Click ‘Create pull request’ to submit the pull request.
## License

This project is licensed under the MIT License. See the LICENSE file for details.
