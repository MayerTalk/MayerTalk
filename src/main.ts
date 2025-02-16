import './lib/utils/redirectSSL'
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
    ArrowRight,
    Operation,
    Edit,
    Close,
    Setting,
    Collection,
    Refresh,
    CoffeeCup,
    Notebook,
    Top,
    Bottom,
    Connection
} from '@element-plus/icons-vue'

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
app.component('IconArrowRight', ArrowRight)
app.component('IconOperation', Operation)
app.component('IconEdit', Edit)
app.component('IconClose', Close)
app.component('IconSetting', Setting)
app.component('IconCollection', Collection)
app.component('IconRefresh', Refresh)
app.component('IconCoffeeCup', CoffeeCup)
app.component('IconNotebook', Notebook)
app.component('IconTop', Top)
app.component('IconBottom', Bottom)
app.component('IconConnection', Connection)

app.mount('#app')
