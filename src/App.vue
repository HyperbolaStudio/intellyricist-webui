<script setup lang="ts">
import { 
    NButton,
    NButtonGroup,
    NSpin,
    NIcon,
    NLayout, 
    NSpace, 
    NLayoutContent, 
    NLayoutHeader,
    NLayoutSider, 
    NModal,
    NThing,
    NDynamicInput,
    NCheckbox,
    NPopconfirm,
    NCollapse,
    NCollapseItem,
    NForm,
    NSwitch,
    NFormItem,
    NDynamicTags,
    NInput, 
    NAlert,
    NPagination,
    darkTheme,
    useOsTheme,
    zhCN,
    NConfigProvider,
    NInputNumber} from 'naive-ui';
import { TextAnnotationToggle, Delete, AddAlt, AiStatusComplete, AiStatusFailed, CircleDash, CircleFilled, Incomplete, SettingsAdjust } from '@vicons/carbon';
import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { AdvancedArgs, GenerateArgs } from './api/generate';
import { generate } from './api/generate';
import { AppHeader } from './components';
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
    linePrompt: '',
} as GenerateArgs);

const advancedArgs = ref({
    setManualSeed: null,
    apiLocation: '',
    doPseudoGenerate: false,
} as AdvancedArgs);

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
    fullLyrics.value = generatedLyrics.value.map(v=>v.text).join('\n');
    isExportDialogShown.value = true;
}
function convertFullLyrics(){
    if(!fullLyrics.value){
        generatedLyrics.value = [];
    }else{
        let newLyricsList = fullLyrics.value.split('\n');
        if(newLyricsList.length == generatedLyrics.value.length){
            newLyricsList.forEach((v,i)=>{generatedLyrics.value[i].text = v});
        }else{
            generatedLyrics.value = newLyricsList.map(text=>({isChecked: false, text}));
        }
    }
}
const isGenerating = ref(false);
const batchSizeValue = ref(null as number|null);
const batchSize = computed(()=>batchSizeValue.value ?? 1);
const currentGeneratingBatchId = ref(0);
const generatedResult = ref([] as string[][]);
const currentPageId = ref(1);
const currentResultId = computed(()=>currentPageId.value - 1);
const errorMessage = ref(null as string|null);
let interruptFlag = false;
function interruptGeneration(){
    interruptFlag = true;
}
async function generateAndShow(){
    errorMessage.value = null;
    generatedResult.value = [];
    isGenerating.value = true;
    currentPageId.value = 1;
    try{
        for(currentGeneratingBatchId.value = 0; currentGeneratingBatchId.value < batchSize.value; currentGeneratingBatchId.value++){
            generatedResult.value.push(await generate(
                {...generateArgs.value, enableKeywordsRestriction: enableKeywordsRestrictionArg.value, doPromptSelected: doPromptSelectedArg.value},
                generateArgs.value.doPromptSelected ? generatedLyrics.value.filter(v=>v.isChecked).map(v=>v.text) : [],
                advancedArgs.value,
            ));
            if(interruptFlag){
                interruptFlag = false;
                break;
            }
        }
    }catch(e){
        errorMessage.value = (e as Error).message;
    }finally{
        isGenerating.value = false;
    }
}
function appendResult(){
    generatedLyrics.value = generatedLyrics.value.concat(generatedResult.value[currentResultId.value].map(text=>({isChecked: false, text})));
    generatedResult.value.splice(currentResultId.value, 1);
}
</script>


<template>
    <NConfigProvider :theme="themePreference" :locale="zhCN" style="height: 100%;">
        <NLayout position="absolute">
            <NLayoutHeader bordered style="height: 64px;">
                <AppHeader/>
            </NLayoutHeader>
            <NLayoutContent position="absolute" style="top: 64px;">
                <NLayout has-sider position="absolute">
                    <NLayoutSider
                        bordered
                        :width="488"
                    >
                        <NSpace style="margin: 16px;">
                            <NButtonGroup>
                                <NButton @click="selectAll" :disabled="isEveryChecked">
                                    <template #icon>
                                        <NIcon :component="CircleFilled"/>
                                    </template>
                                    全选
                                </NButton>
                                <NButton @click="selectNone" :disabled="isEveryNotChecked">
                                    <template #icon>
                                        <NIcon :component="CircleDash"/>
                                    </template>
                                    全不选
                                </NButton>
                                <NButton @click="selectReverse" :disabled="isEveryChecked&&isEveryNotChecked">
                                    <template #icon>
                                        <NIcon :component="Incomplete"/>
                                    </template>
                                    反选
                                </NButton>
                            </NButtonGroup>
                            <NButton @click="exportLyrics">
                                <template #icon>
                                    <NIcon :component="TextAnnotationToggle"/>
                                </template>
                                编辑
                            </NButton>
                            <NPopconfirm @positive-click="deleteSelected">
                                <template #trigger>
                                    <NButton :disabled="isEveryNotChecked">
                                        <template #icon>
                                            <NIcon :component="Delete"/>
                                        </template>
                                        删除
                                    </NButton>
                                </template>
                                确定要删除吗？
                            </NPopconfirm>
                            <NModal
                                v-model:show="isExportDialogShown"
                                preset="dialog"
                                :mask-closable="false"
                                :close-on-esc="false"
                                positive-text="保存"
                                negative-text="取消"
                                @positive-click="convertFullLyrics"
                            >
                                <template #header>编辑</template>
                                <template #icon>
                                    <NIcon :component="TextAnnotationToggle"/>
                                </template>
                                <NInput style="height: 320px;" type="textarea" v-model:value="fullLyrics"/>
                            </NModal>
                        </NSpace>
                        <NThing title="生成参数" style="margin: 16px;">
                            <template #avatar>
                                <NIcon size="24" :component="SettingsAdjust"/>
                            </template>
                            <NForm :model="generateArgs" label-placement="left">
                                <NFormItem label="启用关键词">
                                    <NSwitch v-model:value="generateArgs.enableKeywords"/>
                                </NFormItem>
                                <div v-if="generateArgs.enableKeywords">
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
                                <NFormItem label="将选中行作为 Prompt">
                                    <NCheckbox 
                                        :checked="doPromptSelectedArg" 
                                        :on-update:checked="e=>generateArgs.doPromptSelected=e"
                                        :disabled="isEveryNotChecked"/>
                                </NFormItem>
                                <NFormItem label="前缀空行">
                                    <NInputNumber style="width: 100%" v-model:value="generateArgs.prefixBlanksNumber" :min="0" :precision="0"/>
                                </NFormItem>
                                <NFormItem label="行 Prompt">
                                    <NInput v-model:value="generateArgs.linePrompt"/>
                                </NFormItem>
                                <NCollapse style="margin-bottom: 24px;">
                                    <NCollapseItem title="高级">
                                        <template #header-extra>
                                            留空以采用缺省设置
                                        </template>
                                        <NFormItem class="indent" label="设置 PyTorch 随机数种子">
                                            <NInputNumber style="width: 100%" v-model:value="advancedArgs.setManualSeed" :precision="0"/>
                                        </NFormItem>
                                        <NFormItem class="indent" label="API 地址">
                                            <NInput v-model:value="advancedArgs.apiLocation"/>
                                        </NFormItem>
                                        <NFormItem class="indent" label="伪生成" :show-feedback="false">
                                            <NCheckbox v-model:checked="advancedArgs.doPseudoGenerate"/>
                                        </NFormItem>
                                    </NCollapseItem>
                                </NCollapse>
                                <NFormItem label="批量生成">
                                    <NInputNumber style="width: 100%" v-model:value="batchSizeValue" :min="1" :precision="0"/>
                                </NFormItem>
                            </NForm>
                            <template #action>
                                <NSpace vertical>
                                    <NButtonGroup style="width: 100%">
                                        <NButton style="width: 50%" @click="isGenerating ? interruptGeneration() : generateAndShow()">
                                            <template #icon>
                                                <NIcon :component="isGenerating ? AiStatusFailed : AiStatusComplete"/>
                                            </template>
                                            {{ isGenerating ? '中止' : '生成' }}
                                        </NButton>
                                        <NButton style="width: 50%" @click="appendResult" :disabled="generatedResult.length == 0">
                                            <template #icon>
                                                <NIcon :component="AddAlt"/>
                                            </template>
                                            添加
                                        </NButton>
                                    </NButtonGroup>
                                    <NAlert v-if="isGenerating" :title="`正在生成 ${currentGeneratingBatchId + 1}/${batchSize}`">
                                        <template #icon>
                                            <NSpin :size="24"/>
                                        </template>
                                        <template v-if="generateArgs.enableKeywords && !generateArgs.keywords.length">
                                            如果关键词列表为空，建议关闭「启用关键词」功能。
                                        </template>
                                    </NAlert>
                                    <NAlert type="error" title="生成时发生错误" v-if="errorMessage">{{ errorMessage }}</NAlert>
                                    <NPagination 
                                        v-if="generatedResult.length && batchSize!= 1"
                                        v-model:page="currentPageId"
                                        :page-count="generatedResult.length"
                                        simple
                                        style="justify-content: center;"/>
                                    <template v-for="text in generatedResult[currentResultId]">
                                        <NInput readonly :value="text"/>
                                    </template>
                                </NSpace>
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
                    </NLayoutContent>
                </NLayout>
            </NLayoutContent>
        </NLayout>
    </NConfigProvider>
</template>
<style scoped>
.indent {
    margin-left: 24px;
}
</style>
