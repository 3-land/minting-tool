<template>
  <header style="text-align: center">
    <span style="font-size: 40px">Review</span>
    <span style="font-size: 14px"
      >Review and approve the details of your NFT</span
    >
  </header>
  <body>
    <div class="file-container" style="padding-top: 0px">
      <div
        style="
          border: 1px dashed rgb(30, 30, 30, 0.5);
          border-radius: 4px;
          width: 100%;
          height: 324px;
          max-height: 344px;
          align-items: center;
          display: flex;
          justify-content: center;
        "
        :style="{
          width: getType == 'audio' || getType == 'video' ? 'fit-content' : '',
          height: fileType == 'audio' ? 'fit-content' : '325px',
        }"
      >
        <img
          v-if="getType == 'image'"
          height="100%"
          width="100%"
          :src="nft_data.file.file.blob"
          style="border-radius: 4px"
        />
        <video
          v-if="getType == 'video'"
          :src="nft_data.file.file.blob"
          style="max-height: 100%; max-width: 100%"
          ref="video"
          controls
        />
        <audio
          v-if="getType == 'audio'"
          :src="nft_data.file.file.blob"
          ref="audio"
          controls
        />
        <TresCanvas v-if="getType == '3d'" clear-color="#82DBC5">
          <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
          <OrbitControls />
          <Suspense>
            <GLTFModel :path="nft_data.file.file.blob" draco />
          </Suspense>
          <TresDirectionalLight
            :position="[-4, 8, 4]"
            :intensity="1.5"
            cast-shadow
          />
        </TresCanvas>
      </div>
      <div
        v-if="getType == 'video' || getType == 'audio'"
        style="
          border: 1px dashed rgb(30, 30, 30, 0.5);
          border-radius: 4px;
          width: 100%;
          display: flex;
          justify-content: center;
        "
      >
        <img
          :src="nft_data.file.cover.blob"
          style="max-width: 100%; max-height: 100%; border-radius: 4px"
        />
      </div>
    </div>

    <div
      style="
        border: 1px solid lightgray;
        width: 100%;
        border-radius: 4px;
        height: fit-content;
      "
    >
      <div class="general-container">
        <div style="display: flex; align-items: center; width: 100%">
          <span style="width: 100%; padding: 24px; color: rgba(30, 30, 30, 0.5)"
            >Details</span
          >
          <ButtonBox
            color="transparent"
            label="Edit"
            style="color: black"
            @click="edit"
          />
        </div>
        <span style="width: 100%; padding-left: 24px; font-size: 20px">{{
          nft_data.name
        }}</span>
        <span style="padding: 24px">{{ nft_data.description }}</span>
      </div>
      <div
        style="border-top: 1px solid lightgray; width: 100%; padding-top: 24px"
      >
        <div style="display: flex; align-items: center; width: 100%">
          <span style="padding: 24px; color: rgba(30, 30, 30, 0.5); width: 100%"
            >Traits</span
          >
          <ButtonBox
            color="transparent"
            label="Edit"
            style="color: black"
            @click="edit"
          />
        </div>
        <div style="display: flex; flex-wrap: wrap">
          <div
            style="padding: 24px"
            v-for="(item, index) in nft_data.traits"
            v-if="nft_data.traits.length > 0"
          >
            <div
              style="
                color: rgb(30, 30, 30, 0.5);
                border: 1px solid black;
                padding: 4px 12px;
                border-radius: 4px;
                margin-right: 8px;
                width: fit-content;
                text-align: center;
              "
            >
              <span style="width: 100%; display: block; color: black">{{
                item.value
              }}</span>

              {{ item.name }}
            </div>
          </div>
          <div v-if="nft_data.traits.length == 0">
            <span
              style="
                padding-left: 24px;
                color: rgba(30, 30, 30, 0.5);
                font-size: 14px;
              "
              >No traits...</span
            >
          </div>
        </div>
      </div>
      <div
        style="border-top: 1px solid lightgray; width: 100%; padding-top: 24px"
      >
        <span style="padding: 24px; color: rgba(30, 30, 30, 0.5)"
          >Collaboration</span
        >
        <div style="padding: 24px" v-for="(item, index) in nft_data.wallets">
          <span
            style="
              background-color: black;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              margin-right: 8px;
            "
            >{{ item.royalty }}%</span
          >
          <span>{{
            String(item.address).slice(0, String(item.address).length / 2) +
            "..."
          }}</span>
        </div>
      </div>
    </div>
  </body>
  <div class="footer-container">
    <ButtonBox
      class="next-button-container"
      label="Next"
      @click="mintAsset()"
    />
  </div>
  <!-- <div v-if="showPopUp" class="popup-main-container">
    <PopUp
      title="This is the title"
      content="This is the very important content that gives context"
      button_msg="Procced"
      @action="proceed"
    />
  </div> -->
  <div v-if="loading" class="loader-container">
    <div class="loader"></div>
    <div style="color: white; font-size: 24px; font-weight: bolder">
      {{ process_msg }}
    </div>
  </div>
</template>
<script>
import { OrbitControls } from "@tresjs/cientos";
import { useWallet } from "solana-wallets-vue";
import {
  createTree,
  compressNFT,
  createConnection,
} from "../../library/src/mint";
import { devnet_tree } from "../../config";
import { getCNFtId } from "../../library/src/getcNftId";

export default {
  mixins: [],
  emit: ["mint"],

  data() {
    return {
      data: this.nft_data,
      showPopUp: false,
      loading: false,
      process_msg: null,
    };
  },
  props: {
    nft_data: {
      default: null,
    },
  },
  computed: {
    getType() {
      const type = this.checkFileType(this.data.file.file);
      return type;
    },
  },
  methods: {
    edit() {
      this.$emit("edit");
    },
    checkFileType(file) {
      return file.type.includes("image")
        ? "image"
        : file.type.includes("audio")
        ? "audio"
        : file.type.includes("video")
        ? "video"
        : file.name.includes(".glb")
        ? "3d"
        : null;
    },
    getLocalConfig() {
      let localConfig = localStorage.getItem("config");
      if (localConfig) {
        return JSON.parse(localConfig);
      }
    },
    async mintAsset() {
      const local_data = this.getLocalConfig();
      const rpc = local_data?.solana_rpc;
      const connection = createConnection(rpc);

      this.loading = true;
      this.process_msg = "Preparing Files...";
      await this.sleep(500);

      this.process_msg = "Reading the blockchain...";
      await this.sleep(1000);

      this.process_msg = "Waiting for Signature...";
      await this.sleep(500);

      const { publicKey, sendTransaction } = useWallet();
      const payer = publicKey.value;
      const tree = devnet_tree;
      const creators = this.nft_data.wallets;

      const options = {
        arweave_rpc: local_data?.arweave_rpc,
        rpc: local_data?.solana_rpc,
      };

      const meta_data = {
        name: this.nft_data.name,
        description: this.nft_data.description,
        traits: this.nft_data.traits,
        royalties: this.nft_data.royalties,
        files: this.nft_data.file,
      };
      /* Commented code is for creating a new merkle tree */
      // const new_tree = await createTree({
      //   payer: payer,
      //   options: options,
      // });

      // console.log(new_tree);

      // const tree_signature = await sendTransaction(new_tree.tx, connection);
      // console.log(tree_signature);
      // let tree_sent = await connection.confirmTransaction(tree_signature, {
      //   commitment: "confirmed",
      // });

      // console.log(tree_sent);
      let compressed;

      try {
        compressed = await compressNFT({
          payer: payer,
          tree: local_data?.tree ? local_data?.tree : tree,
          treeDelegate: payer,
          metadata: meta_data,
          creatorWallets: creators,
          options: options,
        });
      } catch (error) {
        alert(error);
        alert(
          "Looks like you are rate limited by the default Solana RPC, try using a custom RPC, get one at helius.xyz ."
        );
        location.reload();
      }

      const signature = await sendTransaction(compressed.tx, connection);

      const sent = await connection.confirmTransaction(signature, {
        commitment: "confirmed",
      });

      const cnft_id = await getCNFtId(signature, connection);
      if (cnft_id.length < 1) {
        alert(
          "There was a problem, check your configuration (RPCs and Merkle Tree)."
        );
        location.reload();
      }

      // console.log(cnft_id.toLocaleString());

      this.process_msg = "Confirming Transaction...";
      await this.sleep(500);

      compressed.upload(signature);

      this.process_msg = "Minting your NFT...";
      await this.sleep(500);

      this.$emit("mint", { asset: this.data, cnft: cnft_id.toString() });
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async proceed() {
      this.showPopUp = false;
      this.loading = true;
      await this.sleep(5000);
      this.$emit("mint", this.data);
    },
  },
};
</script>

<style scoped>
img {
  object-fit: contain;
  object-position: center;
}
body {
  margin: 32px;
  display: flex;
  justify-content: center;

  --gap: 24px;
  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}

.general-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  border-radius: 4px;
}
.footer-container {
  margin-top: 24px;
  border-top: 1px solid lightgray;
  width: auto;
  padding: 24px;
}
.popup-main-container {
  background: rgb(30, 30, 30, 0.5);
  width: 100dvw;
  height: 100dvh;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: 0px;
  position: fixed;
  display: flex;
  justify-content: center;
}
.loader-container {
  gap: 25px;
  height: 100dvh;
  display: flex;
  background-color: rgb(30, 30, 30, 0.5);
  backdrop-filter: blur(5px);
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: 0px;
  width: 100dvw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loader {
  width: calc(100px - 24px);
  height: 50px;

  position: relative;
  animation: flippx 2s infinite linear;
}
.loader:before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transform-origin: -24px 50%;
  animation: spin 1s infinite linear;
}
.loader:after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

@keyframes flippx {
  0%,
  49% {
    transform: scaleX(1);
  }
  50%,
  100% {
    transform: scaleX(-1);
  }
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@media (min-width: 769px) {
  body {
    flex-wrap: nowrap;
  }
  .main-button-container {
    width: 200px;
  }
  .footer-container {
    display: flex;
    justify-content: flex-end;
  }
  .file-container {
    padding-left: 0px;
  }
}
</style>
