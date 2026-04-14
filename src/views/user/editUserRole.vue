<!-- 修改角色 -->
<template>
    <div class="main">
        <div class="navbar">
            <el-button type="primary" plain @click="router.push({path: '/admin/control/userRole/list/'})">返回</el-button>
        </div>
        <div class="data-form label-width-blank userRoleModule" >
            <el-form label-width="auto"  @submit.native.prevent>
                <el-form-item label="名称" :required="true" :error="error.name">
                    <el-input v-model.trim="state.name" maxlength="40"></el-input>
                </el-form-item>
                <el-form-item :label="'名称（'+value+'）'" :error="error.multiLanguageExtensionField.get('name-'+key)" v-for="(value,key) in state.multiLanguageExtensionParameterMap">
                    <el-input v-model.trim="state.multiLanguageExtensionField['name-'+key]" maxlength="40" :clearable="true" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="排序" :required="true" :error="error.sort">
                    <el-input-number v-model="state.sort" controls-position="right" :min="0" :max="99999999"></el-input-number>
                    <div class="form-help" >如果选中"默认角色" 则优先级最高，本排序参数无效</div>
                </el-form-item>
                <el-form-item label="权限" :error="error.userResourceGroup" >
                    <el-table ref="tableRef" :data="state.userResourceGroupList" @select="handleSelectionSelect" tooltip-effect="dark" :default-expand-all="true"  :show-header="false" :style="{ width: '100%' }" empty-text="没有内容">
                        <el-table-column type="selection" ></el-table-column>
                        <el-table-column label="名称" >
                            <template #default="scope">	
                                {{scope.row.name}}
                                <span class="form-help" style="margin-left: 6px" v-if="scope.row.type == 20 && scope.row.parentTagId != null && scope.row.parentTagId >0">{{scope.row.parentTagName}} <span class="tag-icon"><el-icon><ArrowRight /></el-icon></span> </span>
                                <span class="form-help" style="margin-left: 6px" v-if="scope.row.type == 20">{{scope.row.tagName}}</span>
                                
                            </template>
                        </el-table-column>
                        <el-table-column type="expand" label="资源组" ><!-- 因为type="expand"方式导致索引不连续,所以使用数据中设置的索引 -->
                            <template #default="scope">
                                <div class="userResource-box">
                                    <el-checkbox v-model="state.resourceCodeGroup[scope.row.index][index]" v-for="(userResource,index) in scope.row.userResourceList" @change="handleUserResourceChange(userResource,scope.row.index,index)">{{userResource.name}}</el-checkbox>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="form-help" >如果默认角色允许‘查看话题内容’，则未登录用户也可以查看</div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" class="submitButton"  @click="submitForm" :disabled="state.submitForm_disabled">提交</el-button>
                </el-form-item>
            </el-form>
            
            
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, nextTick, onMounted, reactive, ref } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { type AxiosResponse } from 'axios';
    import { useRouter } from 'vue-router';
    import { ElMessage,  ElTable } from 'element-plus';
    import { processErrorInfo } from '@/utils/tool';
    import type { UserResourceGroup } from '@/types';

    const store = useStore(pinia);
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
 
    const tableRef = ref<InstanceType<typeof ElTable>>()


    const state = reactive({
        userRoleId :'',
        name :'',
        sort :0,
        multiLanguageExtensionField : [] as any, //多语言扩展字段
        multiLanguageExtensionParameterMap: {} as Map<string,string>,//多语言扩展参数
        userResourceGroupList :[] as Array<UserResourceGroup>,
        resourceCodeGroup:[] as any,//资源代码组(二维数组)
        
        submitForm_disabled:false,//提交按钮是否禁用
    });
    const error = reactive({
        name :'',
        sort :'',
        userResourceGroup :'',
        multiLanguageExtensionField : new Map<string,string>(),
    });

    //处理全选单元格
    const handleSelectionSelect = (selection:any, row:any) => {
        //是否选中
        let isSelected = selection.length && selection.indexOf(row) !== -1;// true就是选中，0或者false是取消选中
        	
        for (let i = 0; i <state.userResourceGroupList.length; i++) {
            let userResourceGroup = state.userResourceGroupList[i];
            if(userResourceGroup.code == row.code && userResourceGroup.tagId == row.tagId){
                
                if(isSelected == true){//选中
                    let resourceCode_arr = state.resourceCodeGroup[i];
                    if(resourceCode_arr != null && resourceCode_arr.length >0){
                        for (let j = 0; j <resourceCode_arr.length; j++) {
                            resourceCode_arr.splice(j,1,true);
                        }
                    }
                
                }else{//取消选中
                    let resourceCode_arr = state.resourceCodeGroup[i];
                    if(resourceCode_arr != null && resourceCode_arr.length >0){
                        for (let j = 0; j <resourceCode_arr.length; j++) {
                            resourceCode_arr.splice(j,1,false);
                        }
                    }
                }
                
                break;
            }					
        }
    }

    //处理用户资源选择
    const handleUserResourceChange = (userResource:any,userResourceGroup_index:any,userResource_index:any) => {
        let resourceCode_arr = state.resourceCodeGroup[userResourceGroup_index];
        if(resourceCode_arr != null && resourceCode_arr.length >0){
            let count = 0;
            for (let i = 0; i <resourceCode_arr.length; i++) {
                if(resourceCode_arr[i] == true){
                    count++;
                }
            }
            if(count == resourceCode_arr.length){//如果全选
                tableRef.value!.toggleRowSelection(state.userResourceGroupList[userResourceGroup_index],true);
            }else{
                tableRef.value!.toggleRowSelection(state.userResourceGroupList[userResourceGroup_index],false);
            }
        }
    }

    //处理用户资源全选
    const handleUserResourceSelectAll = () => {
        if(state.userResourceGroupList != null && state.userResourceGroupList.length >0){
            
            for (let i = 0; i <state.userResourceGroupList.length; i++) {
                let userResourceGroup = state.userResourceGroupList[i];
                let count = 0;
                if(userResourceGroup.userResourceList != null && userResourceGroup.userResourceList.length >0){
                    for (let j = 0; j <userResourceGroup.userResourceList.length; j++) {
                        let userResource = userResourceGroup.userResourceList[j];
                        if(userResource.selected){
                            count++;
                        }
                    }
                    if(count == userResourceGroup.userResourceList.length){
                        tableRef.value!.toggleRowSelection(state.userResourceGroupList[userResourceGroup.index],true);
                    }
                }
            }
        }
    }


    //查询修改用户角色 
    const queryEditUserRole = () => {
        state.resourceCodeGroup.length = 0;

        proxy?.$axios({
            url: '/control/userRole/manage',
            method: 'get',
            params: {
                method : 'edit',
			    userRoleId: state.userRoleId,
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
                            let _userRole = null;
			    			if(key == "userRole"){
			    				let userRole = mapData[key];
			    				state.name = userRole.name;
								state.sort = userRole.sort;
                                _userRole = userRole;
			    			}else if(key == "userResourceGroupList"){
			    				let userResourceGroupList = mapData[key];
					    		if(userResourceGroupList != null && userResourceGroupList.length >0){
					    			for (let i:number = 0; i <userResourceGroupList.length; i++) {
										let userResourceGroup = userResourceGroupList[i];
										userResourceGroup.index = i;//因为表格使用type="expand"方式展示时，scope.$index获取的索引不连续,所以在数据里直接设置索引
							
										
										//定义资源代码数组
										let resourceCode_array = [];
												
										let count = 0;	
										
										if(userResourceGroup.userResourceList != null && userResourceGroup.userResourceList.length >0){
											for (let j = 0; j <userResourceGroup.userResourceList.length; j++) {
												let userResource = userResourceGroup.userResourceList[j];
												resourceCode_array.push(userResource.selected);
												if(userResource.selected == true){
													count++;
												}
											}
										}
										state.resourceCodeGroup[i] = resourceCode_array;//把数组resourceCode_array作为resourceCodeGroup数组的元素传入
									}
					    		}
					    		state.userResourceGroupList = userResourceGroupList;
					    		nextTick(()=> {
					    			handleUserResourceSelectAll();
					    		});
			    			}else if(key == "multiLanguageExtensionParameterMap"){
                                state.multiLanguageExtensionParameterMap = mapData[key];
                            }
                            if(_userRole != null){
                                for(let multiLanguageExtensionParameter in state.multiLanguageExtensionParameterMap){
                                    if(_userRole.multiLanguageExtensionMap['name-'+multiLanguageExtensionParameter] != undefined && _userRole.multiLanguageExtensionMap['name-'+multiLanguageExtensionParameter] != null){
                                        Object.assign(state.multiLanguageExtensionField, {['name-'+multiLanguageExtensionParameter] : _userRole.multiLanguageExtensionMap['name-'+multiLanguageExtensionParameter]});
                                    }
                                }
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
        formData.append('userRoleId', state.userRoleId);
			
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
            formData.append('sort', String(state.sort));
        }
        if(state.resourceCodeGroup != null && state.resourceCodeGroup.length >0){
            for (let i = 0; i <state.resourceCodeGroup.length; i++) {
                let resourceCode_arr = state.resourceCodeGroup[i];
                if(resourceCode_arr != null && resourceCode_arr.length >0){
                    for (let j = 0; j <resourceCode_arr.length; j++) {
                        if(resourceCode_arr[j]){
                            let userResourceGroup = state.userResourceGroupList[i];
                            if(userResourceGroup.userResourceList != null && userResourceGroup.userResourceList.length >0){
                                let userResource = userResourceGroup.userResourceList[j];
                                let tagId = (userResourceGroup.tagId == null ? '' : userResourceGroup.tagId);
                                
                                formData.append('resourceCode',userResourceGroup.code +"_"+tagId+"_"+userResource.code);
                            }
                            
                            
                        }
                    }
                }	
            }
        }
			

        proxy?.$axios({
            url: '/control/userRole/manage?method=edit',
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
			    		router.push({
							path : '/admin/control/userRole/list'
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
        store.setCacheComponents(String(router.currentRoute.value.name));

        if(router.currentRoute.value.query.userRoleId != undefined && router.currentRoute.value.query.userRoleId != ''){
			state.userRoleId = router.currentRoute.value.query.userRoleId as string;	
		}
		
		queryEditUserRole();

    }) 
</script>