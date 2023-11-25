<script setup>
import { computed, ref, nextTick } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/message'
import { DataControl } from '@/lib/data'
import { dialogWidth, defaultWindowWidth } from '@/lib/constance'
import { doAfter } from '@/lib/tool'

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

let sidebarNode = null
const sidebarWidth = ref(0)
const initialized = ref(false)

function getSidebarWidth () {
    // +1 border
    return sidebarNode.scrollWidth + 1 || 80
}

const mobileView = computed(() => {
    return window.innerWidth - defaultWindowWidth - sidebarWidth.value < 0
})

ifShow.value = !mobileView.value

doAfter(() => {
    return document.getElementById('sidebar') && document.getElementById('sidebar.placeholder')
}, () => {
    sidebarNode = document.getElementById('sidebar')
    const placeholder = document.getElementById('sidebar.placeholder')
    // placeholder width为0时 移出流
    placeholder.style.position = 'absolute'
    // 同步width
    sidebarWidth.value = getSidebarWidth()
    nextTick(() => {
        // 二次同步 ifShow (防止第一次sidebarWidth预估错)
        ifShow.value = !mobileView.value
        // 初始style设置完毕后设置transition，防止设途中出现动画
        sidebarNode.style.transition = 'right ease 0.6s'
        // 将sidebar移出流
        sidebarNode.style.position = 'fixed'
        // 将placeholder添加进流，替代sidebar
        placeholder.style.position = 'relative'
        doAfter(() => {
            // 知道placeholder width与sidebarWidth相同或不显示sidebar，transition
            return placeholder.scrollWidth === sidebarWidth.value || !ifShow.value
        }, () => {
            placeholder.style.transition = 'width ease 0.6s'
            // 设置同步完成 (placeholder)
            initialized.value = true
        })
    })
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

defineExpose({
    sidebarWidth
})
</script>

<template>
    <div id="sidebar.placeholder" :style="{width:(ifShow && !mobileView?sidebarWidth+'px':'0')}" style="flex-shrink: 0">
        <!--sidebar placeholder-->
    </div>
    <div class="drawer" id="sidebar"
         :style="{right:(ifShow?'0':(-sidebarWidth || -1000) + 'px'), position:(initialized?'fixed':(mobileView?'fixed':'relative'))}">
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
        <div v-if="ifShow && mobileView" @click="ifShow=false" class="drawer-mask"></div>
    </Transition>
</template>

<style scoped>
.drawer {
    min-width: 80px;
    height: 100%;
    background: #606060;
    border-left: grey solid 1px;
    z-index: 404;
    padding: 0 5px;
    user-select: none;
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
    transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
