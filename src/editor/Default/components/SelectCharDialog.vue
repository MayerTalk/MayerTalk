<script setup>
import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { StaticUrl, IsMobile } from '@/lib/constance'
import { searchCharHandler, searchResult, loadChar, CharDict, Suffix } from '@/lib/character'
import { doAfterRefMounted } from '@/lib/tool'
import { dialogWidth } from '@/lib/width'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'select'])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})
const ifShowSubSelect = ref(false)

const search = ref('')
const inputRef = ref(null)
const currSelect = ref([])
const avatarBarFrameWidth = computed(() => {
    return Math.floor((dialogWidth.value - 48) / 4) + 'px'
})

const defaultChar = [
    ['avatar/arknights/doctor' + Suffix, t.value.character.doctor],
    ['avatar/arknights/PRTS' + Suffix, 'PRTS'],
    ['avatar/arknights/mon3tr' + Suffix, 'mon3tr'],
    ['avatar/arknights/char_003_kalts' + Suffix, t.value.character.kalts]
]

function initSearchChar () {
    const el = document.querySelector('#searchCharInput')
    el.addEventListener('input', () => {
        searchCharHandler(el.value)
    })
    searchCharHandler('')
}

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
        ifShow.value = false
    }
}
</script>

<template>
  <el-dialog v-model="ifShow" :title="t.action.selectChar" :width="dialogWidth" top="10vh"
             @open="loadChar('arknights');initSearchChar();autoFocus()"
             @closed="searchCharHandler('');search=''">
    <!--        素材库选择角色-->
    <el-input :placeholder="t.action.selectMoreCharacter" v-model="search" id="searchCharInput"
              ref="inputRef"></el-input>
    <template v-if="searchResult">
      <el-scrollbar max-height="50vh" style="width: 100%">
        <div class="avatar-bar">
          <template v-if="searchResult.length">
            <div class="frame" v-for="char in searchResult" :key="char[0]"
                 :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
              <img :src="StaticUrl + CharDict[char[0]].avatars[0]" loading="lazy" :title="char[1]"
                   @click="handleSelect(char)">
              <div class="subscript" v-if="CharDict[char[0]].avatars.length > 1">
                {{ CharDict[char[0]].avatars.length - 1 }}+
              </div>
            </div>
          </template>
          <template v-else>
            <div class="frame" v-for="char in defaultChar" :key="char[1]"
                 :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
              <img :src="StaticUrl + char[0]" loading="lazy" :title="char[1]"
                   @click="() => {$emit('select',char);ifShow=false}">
            </div>
          </template>
        </div>
      </el-scrollbar>
    </template>
    <div v-else
         style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: grey">
      <p>No Result</p>
      <p>Tips: {{ t.tip.selectCharDialog }}</p>
    </div>
  </el-dialog>
  <el-dialog v-model="ifShowSubSelect" :title="t.action.selectAvatar" :width="dialogWidth" top="10vh">
    <div class="avatar-bar" style="margin-top: 0">
      <div class="frame" v-for="avatar in CharDict[currSelect[0]].avatars" :key="avatar"
           :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
        <img :src="StaticUrl + avatar" loading="lazy" :title="currSelect[1]"
             @click="() => {$emit('select',[avatar, currSelect[1]]);ifShowSubSelect=false;ifShow=false}">
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.avatar-bar {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  --witdh: calc(25% - 2px);
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
<style>
/*why not work?*/
/*.avatar-bar .frame {*/
/*    width: v-bind('avatarBarFrameWidth');*/
/*    height: v-bind('avatarBarFrameWidth');*/
/*}*/
</style>
