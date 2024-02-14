<script setup>
import { ref, watch } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { DataControl } from '@/lib/data/data'
import CollapseItem from '@/components/CollapseItem'
import { mobileView } from '@/editor/Default/lib/width'
import { IsMobile } from '@/lib/data/constance'
import { defaultShow } from '@/editor/Default/lib/showControl'
import { mainShow } from '@/lib/data/showControl'
import ClearDialog from '@/components/ClearDialog.vue'

defineEmits(['showNavigation'])

const sidebarContainerStyle = ref(mobileView.value ? 'fixed' : 'relative')

watch(mobileView, () => {
    if (mobileView.value) {
        if (defaultShow.sidebar.value) {
            defaultShow.sidebar.value = false
            if (IsMobile) {
                // 区分手机(转动)/PC(窗口缩放)
                sidebarContainerStyle.value = 'fixed'
            } else {
                setTimeout(() => {
                    if (mobileView.value) {
                        // 防止中途mobileView值改变
                        sidebarContainerStyle.value = 'fixed'
                    }
                }, 500)
            }
        } else {
            sidebarContainerStyle.value = 'fixed'
        }
    } else {
        if (!defaultShow.sidebar.value) {
            defaultShow.sidebar.value = true
        }
        sidebarContainerStyle.value = 'relative'
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

function openOtherDialog (show) {
    show.value = true
    if (mobileView.value && defaultShow.sidebar.value) {
        defaultShow.sidebar.value = false
    }
}

</script>

<template>
    <CollapseItem row>
        <div v-show="defaultShow.sidebar.value" class="drawer-container" id="sidebar-container" :style="{position: sidebarContainerStyle}">
            <div class="drawer" id="sidebar">
                <el-scrollbar>
                    <div class="bar" @click="openOtherDialog(mainShow.screenshotHelper)">
                        <el-icon color="lightgrey" :size="35">
                            <IconCrop/>
                        </el-icon>
                        {{ t.action.screenshot }}
                    </div>
                    <div class="bar" @click="openOtherDialog(mainShow.announcement)">
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
                    <ClearDialog v-model="ifShowClear"/>
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
                    <div class="bar" @click="$emit('showNavigation');openOtherDialog({})">
                        <el-icon color="lightgrey" :size="35">
                            <IconCompass/>
                        </el-icon>
                        {{ t.action.goto }}
                    </div>
                    <div class="bar" @click="openOtherDialog(mainShow.settings)">
                        <el-icon color="lightgrey" :size="35">
                            <IconSetting/>
                        </el-icon>
                        {{ t.noun.settings }}
                    </div>
                    <div class="bar" @click="openOtherDialog(mainShow.about)">
                        <el-icon color="lightgrey" :size="35">
                            <IconCoffeeCup/>
                        </el-icon>
                        {{ t.noun.about }}
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </CollapseItem>
    <Transition name="fade">
        <div v-if="defaultShow.sidebar.value && mobileView" @click="defaultShow.sidebar.value=false" class="drawer-mask"></div>
    </Transition>
    <div id="sidebar-placeholder" class="drawer-placeholder">
        <!--sidebar占位符，用于在sidebar隐藏时计算sidebar width-->
        <div class="bar">
            <el-icon :size="35">
                <IconCoffeeCup/>
            </el-icon>
            <div>
                <p v-for="key in ['screenshot','empty', 'withdraw','redo','goto']" :key="key"> {{
                        t.action[key]
                    }}</p>
                <p v-for="key in ['announcement','guide','settings','about']" :key="key"> {{ t.noun[key] }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.drawer-container {
    flex-shrink: 0;
    right: 0;
    z-index: 404;
    height: 100%;
    transition: all ease 0.6s;
}

.drawer-placeholder {
    position: absolute;
    right: -100%;
    display: flex;
    padding: 2px 5px;
    min-width: 80px;
}

.drawer-placeholder p {
    margin: 0;
}

.drawer-placeholder .bar {
    display: flex;
}

.drawer {
    flex-shrink: 0;
    padding: 2px 5px;
    width: max-content;
    min-width: 80px;
    height: 100%;
    background: #606060;
    border-left: grey solid 1px;
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
</style>
