<template>
  <div class="file-main-container">
    <div
      class="file-container"
      @click="openFileExplorer(false)"
      @dragover.prevent
      @drop="onDrop($event, false)"
    >
      <div
        class="thumbnail"
        :style="{
          border: error ? '2px dashed red' : '1px dashed rgba(0, 0, 0, 0.2)',
        }"
      >
        <span v-if="fileType == null">Upload Your File</span>
        <img
          v-if="fileType == 'image'"
          :src="fileSrc.blob"
          alt="Uploaded file thumbnail"
        />
        <video
          v-if="fileType == 'video'"
          :src="fileSrc.blob"
          ref="video"
          controls
        />
        <audio
          v-if="fileType == 'audio'"
          :src="fileSrc.blob"
          ref="audio"
          controls
        />
        <TresCanvas v-if="fileType == '3d'" clear-color="#82DBC5">
          <TresPerspectiveCamera :args="[45, 120, 0.1, 1000]" />
          <OrbitControls />
          <Suspense>
            <!-- El problema parece ser que 'path' no esta escuchando el cambio de la variable fileSrc.blob, agregue un v-if para reiniciar por completo el componente, como quickfix -->
            <GLTFModel v-if="!changing" :path="fileSrc.blob" draco />
          </Suspense>
          <TresDirectionalLight
            :position="[-4, 8, 4]"
            :intensity="1.5"
            cast-shadow
          />
        </TresCanvas>
      </div>
      <div v-if="error" style="color: red; display: flex">
        <span class="alert-container" />Missing Field
      </div>
      <input
        type="file"
        ref="fileInput"
        @change="onFileChange($event, false)"
        style="display: none"
      />
    </div>
    <div v-if="fileType == 'video' || fileType == 'audio'" style="width: 100%">
      <span>Cover</span>
      <div
        class="file-container"
        @click="openFileExplorer(true)"
        @dragover.prevent
        @drop="onDrop($event, true)"
      >
        <div
          class="thumbnail"
          :style="{
            border: error_cover
              ? '2px dashed red'
              : '1px dashed rgba(0, 0, 0, 0.2)',
          }"
        >
          <span v-if="!coverFileSrc">Upload the cover</span>
          <img :src="coverFileSrc.blob" />
        </div>
        <div v-if="error_cover" style="color: red; display: flex">
          <span class="alert-container" />Missing Field
        </div>
        <input
          type="file"
          ref="fileCoverInput"
          @change="onFileChange($event, true)"
          style="display: none"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { OrbitControls } from "@tresjs/cientos";

export default {
  data() {
    return {
      changing: false,
      fileSrc: null,
      coverFileSrc: null,
      fileType: null,
    };
  },
  props: {
    value: { default: null },
    error: { default: null },
    error_cover: { default: null },
  },
  watch: {
    fileSrc: {
      handler(x, y) {
        if (x?.blob != y?.blob) {
          this.changing = true;
          setTimeout(() => {
            this.changing = false;
          }, 10);
        }
      },
      deep: true,
    },
  },
  methods: {
    openFileExplorer(cover) {
      if (!cover) {
        this.$refs.fileInput.click();
      }

      if (cover) {
        this.$refs.fileCoverInput.click();
      }
    },
    onFileChange(e, cover) {
      const file = e.target.files[0];
      // console.log(file);
      if (file && !cover) {
        this.checkFileType(file);
        file.blob = URL.createObjectURL(file);
        this.fileSrc = file;
        if (
          this.fileSrc.type.includes("image") ||
          this.fileSrc.name.includes(".glb")
        ) {
          this.coverFileSrc = null;
        } else {
          this.coverFileSrc = "";
        }

        this.$emit("update:value", {
          file: this.fileSrc,
          cover: this.coverFileSrc,
        });
      }
      if (file && cover) {
        file.blob = URL.createObjectURL(file);
        this.coverFileSrc = file;
        this.$emit("update:value", {
          file: this.fileSrc,
          cover: this.coverFileSrc,
        });
      }
    },
    onDrop(e, cover) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && !cover) {
        this.checkFileType(file);
        file.blob = URL.createObjectURL(file);
        this.fileSrc = file;

        if (
          this.fileSrc.type.includes("image") ||
          this.fileSrc.name.includes(".glb")
        ) {
          this.coverFileSrc = null;
        } else {
          this.coverFileSrc = "";
        }

        this.$emit("update:value", {
          file: this.fileSrc,
          cover: this.coverFileSrc,
        });
      }
      if (file && cover) {
        file.blob = URL.createObjectURL(file);
        this.coverFileSrc = file;
        this.$emit("update:value", {
          file: this.fileSrc,
          cover: this.coverFileSrc,
        });
      }
    },
    checkFileType(file) {
      this.fileType = file.type.includes("image")
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

<style>
.file-main-container {
  --gap: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.file-container {
  height: 325px;
  width: 100%;
  padding: 16px 0px 48px;
  cursor: pointer;

  gap: var(--gap);
  display: flex;
  flex-wrap: wrap;
}
.thumbnail {
  border-radius: 16px;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}
.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.thumbnail video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}
</style>
