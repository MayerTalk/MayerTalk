<script setup lang="ts">
import type { ElInput } from 'element-plus'
import { ref, useTemplateRef, watch, computed } from 'vue'

import { t } from '@/lib/lang/translate'
import { doAfterRefMounted, ensureValue } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'
import { STATIC_URL, IsMobile } from '@/lib/data/constance'
import { SearchManager, CharDict, Suffix } from '@/lib/data/character'


const { maxHeight = null } = defineProps<{
    maxHeight?: string | null
}>()

const emit = defineEmits<{
    select: [char: CharSelectResult]
}>()

const ifShowSubSelect = ref(false)

const search = ref('')
const searchManager = new SearchManager()
const searchResult = searchManager.result
const inputRef = useTemplateRef<InstanceType<typeof ElInput>>('inputRef')
const currSelect = ref<CharSelect | null>(null)
const avatarBarRef = useTemplateRef<HTMLDivElement>('avatarBarRef')
const avatarBarFrameWidth = ref('0px')
doAfterRefMounted(avatarBarRef, (ref) => {
    avatarBarFrameWidth.value = Math.floor(ref.value.scrollWidth / 4) - 2 + 'px'
})
const avatarBarFrameDialogWidth = computed(() => {
    return Math.floor((dialogWidth.value - 48) / 4) + 'px'
})

interface CharSelectResult {
    avatar: string,
    name: string
}
type CharSelect = [charId: string, charName: string]

const defaultChar: Array<CharSelectResult> = function () {
    const res: Array<CharSelectResult> = []
    const characters = [
        ['avatar/arknights/doctor', t.value.character.doctor],
        ['avatar/arknights/PRTS', 'PRTS'],
        ['avatar/arknights/mon3tr', 'mon3tr'],
        ['avatar/arknights/char_003_kalts', t.value.character.kalts]
    ];
    characters.forEach(element => {
        res.push({
            avatar: element[0] + Suffix,
            name: element[1]
        })
    });
    return res
}()

watch(search, () => {
    searchManager.search(search.value)
})

function autoFocus() {
    if (!IsMobile) {
        doAfterRefMounted(inputRef, (r) => {
            setTimeout(() => {
                r.value.focus()
            }, 0)
        })
    }
}

function handleSelect(char: CharSelect) {
    if (CharDict[char[0]].avatars.length > 1) {
        currSelect.value = char
        ifShowSubSelect.value = true
    } else {
        emit('select', {
            avatar: CharDict[char[0]].avatars[0],
            name: char[1]
        })
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
                    <!-- 无搜索时默认角色 -->
                    <div class="frame" v-for="char in defaultChar" :key="char.name"
                        :style="{ width: avatarBarFrameWidth, height: avatarBarFrameWidth }">
                        <img :src="STATIC_URL + char.avatar" loading="lazy" :title="char.name"
                            @click="() => { $emit('select', char) }">
                    </div>
                </template>
                <template v-else>
                    <!-- 展示搜索结果 -->
                    <div class="frame" v-for="char in searchResult" :key="char[0]"
                        :style="{ width: avatarBarFrameWidth, height: avatarBarFrameWidth }">
                        <img :src="STATIC_URL + CharDict[char[0]].avatars[0]" loading="lazy" :title="char[1]"
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
        <div v-if="currSelect" class="avatar-bar" style="margin-top: 0">
            <div class="frame" v-for="avatar in CharDict[currSelect[0]].avatars" :key="avatar"
                :style="{ width: avatarBarFrameDialogWidth, height: avatarBarFrameDialogWidth }">
                <img :src="STATIC_URL + avatar" loading="lazy" :title="currSelect[1]"
                    @click="() => { $emit('select', { avatar, name: ensureValue(currSelect, 'currSelect')[1] }); ifShowSubSelect = false }">
            </div>
        </div>
        <div v-else>
            Oops! Something went wrong.
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
    height: calc(100% - 2px);
    ;
    border: grey solid 1px;
}
</style>
