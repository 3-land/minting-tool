<template>
  <div style="display: flex; flex-direction: column; align-items: center">
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        text-align: center;
        margin-top: 45px;
      "
    >
      <span style="width: 100%; font-size: 24px">Congratulations your</span>
      <span style="width: 100%; font-size: 60px">Collectible</span>
      <span style="width: 100%; font-size: 24px">has been created!</span>
    </div>

    <div
      style="
        display: flex;
        justify-content: center;
        margin-top: 35px;
        max-width: 390px;
        flex-direction: column;
        gap: 24px;
      "
    >
      <div style="display: flex; width: 100%; justify-content: space-evenly">
        <ButtonBox
          label="See Transaction"
          style="padding: 8px 16px; width: auto"
          @click="explore('tx', data.file.data.transaction)"
        />
        <ButtonBox
          style="padding: 8px 16px; width: auto"
          label="See cNFT"
          @click="explore('token', cnft)"
        />
      </div>
      <div
        style="
          background-color: white;
          padding: 8px;
          border-radius: 16px;
          box-shadow: 0px 4px 8.6px 0px rgba(0, 0, 0, 0.15);
          display: flex;
          justify-content: center;
        "
      >
        <img
          v-if="getType == 'image'"
          style="
            background-color: transparent;
            width: 100%;
            height: 100%;
            border-radius: 16px;
          "
          :src="data.file.blob"
        />
        <video
          v-if="getType == 'video'"
          :src="data.file.blob"
          style="max-height: 100%; max-width: 100%"
          ref="video"
          controls
        />
        <audio
          v-if="getType == 'audio'"
          :src="data.file.blob"
          ref="audio"
          controls
        />
        <TresCanvas
          v-if="getType == '3d'"
          clear-color="#82DBC5"
          style="width: 300px; height: 300px"
        >
          <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
          <OrbitControls />
          <Suspense>
            <GLTFModel :path="data.file.blob" draco />
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
          background-color: white;
          padding: 8px;
          border-radius: 16px;
          box-shadow: 0px 4px 8.6px 0px rgba(0, 0, 0, 0.15);
          display: flex;
          justify-content: center;
        "
      >
        <img
          :src="data.cover.blob"
          style="max-width: 100%; max-height: 100%; border-radius: 4px"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { config } from "../../config";
// import { getCNFtId } from "../../library/src/getcNftId";
export default {
  mixins: [],
  data() {
    return { data: this.file };
  },
  props: {
    file: {
      default: null,
    },
    cnft: {
      default: null,
    },
  },
  computed: {
    getType() {
      const type = this.checkFileType(this.data.file);
      return type;
    },
  },
  methods: {
    explore(type, data) {
      let localConfig = localStorage.getItem("config");
      localConfig = JSON.parse(localConfig);

      console.log(localConfig);

      const netw =
        localConfig.network == "Custom"
          ? localConfig.solana_rpc.includes("devnet")
            ? "devnet"
            : "mainnet"
          : localConfig.network;
      console.log("newt", netw);
      if (type == "token") {
        window.open(
          `https://solscan.io/${type}/${data}?cluster=${netw.toLocaleLowerCase()}`,
          "_blank"
        );
      } else if (type == "tx") {
        window.open(
          `https://xray.helius.xyz/${type}/${data}?network=${netw.toLocaleLowerCase()}`,
          "_blank"
        );
      }
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
  },
};
</script>
<style scoped>
img {
  object-fit: contain;
  object-position: center;
}
</style>
