<script setup lang="ts">
import { 
    NButton,
    NButtonGroup,
    NSpin,
    NIcon,
    NLayout, 
    NSpace, 
    NLayoutContent, 
    NLayoutSider, 
    NModal,
    NThing,
    NDynamicInput,
    NCheckbox,
    NPopconfirm,
    NForm,
    NSwitch,
    NFormItem,
    NDynamicTags,
    NInput, 
    darkTheme,
    useOsTheme,
    zhCN,
    NConfigProvider,
    NInputNumber} from 'naive-ui';
import { DocumentExport, Delete, AiStatusComplete, CircleDash, CircleFilled, CircleSolid } from '@vicons/carbon';
import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { GenerateArgs } from './api/generate';
import { generate } from './api/generate';
const themePreference = computed(()=>{
    return useOsTheme().value == 'dark' ? darkTheme : null;
})
interface generatedLyricEntry {
    isChecked: boolean;
    text: string;
}
const useGeneratedLyrics = defineStore('generatedLyrics', ()=>{
    const generatedLyrics =  ref([] as generatedLyricEntry[]);
    return {generatedLyrics};
}, {
    persist: true,
});
const {generatedLyrics} = storeToRefs(useGeneratedLyrics());
const fullLyrics = ref('');
const generateArgs = ref({
    enableKeywords: true,
    keywords: [],
    enableKeywordsRestriction: false,
    doPromptSelected: true,
    prefixBlanksNumber: null,
    linePrompt: null,
} as GenerateArgs);

const enableKeywordsRestrictionArg = computed(()=>{
    if(mustEnableKeywordsRestriction.value) return true;
    else return generateArgs.value.enableKeywordsRestriction;
});
const mustEnableKeywordsRestriction = computed(()=>{
    return Boolean(doPromptSelectedArg.value || generateArgs.value.prefixBlanksNumber || generateArgs.value.linePrompt);
});

const doPromptSelectedArg = computed(()=>{
    if(isEveryNotChecked.value) return false;
    else return generateArgs.value.doPromptSelected;
});

function onLyricsCreate(): generatedLyricEntry{
    return {
        isChecked: false,
        text: ''
    }
}
function selectAll(){
    generatedLyrics.value.forEach(v=>v.isChecked = true);
}
function selectNone(){
    generatedLyrics.value.forEach(v=>v.isChecked = false);
}
function selectReverse(){
    generatedLyrics.value.forEach(v=>v.isChecked = !v.isChecked);
}
function deleteSelected(){
    generatedLyrics.value = generatedLyrics.value.filter(v=>!v.isChecked);
}
const isEveryChecked = computed(()=>{
    return generatedLyrics.value.every(v=>v.isChecked)
});
const isEveryNotChecked = computed(()=>{
    return generatedLyrics.value.every(v=>!v.isChecked)
});
const isExportDialogShown = ref(false);
function exportLyrics(){
    if(isEveryNotChecked.value)selectAll();
    fullLyrics.value = generatedLyrics.value.filter(v=>v.isChecked).map(v=>v.text).join('\n');
    isExportDialogShown.value = true;
}
const isGenerating = ref(false);
async function generateAndAppend(){
    isGenerating.value = true;
    generatedLyrics.value = generatedLyrics.value.concat(
        (await generate(
            {...generateArgs.value, enableKeywordsRestriction: enableKeywordsRestrictionArg.value, doPromptSelected: doPromptSelectedArg.value},
            generateArgs.value.doPromptSelected ? generatedLyrics.value.filter(v=>v.isChecked).map(v=>v.text) : []
        )).map(text=>({isChecked: false, text})));
    isGenerating.value = false;
}
</script>


<template>
<NConfigProvider :theme="themePreference" :locale="zhCN" style="height: 100%;">
    <NLayout has-sider sider-placement="left" style="height: 100%">
        <NLayoutSider
            bordered
            :width="480"
        >
            <NSpace class="button-row">
                <NButtonGroup>
                    <NButton @click="selectAll" :disabled="isEveryChecked">
                        <template #icon>
                            <NIcon><CircleSolid/></NIcon>
                        </template>
                        全选
                    </NButton>
                    <NButton @click="selectNone" :disabled="isEveryNotChecked">
                        <template #icon>
                            <NIcon><CircleDash/></NIcon>
                        </template>
                        全不选
                    </NButton>
                    <NButton @click="selectReverse" :disabled="isEveryChecked&&isEveryNotChecked">
                        <template #icon>
                            <NIcon><CircleFilled/></NIcon>
                        </template>
                        反选
                    </NButton>
                </NButtonGroup>
                <NButton @click="exportLyrics" :disabled="isEveryChecked&&isEveryNotChecked">
                    <template #icon>
                        <NIcon><DocumentExport/></NIcon>
                    </template>
                    导出
                </NButton>
                <NPopconfirm @positive-click="deleteSelected">
                    <template #trigger>
                        <NButton :disabled="isEveryNotChecked">
                            <template #icon>
                                <NIcon><Delete/></NIcon>
                            </template>
                            删除
                        </NButton>
                        
                    </template>
                    确定要删除吗？
                </NPopconfirm>
                <NModal v-model:show="isExportDialogShown" preset="dialog">
                    <template #header>导出</template>
                    <NInput type="textarea" :value="fullLyrics" readonly></NInput>
                </NModal>
            </NSpace>
            <NThing title="生成参数" class="button-row">
                <NForm :model="generateArgs" label-placement="left">
                    <NFormItem label="启用关键词">
                        <NSwitch v-model:value="generateArgs.enableKeywords"/>
                    </NFormItem>
                    <div :class="{hidden: !generateArgs.enableKeywords}">
                        <NFormItem label="关键词列表">
                            <NDynamicTags v-model:value="generateArgs.keywords"/>
                        </NFormItem>
                        <NFormItem label="限定关键词">
                            <NCheckbox 
                                :checked="enableKeywordsRestrictionArg" 
                                :on-update:checked="e=>generateArgs.enableKeywordsRestriction=e"
                                :disabled="mustEnableKeywordsRestriction"
                            />
                        </NFormItem>
                    </div>
                    <NFormItem label="将选中行作为Prompt">
                        <NCheckbox 
                            :checked="doPromptSelectedArg" 
                            :on-update:checked="e=>generateArgs.doPromptSelected=e"
                            :disabled="isEveryNotChecked"/>
                    </NFormItem>
                    <NFormItem label="前缀空行">
                        <NInputNumber style="width: 100%" v-model:value="generateArgs.prefixBlanksNumber"/>
                    </NFormItem>
                    <NFormItem label="行Prompt">
                        <NInput v-model:value="generateArgs.linePrompt"/>
                    </NFormItem>
                </NForm>
                <template #action>
                    <NButton style="width: 100%" @click="generateAndAppend" :disabled="isGenerating">
                        <template #icon>
                            <NIcon><AiStatusComplete/></NIcon>
                        </template>
                        生成
                    </NButton>
                </template>
            </NThing>
        </NLayoutSider>
        <NLayoutContent content-style="padding: 16px">
                <NDynamicInput 
                    v-model:value="generatedLyrics"
                    :on-create="onLyricsCreate"
                    show-sort-button
                >
                    <template #create-button-default>
                        新建一行歌词
                    </template>
                    <template #default="{ value }">
                        <div style="display: flex; align-items: center; width: 100%">
                            <NCheckbox
                            v-model:checked="value.isChecked"
                            style="margin-right: 12px"
                            />
                            <NInput v-model:value="value.text" type="text" />
                        </div>
                    </template>
                </NDynamicInput>
                <NSpin :class="{hidden: !isGenerating}" style="margin-top: 16px"/>
        </NLayoutContent>
    </NLayout>
</NConfigProvider>
</template>
<style scoped>
.button-row {
    margin: 16px;
}
.hidden {
    display: none;
}
</style>