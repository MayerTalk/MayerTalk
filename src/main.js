// localStorage.clear()

import {createApp} from 'vue'
import App from './App.vue'

import {
    Plus,
    Crop,
    Compass,
    Notification,
    Promotion,
    Picture,
    ChatDotSquare,
    Delete,
    Upload,
    Download,
    Back,
    Right,
    ArrowUp,
    Operation,
    Edit,
    Close,
    Setting
} from "@element-plus/icons";

const app = createApp(App);

app.component('Plus', Plus);
app.component('Crop', Crop);
app.component('Compass', Compass);
app.component('Notification', Notification);
app.component('Promotion', Promotion);
app.component('Picture', Picture);
app.component('ChatDotSquare', ChatDotSquare);
app.component('Delete', Delete);
app.component('Upload', Upload);
app.component('Download', Download);
app.component('Back', Back);
app.component('Right', Right);
app.component('ArrowUp', ArrowUp);
app.component('Operation', Operation);
app.component('Edit', Edit);
app.component('Close', Close);
app.component('Setting', Setting);

app.provide('avatarsJs','avatar.js?v=beed41ea');

app.mount('#app');
