// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Review from './Review.vue'

import ButtonBox from "./components/ButtonBox.element.vue";
import InputBox from "./components/InputBox.element.vue";
import FileUploader from "./components/FileUploader.element.vue";
import Toggle from "./components/Toggle.element.vue";
import { TresCanvas } from '@tresjs/core';
import { OrbitControls, GLTFModel } from '@tresjs/cientos';

const app = createApp(App)

const routes = [
    {
        path: '/review',
        name: 'Review',
        component: Review,
        props: (route) => ({ data: route.query.data })
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

app
    
    .component('ButtonBox', ButtonBox)
    .component('InputBox', InputBox)
    .component('Toggle', Toggle)
    .component('FileUploader', FileUploader)
    .component('TresCanvas', TresCanvas)
    .component('OrbitControls', OrbitControls)
    .component('GLTFModel', GLTFModel);

app.use(router).mount('#app');
