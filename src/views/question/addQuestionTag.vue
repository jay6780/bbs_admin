<!-- 添加问题标签 -->
<template>
    <div class="main">
        <div class="nav-breadcrumb">
            <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item @click="router.push({path: '/admin/control/questionTag/list'});">全部标签</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(value, key) in state.navigation" @click="router.push({path: '/admin/control/questionTag/list',query:{parentId:key}});">{{value}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="navbar">
            <el-button type="primary" plain @click="router.push({path: '/admin/control/questionTag/list',query:{parentId:(route.query.sourceParentId != undefined ? route.query.sourceParentId:''),page:(route.query.page != undefined ? route.query.page:'')}})">返回</el-button>
        </div>
        <div class="data-form label-width-blank" >
            <el-form label-width="auto"  @submit.native.prevent>
                <el-form-item label="父标签名称" v-if="state.parentTag != undefined && state.parentTag != null && Object.keys(state.parentTag).length>0">
                    {{state.parentTag.name}}
                </el-form-item>
                <el-form-item label="标签名称" :required="true" :error="error.name">
                    <el-input v-model.trim="state.name" maxlength="50" :clearable="true" show-word-limit></el-input>
                </el-form-item>
                <el-form-item :label="'标签名称（'+value+'）'" :error="error.multiLanguageExtensionField.get('name-'+key)" v-for="(value,key) in state.multiLanguageExtensionParameterMap">
                    <el-input v-model.trim="state.multiLanguageExtensionField['name-'+key]" maxlength="50" :clearable="true" show-word-limit></el-input>
                </el-form-item>

                <el-form-item label="排序" :required="true" :error="error.sort">
                    <el-input-number v-model="state.sort" controls-position="right" :min="0" :max="99999999"></el-input-number>
                    <div class="form-help" >数字越大越在前</div>
                </el-form-item>
                <el-form-item label="图片" :error="error.images">
                    <el-upload action="#" v-model:file-list="state.images" list-type="picture-card" :auto-upload="false" :on-change="handleChange" :on-preview="openImagePreview" :on-remove="handleImageRemove" :accept="'image/*'">
                        <el-icon><Plus /></el-icon>
                    </el-upload>
                    <!-- 图片预览 -->
                    <el-image-viewer v-if="state.isImageViewer" @close="closeImagePreview" :url-list="[state.localImageUrl]" />
                </el-form-item>


                <el-form-item label=" ">
                    <el-button type="primary" size="large" class="submitButton" @click="submitForm" :disabled="state.submitForm_disabled">提交</el-button>
                </el-form-item>
            </el-form>
            
            
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, onMounted, reactive} from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { type AxiosResponse } from 'axios';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage, type UploadFile, type UploadUserFile, } from 'element-plus';
    import { processErrorInfo } from '@/utils/tool';
    import type { QuestionTag } from '@/types';
    import { ArrowRight } from '@element-plus/icons-vue'

    const store = useStore(pinia);
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();
    

    const state = reactive({
        parentId:'',
        name :'',
        sort : 0,
        
        parentTag :{} as QuestionTag,
        navigation :'',
        multiLanguageExtensionField : [] as any, //多语言扩展字段
        multiLanguageExtensionParameterMap: {} as Map<string,string>,//多语言扩展参数
        images:[] as UploadUserFile[],//缩略图
        localImageUrl: '' as string | undefined,//本地图片地址 例如blob:http://127.0.0.1:8080/cfab3833-cbb0-4072-a576-feaf8fb19e5f
        isImageViewer: false,//是否显示图片查看器
        submitForm_disabled:false,//提交按钮是否禁用
    });
    const error = reactive({
        name :'',
        sort :'',
        images: '',
        multiLanguageExtensionField : new Map<string,string>(),
    });

    //处理上传图片
    const handleChange = (file: UploadFile, fileList:UploadUserFile[]) => {
        if (fileList.length > 1) {
            fileList.splice(0, 1);
        }
    }
    //处理删除图片
    const handleImageRemove = (file: UploadFile) => {
        
    }
    //打开图片预览
    const openImagePreview = (file: UploadFile) => {
        state.localImageUrl = file.url;
        state.isImageViewer = true;
    }
    //关闭图片预览
    const closeImagePreview= () => {
        state.localImageUrl = '';
        state.isImageViewer = false;
    }

    
    //查询分类
    const queryQuestionTag = () => {

        proxy?.$axios({
            url: '/control/questionTag/manage',
            method: 'get',
            params: {
                method : 'add',
			    parentId: state.parentId,
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		for(let key in mapData){
			    			if(key == "parentTag"){
			    				state.parentTag = mapData[key];
			    			}else if(key == "navigation"){
			    				state.navigation = mapData[key];
			    			}else if(key == "multiLanguageExtensionParameterMap"){
                                state.multiLanguageExtensionParameterMap = mapData[key];
                            }
			    		}
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //提交表单
    const submitForm = () => {
        state.submitForm_disabled = true;

        //清空error的属性值
        for (const [key, value] of Object.entries(error) as [string, string|Map<string,string>][]){
            if(value instanceof Map){
                value.clear();
            }else{
                Object.assign(error, {[key] : ''});
            }
        }

        let formData = new FormData();
        if(state.parentId != null){
            formData.append('parentId', state.parentId);
            
        }
        if(state.name != null){
            formData.append('name', state.name);
            
        }
        //多语言扩展值
        for(let multiLanguageExtensionParameter in state.multiLanguageExtensionParameterMap){
            if(state.multiLanguageExtensionField['name-'+multiLanguageExtensionParameter] != undefined && state.multiLanguageExtensionField['name-'+multiLanguageExtensionParameter] != null && state.multiLanguageExtensionField['name-'+multiLanguageExtensionParameter] != ''){
                formData.append('name-'+multiLanguageExtensionParameter, (state.multiLanguageExtensionField['name-'+multiLanguageExtensionParameter] as string).trim());
            }
		}
        if(state.sort != null){
            formData.append('sort',String(state.sort));
            
        }
        if(state.images != null && state.images.length >0){
            for(let i=0; i<state.images.length; i++){
                let file = state.images[i];
                formData.append('images', file.raw!);
            }
        }
        
        proxy?.$axios({
            url: '/control/questionTag/manage?method=add',
            method: 'post',
            data: formData,
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
			    if(result){
			    	if(result.code === 200){//成功
                        ElMessage({
                            showClose: true,
                            message: '提交成功',
                            type: 'success',
                            onClose: ()=>{
                                
                            }
                        })
			    		//删除缓存
                        store.setCacheNumber();

                        let page = (router.currentRoute.value.query.page != undefined ? router.currentRoute.value.query.page:'');
                        
                        
                        if((router.currentRoute.value.query.sourceParentId == null || router.currentRoute.value.query.sourceParentId == ''
                            && router.currentRoute.value.query.parentId != null && router.currentRoute.value.query.parentId != '') ){
                            
                            page = "1";
                        }
			    		router.push({
							path : '/admin/control/questionTag/list',
							query:{
								parentId: state.parentId,
								page:page
							}
						});
			    	}else if(result.code === 500){//错误
			    		//剩余错误信息
                        let remainingError = new Object() as any;//多语言扩展参数

                        //处理错误信息
                        for (const [key, value] of Object.entries(result.data) as [string, string][]){
                            if(key.indexOf("-") != -1){
                                error.multiLanguageExtensionField.set(key,value);
                            }else {
                                Object.assign(remainingError, {[key] : value});
                            }
                        }
			    		//处理错误信息
                        processErrorInfo(remainingError, error,()=>{});
			    		
			    	}
                }
                state.submitForm_disabled = false;//提交按钮disabled状态
            }
        })
        .catch((error: any) =>{
            console.log(error);
            state.submitForm_disabled = false;//提交按钮disabled状态
        });
    }

    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

        if(router.currentRoute.value.query.parentId != undefined && router.currentRoute.value.query.parentId != ''){
			state.parentId = router.currentRoute.value.query.parentId as string;
		}
		
		queryQuestionTag();
    }) 

</script>