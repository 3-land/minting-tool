import { createApp } from 'vue'
import App from './App.vue'

import ButtonBox from "./components/ButtonBox.element.vue";
import InputBox from "./components/InputBox.element.vue";
import FileUploader from "./components/FileUploader.element.vue";
import Toggle from "./components/Toggle.element.vue";
import GeneralSettings from "./components/GeneralSettings.element.vue";
import Review from "./components/Review.element.vue";
import Congratulations from "./components/Congratulations.element.vue";
import PopUp from "./components/PopUp.element.vue";

import { WalletMultiButton } from "solana-wallets-vue";

import { TresCanvas } from '@tresjs/core';
import { OrbitControls, GLTFModel } from '@tresjs/cientos';

import SolanaWallets from "solana-wallets-vue";
import "solana-wallets-vue/styles.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
    PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
    wallets: [
        new PhantomWalletAdapter(),
    ],
    autoConnect: true,
};

const app = createApp(App)
app

    .component('ButtonBox', ButtonBox)
    .component('InputBox', InputBox)
    .component('Toggle', Toggle)
    .component('FileUploader', FileUploader)
    .component('GeneralSettings', GeneralSettings)
    .component('Review', Review)
    .component('Congratulations', Congratulations)
    .component('PopUp', PopUp)
    .component('WalletMultiButton', WalletMultiButton)
    .component('TresCanvas', TresCanvas)
    .component('OrbitControls', OrbitControls)
    .component('GLTFModel', GLTFModel);

app.use(SolanaWallets, walletOptions).mount('#app');