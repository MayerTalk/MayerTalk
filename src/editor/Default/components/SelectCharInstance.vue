<script setup>
import { ref, watch, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { StaticUrl, IsMobile } from '@/lib/data/constance'
import { SearchManager, CharDict, Suffix } from '@/lib/data/character'
import { doAfterRefMounted } from '@/lib/utils/tool'
import { dialogWidth } from '@/lib/data/width'

const { maxHeight } = defineProps({
    maxHeight: {
        type: String,
        default: null
    }
})
const emit = defineEmits(['select'])
const ifShowSubSelect = ref(false)

const search = ref('')
const searchManager = new SearchManager()
const searchResult = searchManager.result
const inputRef = ref(null)
const currSelect = ref([])
const avatarBarRef = ref(null)
const avatarBarFrameWidth = ref('0px')
doAfterRefMounted(avatarBarRef, () => {
    avatarBarFrameWidth.value = Math.floor(avatarBarRef.value.scrollWidth / 4) - 2 + 'px'
})
const avatarBarFrameDialogWidth = computed(() => {
    return Math.floor((dialogWidth.value - 48) / 4) + 'px'
})

const defaultChar = [
    ['avatar/arknights/doctor' + Suffix, t.value.character.doctor],
    ['avatar/arknights/PRTS' + Suffix, 'PRTS'],
    ['avatar/arknights/mon3tr' + Suffix, 'mon3tr'],
    ['avatar/arknights/char_003_kalts' + Suffix, t.value.character.kalts]
]

watch(search, () => {
    searchManager.search(search.value)
})

function autoFocus () {
    if (!IsMobile) {
        doAfterRefMounted(inputRef, (r) => {
            setTimeout(() => {
                r.value.focus()
            }, 0)
        })
    }
}

function handleSelect (char) {
    if (CharDict[char[0]].avatars.length > 1) {
        currSelect.value = char
        ifShowSubSelect.value = true
    } else {
        emit('select', [CharDict[char[0]].avatars[0], char[1]])
    }
}

defineExpose({
    autoFocus,
    search
})
</script>

<template>
    <el-input :placeholder="t.action.selectMoreCharacter" v-model="search" ref="inputRef" clearable></el-input>
    <template v-if="!searchResult || searchResult.length">
        <el-scrollbar :max-height="maxHeight" style="width: 100%">
            <div class="avatar-bar" ref="avatarBarRef">
                <template v-if="!searchResult">
                    <div class="frame" v-for="char in defaultChar" :key="char[1]"
                         :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
                        <img :src="StaticUrl + char[0]" loading="lazy" :title="char[1]"
                             @click="() => {$emit('select',char)}">
                    </div>
                </template>
                <template v-else>
                    <div class="frame" v-for="char in searchResult" :key="char[0]"
                         :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
                        <img :src="StaticUrl + CharDict[char[0]].avatars[0]" loading="lazy" :title="char[1]"
                             @click="handleSelect(char)">
                        <div class="subscript" v-if="CharDict[char[0]].avatars.length > 1">
                            {{ CharDict[char[0]].avatars.length - 1 }}+
                        </div>
                    </div>
                </template>
            </div>
        </el-scrollbar>
    </template>
    <div v-else
         style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: darkgray">
        <p>No Result</p>
        <p>Tips: {{ t.tip.selectCharDialog }}</p>
    </div>
    <el-dialog v-model="ifShowSubSelect" :title="t.action.selectAvatar" :width="dialogWidth" top="10vh">
        <div class="avatar-bar" style="margin-top: 0">
            <div class="frame" v-for="avatar in CharDict[currSelect[0]].avatars" :key="avatar"
                 :style="{width: avatarBarFrameDialogWidth, height: avatarBarFrameDialogWidth}">
                <img :src="StaticUrl + avatar" loading="lazy" :title="currSelect[1]"
                     @click="() => {$emit('select',[avatar, currSelect[1]]);ifShowSubSelect=false}">
            </div>
        </div>
    </el-dialog>
</template>

<style scoped>
.avatar-bar {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
}

.avatar-bar .frame {
    position: relative;
    margin: 1px;
}

.avatar-bar img {
    width: 100%;
    height: 100%;
}

.subscript {
    position: absolute;
    right: 0;
    bottom: 0;
    background: darkgrey;
    color: white;
    opacity: 0.9;
    padding: 0 4px;
    border-top-left-radius: 3px;
}

.avatar-bar img:hover {
    width: calc(100% - 2px);
    height: calc(100% - 2px);;
    border: grey solid 1px;
}
</style>
