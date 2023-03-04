import { createApp } from 'vue'
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
    Setting,
    Collection,
    Refresh,
    CoffeeCup
} from '@element-plus/icons'

const app = createApp(App)

app.component('IconPlus', Plus)
app.component('IconCrop', Crop)
app.component('IconCompass', Compass)
app.component('IconNotification', Notification)
app.component('IconPromotion', Promotion)
app.component('IconPicture', Picture)
app.component('IconChatDotSquare', ChatDotSquare)
app.component('IconDelete', Delete)
app.component('IconUpload', Upload)
app.component('IconDownload', Download)
app.component('IconBack', Back)
app.component('IconRight', Right)
app.component('IconArrowUp', ArrowUp)
app.component('IconOperation', Operation)
app.component('IconEdit', Edit)
app.component('IconClose', Close)
app.component('IconSetting', Setting)
app.component('IconCollection', Collection)
app.component('IconRefresh', Refresh)
app.component('IconCoffeeCup', CoffeeCup)

app.provide('avatarsJs', 'avatar.js?v=78319d24')

app.mount('#app')
