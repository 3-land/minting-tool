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
          width:
            getType == 'audio' || getType == 'video' ? 'fit-content' : '100%',
          height: fileType == 'audio' ? 'fit-content' : '',
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
    <span class="loader"></span>
    <span
      style="
        position: absolute;
        top: 30%;
        color: white;
        font-size: 24px;
        font-weight: bolder;
      "
      >{{ process_msg }}</span
    >
  </div>
</template>
<script>
import { OrbitControls } from "@tresjs/cientos";
import { useWallet } from "solana-wallets-vue";
import { createTree, compressNFT } from "@/../library/mint";

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
      console.log(this.data);
      console.log(this.nft_data);
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
    async mintAsset() {
      /* Uploads data to Arweave */
      //TODO
      this.process_msg = "Uploading your assets to arweave...";
      this.loading = true;
      await this.sleep(5000);
      // const meta_data =
      //   "https://5232s7wjkt2frnyg6hvpsgp3deo4e4vf3tvqkz5hmeyzyw2cvwtq.arweave.net/7repfslU9Fi3BvHq-Rn7GR3CcqXc6wVnp2ExnFtCrac";

      /* Mints the Nft */
      const { publicKey, sendTransaction } = useWallet();
      const payer = publicKey.value;
      //const tree = createTree({ payer: publicKey.value, public_tree: true });
      const tree = "4k7xBH9oZhXn3Y1pvB6bdubTpbRkmg3S8XhfgvLf7NNN";
      const creators = this.nft_data.wallets;

      const meta_data = {
        name: this.nft_data.name,
        description: this.nft_data.description,
        traits: this.nft_data.traits,
        royalties: this.nft_data.royalties,
        files: this.nft_data.file,
      };

      console.log("-- metadata review --");
      console.log(meta_data);

      // console.log(creators);

      const compressed = await compressNFT({
        payer: payer,
        tree: tree,
        treeDelegate: payer,
        metadata: meta_data,
        creatorWallets: creators,
      });

      this.process_msg = "Minting your NFT...";
      await this.sleep(5000);

      this.$emit("mint", this.data);
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
  height: 891px;
  display: flex;
  background-color: rgb(30, 30, 30, 0.5);
  backdrop-filter: blur(5px);
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: 0px;
  width: 100dvw;

  justify-content: center;
  /* align-items: center; */
}
.loader {
  width: calc(100px - 24px);
  height: 50px;
  top: 20%;
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
