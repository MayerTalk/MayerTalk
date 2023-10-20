<script setup>
import { computed, ref } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/message'
import { DataControl } from '@/lib/data'
import { dialogWidth, MobileView } from '@/lib/constance'

const props = defineProps(['modelValue'])
const emit = defineEmits([
    'showAnnounce',
    'showSettings',
    'showAbout',
    'showNavigation',
    'screenshot',
    'update:modelValue'
])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

function toGuide () {
    location.href = '/docs/guide/start.html'
}

const ifShowClear = ref(false)

function clearChats () {
    message.confirm(
        t.value.notify.aboutToClearAllChats,
        t.value.noun.hint,
        () => {
            DataControl.clear(0)
            DataControl.curr.setDialogue(0)
            ifShowClear.value = false
        }
    )
}

function clearAll () {
    message.confirm(
        t.value.notify.aboutToClearAllCharactersAndChats,
        t.value.noun.hint,
        () => {
            DataControl.clear(1)
            DataControl.curr.setChar('', true)
            DataControl.curr.setDialogue(0)
            ifShowClear.value = false
        }
    )
}
</script>

<template>
    <div class="drawer" :class="ifShow?'show':''">
        <div class="bar" @click="$emit('screenshot')">
            <el-icon color="lightgrey" :size="35">
                <IconCrop/>
            </el-icon>
            {{ t.action.screenshot }}
        </div>
        <div class="bar" @click="$emit('showAnnounce')">
            <el-icon color="lightgrey" :size="35">
                <IconNotification/>
            </el-icon>
            {{ t.noun.announcement }}
        </div>
        <div class="bar" @click="toGuide">
            <el-icon :size="35">
                <IconNotebook/>
            </el-icon>
            {{ t.noun.guide }}
        </div>
        <div class="bar" @click="ifShowClear=true">
            <el-icon color="lightgrey" :size="35">
                <IconDelete/>
            </el-icon>
            {{ t.action.empty }}
        </div>
        <el-dialog v-model="ifShowClear" :title="t.notify.pleaseSelectTheTypeToClear" :width="dialogWidth">
            <div style="display: flex; column-gap: 5px">
                <el-button size="large" style="width: 100%;" @click="clearChats">{{ t.noun.chat }}</el-button>
                <el-button size="large" style="width:100%; margin: 0" @click="clearAll">{{ t.noun.all }}</el-button>
            </div>
        </el-dialog>
        <div class="bar" @click="DataControl.withdraw">
            <el-icon color="lightgrey" :size="35">
                <IconBack/>
            </el-icon>
            {{ t.action.withdraw }}
        </div>
        <div class="bar" @click="DataControl.redo">
            <el-icon color="lightgrey" :size="35">
                <IconRight/>
            </el-icon>
            {{ t.action.redo }}
        </div>
        <div class="bar" @click="$emit('showNavigation')">
            <el-icon color="lightgrey" :size="35">
                <IconCompass/>
            </el-icon>
            {{ t.action.goto }}
        </div>
        <div class="bar" @click="$emit('showSettings')">
            <el-icon color="lightgrey" :size="35">
                <IconSetting/>
            </el-icon>
            {{ t.noun.settings }}
        </div>
        <div class="bar" @click="$emit('showAbout')">
            <el-icon color="lightgrey" :size="35">
                <IconCoffeeCup/>
            </el-icon>
            {{ t.noun.about }}
        </div>
    </div>
    <Transition name="fade">
        <div v-if="ifShow && MobileView" @click="ifShow=false" class="drawer-mask"></div>
    </Transition>
</template>

<style scoped>
.drawer {
    width: 80px;
    height: 100%;
    position: fixed;
    right: -100px;
    background: #606060;
    border-left: grey solid 1px;
    transition: right ease 0.5s;
    z-index: 404;
    padding: 5px;
    user-select: none;
}

.drawer.show {
    right: 0;
}

.drawer .bar {
    height: 50px;
    border-bottom: grey solid 1px;
    margin: 2px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: lightgrey;
}

.drawer .bar:hover {
    color: lightblue;
}

.drawer .bar svg {
    margin-right: 5px;
}

.drawer-mask {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background: black;
    z-index: 100;
    opacity: 0.5;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
