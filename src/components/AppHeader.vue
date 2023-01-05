<script setup lang="tsx">
import { Help, Information, OverflowMenuHorizontal } from '@vicons/carbon';
import { NIcon, NPageHeader, NSpace, NButton, NDropdown, NDrawer, NDrawerContent } from 'naive-ui';
import { ref } from 'vue';
import { LogoTypes } from './ProjectLogo.vue';
import { HelpSection, AboutSection, ProjectLogo } from '.';


const doShowHelp = ref(false);
const doShowAbout = ref(false);
const doShowHelpAlt = ref(false);
const doShowAboutAlt = ref(false);
const headerMenuOptions = ref([{
    label: '帮助',
    key: 'help_alt',
    icon: ()=><NIcon><Help></Help></NIcon>
},{
    label: '关于',
    key: 'about_alt',
    icon: ()=><NIcon><Information></Information></NIcon>
}]);
function handleSelect(key: string){
    ({
        help: doShowHelp,
        about: doShowAbout,
        help_alt: doShowHelpAlt,
        about_alt: doShowAboutAlt,
    } as any)[key].value = true;
}
</script>

<template>
    <NPageHeader>
        <template #title>
            <ProjectLogo :type="LogoTypes.header" style="height: 48px; margin-top: 8px; margin-left: 16px"/>
        </template>
        <template #extra>
            <NSpace :size="16" style="margin-right: 16px;">
                <NButton class="nav-btn" quaternary @click="handleSelect('help')">
                    <template #icon>
                        <NIcon :component="Help"/>
                    </template>
                    帮助
                </NButton>
                <NButton class="nav-btn" quaternary @click="handleSelect('about')">
                    <template #icon>
                        <NIcon :component="Information"/>
                    </template>
                    关于
                </NButton>
                <NDropdown trigger="click" :options="headerMenuOptions" placement="bottom-end" @select="handleSelect">
                    <NButton class="nav-dropdown" quaternary style="font-size: 1.5em">
                        <NIcon :component="OverflowMenuHorizontal"/>
                    </NButton>
                </NDropdown>
            </NSpace>
            <NDrawer :width="500" v-model:show="doShowHelp" placement="right">
                <NDrawerContent title="帮助"><HelpSection/></NDrawerContent>
            </NDrawer>
            <NDrawer :width="500" v-model:show="doShowAbout" placement="right">
                <NDrawerContent title="关于"><AboutSection/></NDrawerContent>
            </NDrawer>
            <NDrawer :height="400" v-model:show="doShowHelpAlt" placement="top">
                <NDrawerContent title="帮助"><HelpSection/></NDrawerContent>
            </NDrawer>
            <NDrawer :height="400" v-model:show="doShowAboutAlt" placement="top">
                <NDrawerContent title="关于"><AboutSection/></NDrawerContent>
            </NDrawer>
        </template>
    </NPageHeader>
</template>

<style scoped>
.nav-dropdown{
    display: none;
}
@media (max-width: 800px) {
    .nav-btn{
        display: none;
    }
    .nav-dropdown{
        display: unset;
    }
}
</style>