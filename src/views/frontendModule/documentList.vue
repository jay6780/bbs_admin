<!-- 前台API文档列表 -->
<template>
    <div class="main">
        <div class="data-table" >
            <el-table ref="multipleTable" :data="state.tableData" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                <el-table-column prop="name" label="功能" align="center" ></el-table-column>
                <el-table-column prop="routeEnumMapper" label="映射路由枚举" align="center"  width="200"></el-table-column>
                <el-table-column label="类型" align="center" width="150">
                    <template #default="scope">
                        <el-tag effect="dark"  v-if="scope.row.type == 1" class="tag-wrapper tag-color-orange">默认</el-tag>
                        <el-tag effect="dark"  v-if="scope.row.type == 2" class="tag-wrapper tag-color-cyan">自定义</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180">
                    <template #default="scope">
                        <div class="button-group-wrapper">
                            <el-button-group>
                                <el-button type="primary" :disabled="!verifyPermissionMenu('/control/frontendDocument/details*','get')" @click="viewDocument($event,scope.row)">文档</el-button>
                            </el-button-group>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, onMounted, reactive, ref } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { type AxiosResponse } from 'axios';
    import { useRoute, useRouter } from 'vue-router';
    import {  ElTable } from 'element-plus';
    import type { FrontendApi } from '@/types';
    import { openDocumentViewer } from '@/components/documentViewer/documentService';
import { verifyPermissionMenu } from '@/utils/tool';

    const store = useStore(pinia);
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();
    
    const multipleTable = ref<InstanceType<typeof ElTable>>()

    const state = reactive({
        tableData: [] as Array<FrontendApi>,//表格内容
        multipleSelection: [],
    });


    //查询文档列表
    const queryDocumentList = () => {
        //清空内容
        state.tableData = []; 


        proxy?.$axios({
            url: '/control/frontendDocument/list',
            method: 'get',
            params: {
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        state.tableData = result.data; 

                    }else if(result.code === 500){//错误
                        
                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    

    //查看文档
    const viewDocument = (event:any,row:any) => {
        openDocumentViewer(row);
      
    }

    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

		queryDocumentList();

    }) 
</script>
<style scoped lang="scss">
//关闭按钮浮动
:deep(.el-dialog .el-dialog__headerbtn) {
    position: fixed;
    right: 15px;
}
:deep(.documentMarkdownContent) {
    scroll-behavior: smooth; 
    margin: 0px 10px 10px 10px;
    padding-top:20px;
    padding-bottom:15px;
    min-height: 80px;
    font-size: 15px;
    line-height: 1.8;
    color: #222;
    border-top: 1px solid #f1f1f1;
    word-wrap : break-word;
    word-break : break-all;
    .lastUpdateTime{
        text-align: center;line-height: 40px;padding-bottom: 30px;color: #939499;
    }
    a{
        color: #26a2ff;
    }
    i {
        font-style:normal;
    }
    //自动换行
    pre{
        white-space:pre-wrap;
    }
    
    ol{
        list-style: decimal;
    }
    ol li{
        list-style-type:decimal;
        list-style-position:inside;
    }
    ul{
        list-style: disc;
    }
    // ul li{
        //   list-style-type:disc;
    //  }
    .task-list-item {
        list-style-type:none;
    }
    .download{
        color: #1890ff;
        margin: 0 5px 0 5px;
        cursor: pointer;
        .link-icon {
            position: relative;
            top: 4px;
            margin-right: 2px;
            color:#1890ff;
            width: 20px; height: 20px;
        }
    }
    p{
        font-size:16px;
        word-wrap : break-word;
        word-break : break-all;
    }
    code[class*="language-"]{
        padding: 0 0;
    }
    pre code{/*连续字母数字换行*/
        word-break: break-all;
    }
    img{
        max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
        cursor: -webkit-zoom-in;
        cursor: zoom-in;
        vertical-align: sub;
    }
    .el-image[style*="width: 32px; height: 32px;"]{
        top: 3px;
    }
    iframe{
        width:100%; height: 550px;padding:10px 0px; 
    }
    video{
        width:100%; height: 550px;padding:10px 0px; outline:none;
    }
    hide{
        border: 0;
        border-left: 3px solid #53a8ff;
        margin-left: 10px;
        padding: 0.5em;
        min-height:26px;
        display: block;
        margin: 30px 0px 0px 0px;
        
    }
    table {
        width: 100%;
        th {
            font-weight: 600
        }
        td,
        th {
            border: 1px solid #E5E6EB;
            padding: 6px 13px
        }
        tr {
            background-color: #fff;
            border-top: 1px solid #E5E6EB;
            &:nth-child(2n) {
                background-color: #F7F8FA;
            }
        }
    }
    ol{
        li{ 
            list-style-type:decimal;
            list-style-position:inside;
        }
    }
    ul{
        li{ 
            //margin-left:20px;
            list-style-type:disc;
        }
    }
    .inputValue_10{
        &:before {
            content: '密码: ' attr(input-value) '';
            color: #53a8ff;
            font-size:14px;
            position: absolute;
            margin-top: -30px;
            line-height: 30px;
        }
    }
    .inputValue_20{
        &:before {
            content: '回复话题可见';
            color: #53a8ff;
            font-size:14px;
            position: absolute;
            margin-top: -30px;
            line-height: 30px;
        }
    }
    .inputValue_30{
        &:before {
            content: '达到等级 ' attr(description) ' 可见';
            color: #53a8ff;
            font-size:14px;
            position: absolute;
            margin-top: -30px;
            line-height: 30px;
        }
    }
    .inputValue_40{
        &:before {
            content: '需要支付 ' attr(input-value) ' 积分可见';
            color: #53a8ff;
            font-size:14px;
            position: absolute;
            margin-top: -30px;
            line-height: 30px;
        }
    }
    .inputValue_50{
        &:before {
            content: '需要支付 ' attr(input-value) ' 元费用可见';
            color: #53a8ff;
            font-size:14px;
            position: absolute;
            margin-top: -30px;
            line-height: 30px;
        }
    }
    player{
        display: block;
        margin-top: 8px;
        height: 576px;
    }
    .dplayer-process {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99;
        .box{
            position: relative;
            width: 100%;
            height: 100%;
            .prompt{
                width: 250px;
                height: 80px;
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                padding :0px 30px;
                border-radius :3px;
                color: #fff;
                line-height: 80px;
                font-size: 20px;
                background-color:rgb(0,0,0);
                opacity:0.7;
                filter:alpha(opacity=70);
                text-align: center;
            }
        }
    }

}

</style>