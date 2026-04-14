<!-- 前台API列表 -->
<template>
    <div class="main">
        <div class="navbar">
            <el-button type="primary" plain v-if="verifyPermissionMenu('/control/frontendApi/manage?method=addFrontendApi*','get')" @click="router.push({path: '/admin/control/frontendApi/manage/add'});">添加前台API</el-button>
        </div>
        <div class="data-table" >
            <el-table ref="multipleTable" :data="state.tableData" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                <el-table-column prop="name" label="接口名称" align="center" ></el-table-column>
                <el-table-column prop="url" label="URL路径" align="center" ></el-table-column>
                <el-table-column label="请求方法" align="center" width="110">
                    <template #default="scope">
                        <span v-if="!scope.row.httpMethod || scope.row.httpMethod.length === 0">
                            不限制
                        </span>
                        <span v-else-if="Array.isArray(scope.row.httpMethod)">
                            {{ scope.row.httpMethod.join(' , ') }}
                        </span>
                        <span v-else>
                            {{ scope.row.httpMethod }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="类型" align="center" width="100">
                    <template #default="scope">
                        <el-tag effect="dark"  v-if="scope.row.type == 1" class="tag-wrapper tag-color-orange">默认</el-tag>
                        <el-tag effect="dark"  v-if="scope.row.type == 2" class="tag-wrapper tag-color-cyan">自定义</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="routeEnumName" label="功能" align="center" ></el-table-column>
                <el-table-column prop="routeEnumMapper" label="映射路由枚举" align="center"  width="150"></el-table-column>
                <el-table-column label="访问需要登录" align="center" width="110">
                    <template #default="scope">
                        <el-tag effect="dark" type="danger" v-if="scope.row.requiresLogin" class="tag-wrapper" >需要</el-tag>
                        <el-tag effect="dark" type="info" v-if="!scope.row.requiresLogin" class="tag-wrapper" >不需要</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="220">
                    <template #default="scope">
                        <div class="button-group-wrapper">
                            <el-button-group>
                                <el-button type="primary" :disabled="!verifyPermissionMenu('/control/frontendDocument/details*','get')" @click="viewDocument($event,scope.row)">文档</el-button>
                                <el-button type="primary" :disabled="!verifyPermissionMenu('/control/frontendApi/manage?method=editFrontendApi*','get')" v-if="scope.row.type == 2" @click="router.push({path: '/admin/control/frontendApi/manage/edit', query:{ frontendApiId : scope.row.id}})">修改</el-button>
                                <el-button type="primary" :disabled="!verifyPermissionMenu('/control/frontendApi/manage?method=deleteFrontendApi*','post')" v-if="scope.row.type == 2" @click="deleteFrontendApi($event,scope.row)">删除</el-button>
                            </el-button-group>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, onMounted, reactive } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { type AxiosResponse } from 'axios';
    import { useRouter } from 'vue-router';
    import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
    import type { FrontendApi } from '@/types';
    import { processErrorInfo, verifyPermissionMenu } from '@/utils/tool';
import { openDocumentViewer } from '@/components/documentViewer/documentService';

    const store = useStore(pinia);
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();

    const state = reactive({
        tableData: [] as Array<FrontendApi>,//表格内容
        multipleSelection: [],
    });


    //查询前台API
    const queryFrontendApiList = () => {
        //清空内容
        state.tableData = []; 


        proxy?.$axios({
            url: '/control/frontendApi/list',
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
                        for(let key in result.data){
			    			if(key == "frontendDefaultApi"){
                                let apiMetadataList = result.data[key];
                                if(apiMetadataList != null && apiMetadataList.length >0){
                                    for(let frontendApi of  apiMetadataList){
                                        let api = new Object() as FrontendApi;
                                        api.routeEnumMapper = frontendApi.routeEnumMapper;
                                        api.routeEnumName = frontendApi.routeEnumName;
                                        api.url = frontendApi.paths;
                                        api.httpMethod = frontendApi.methods;
                                        api.type = 1;
                                        for (const path of frontendApi.paths) {
                                            if(path.toLowerCase().startsWith("/user/")){
                                                api.requiresLogin = true;
                                                break;
                                            }
                                        }
                                        state.tableData.push(api)
                                    }
                                }
                            }else if(key == "frontendCustomApi"){
			    				let frontendCustomApiList = result.data[key];
                                if(frontendCustomApiList != null && frontendCustomApiList.length >0){
                                    for(let frontendApi of  frontendCustomApiList){
                                        frontendApi.type = 2;
                                        if(frontendApi.url.toLowerCase().startsWith("/user/")){
                                            frontendApi.requiresLogin = true;
                                        }
                                        state.tableData.push(frontendApi);
                                    }
                                }
                            }
                        }
                    }else if(result.code === 500){//错误
                        
                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //删除前台API
    const deleteFrontendApi = (event:any,row:any) => {
        //强制失去焦点
        let target = event.target;
        // 根据button组件内容 里面包括一个span标签，如果设置icon，则还包括一个i标签，其他情况请自行观察。
        // 所以，在我们点击到button组件上的文字也就是span标签上时，直接执行e.target.blur()不会生效，所以要加一层判断。
        if(target.nodeName == 'SPAN' || target.nodeName == 'I'){
            target = event.target.parentNode;
        }
        target.blur();

        ElMessageBox.confirm('此操作将删除该项, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('frontendApiId', row.id);

            proxy?.$axios({
                url: '/control/frontendApi/manage?method=deleteFrontendApi',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '删除成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
				    		queryFrontendApiList();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch(() => {
            //取消
        })
    }

    //查看文档
    const viewDocument = (event:any,row:FrontendApi) => {
        const { routeEnumMapper, routeEnumName,type } = row;
        openDocumentViewer({
            routeEnumMapper: routeEnumMapper,//映射路由枚举值
            name: routeEnumName,//名称
            type: type ? type :1
        });

    }


    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

		queryFrontendApiList();

    }) 
</script>