<script setup lang="ts">
import { ProjectLogo } from '.';
import {NP, NA} from 'naive-ui';
</script>

<template>
    <NP>
        <ProjectLogo/>
    </NP>
    <NP>
        Project Intellyricist 是一个基于 <NA target="_blank" href="https://modelscope.cn/models/damo/nlp_gpt3_text-generation_chinese-large/">GPT-3</NA> 的歌词生成系统，由隶属于<NA target="_blank" href="">双曲线工作室</NA>的 <NA target="_blank" href="https://github.com/orgs/HyperbolaStudio/teams/team-machine-artist">Machine Artist 团队</NA>开发。
    </NP>
    <NP>
        本程序所生成的内容由机器自动生成，我们不能保证其生成内容的准确性和原创性，并且本程序所生成的内容并不代表我们的观点。同时，我们亦不对本程序所生成的内容主张版权。
    </NP>
    <NP>
        <NA target="_blank" href="">查看协议</NA><br/>
        <NA target="_blank" href="">提交反馈</NA>
    </NP>
</template>