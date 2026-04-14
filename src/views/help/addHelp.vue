<!-- 添加话题 -->
<template>
    <div class="main">
        <div class="navbar">
            <el-button type="primary" plain @click="router.push({path: '/admin/control/help/list', query:{ visible : (route.query.visible != undefined ? route.query.visible:''),page:(route.query.page != undefined ? route.query.page:'')}})">返回</el-button>
        </div>
        <div class="data-form" >
            <el-form label-width="auto"  @submit.native.prevent>
                <el-form-item label="名称" :required="true" :error="error.name" >
                    <el-input v-model.trim="state.name" maxlength="50" :clearable="true" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="选择分类" :required="true"  :error="error.helpTypeId">
                    <el-select ref="helpType_ref" v-model="state.helpTypeIdGroup" size="large" class="custom-select-width" @click="loadHelpType" multiple placeholder="请选择">
                        <el-option v-for="item in state.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="内容" :required="true" :error="error.content">
                    <div v-show="!state.isMarkdown" style="width: 100%;">
                        <textarea ref="contentRef" :editorId="'addHelp'" style="width:100%;height:400px;visibility:hidden;"></textarea>
                    </div>
                    <div v-if="state.isMarkdown" style="width: 100%;">
                        <Editor :editorId="'addHelp'" :value="state.markdownContent" :plugins="state.addHelpEditorPlugin" :locale="zhHans" :sanitize="addHelpSanitize" placeholder="请输入内容..." @change="handleMarkdownChange"/>
                    </div>
                    
                </el-form-item>
                <el-form-item label=" ">
                    <el-button type="primary" size="large" class="submitButton" @click="submitForm" :disabled="state.submitForm_disabled">提交</el-button>
                </el-form-item>
            </el-form>
            
            <el-dialog title="选择分类" v-model="state.helpType_form">
                <div class="dialog-nav-breadcrumb">
                    <el-breadcrumb :separator-icon="ArrowRight">
                        <el-breadcrumb-item @click="queryHelpTypeList(1,'')">全部标签</el-breadcrumb-item>
                        <el-breadcrumb-item v-for="(value, key) in state.navigation" @click="queryHelpTypeList(1,String(key))">{{value}}</el-breadcrumb-item>
                        
                    </el-breadcrumb>
                </div>
                <div class="dialog-data-table" >
                    <el-table :data="state.tableData" @cell-click="cellExpandRow" :show-header="false" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                        <el-table-column label="选择" align="right" width="50">
                            <template #default="scope">
                                <el-radio v-model="state.helpTypeId" v-if="scope.row.childNodeNumber ==0" :label="state.helpTypeIdList[scope.$index]" >&nbsp;</el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column label="分类名称">
                            <template #default="scope">
                                <el-icon class="icon icon-folder" v-if="scope.row.childNodeNumber >0"><Folder /></el-icon>
                                <el-icon class="icon icon-file" v-if="scope.row.childNodeNumber ==0"><Document /></el-icon>{{scope.row.name}}
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination-wrapper" v-if="state.isShowPage">
                        <el-pagination background  @current-change="page" :current-page="state.currentpage"  :page-size="state.maxresult" layout="total, prev, pager, next,jumper" :total="state.totalrecord"></el-pagination>
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, nextTick, onActivated, onDeactivated, onMounted, reactive, ref } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { type AxiosResponse } from 'axios';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage, ElTable } from 'element-plus';
    import { processErrorInfo } from '@/utils/tool';
    import { createEditor } from '@/utils/editor';
    import { ArrowRight } from '@element-plus/icons-vue'
    import { markdownPlugins,sanitize } from '@/utils/markdownEditor';
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help as pluginHelp  } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { fileUpload } from '@/utils/markdownPlugin/plugin-file-upload';
    import { videoUpload } from '@/utils/markdownPlugin/plugin-video-upload';
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import { Editor } from '@bytemd/vue-next'

    import zhHans from 'bytemd/locales/zh_Hans.json'
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    
    const store = useStore(pinia);
    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();
    
    const {fileStorageSystem:store_fileStorageSystem} = storeToRefs(store)
 

    const helpType_ref = ref()
    const contentRef = ref()

    //Select 选择器选项
    interface OptionsItem {
        value: string;
        label: string;
    }

    const state = reactive({
        name :'',
        helpTypeId :'',//分类Id
        content :'',
        markdownContent:'',//markdown内容
        isMarkdown:false,//是否使用markdown编辑器
        supportEditor:10,//支持编辑器
        
        
        helpTypeIdGroup :[] as Array<string>,//分类Id组
        options:[] as Array<OptionsItem>,
        tableData: [],//表格内容
        parentId : '',//父Id
        helpTypeIdList: [] as Array<string>,//可选择Id集合
        totalrecord : 0, //总记录数
        currentpage : 1, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数
        isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误
        helpType_form:false,//是否显示问题标签表单
        navigation: '',
        
        
        error : {
            
        },
        
        userName :'',//用户名称
        
        addHelpEditor :{} as any,//添加帮助编辑器
        addHelpEditorCreateParameObject :{} as any,//添加帮助编辑器的创建参数
        
        submitForm_disabled:false,//提交按钮是否禁用

        addHelpEditorPlugin:[] as BytemdPlugin[],//添加话题Markdown编辑器插件
    });
    const error = reactive({
        name :'',
        helpTypeId :'',//分类Id
        content :'',
    });

    //处理Markdown
    const handleMarkdownChange = (value: string) => {
        state.markdownContent = value;
    }

    //白名单
    const addHelpSanitize = (schema: any) => {
        schema = sanitize(schema);
        
        schema.tagNames.push('iframe');
        return schema;
    }

    //处理切换到富文本编辑器
    const handleToggleRichtextEditor = (editorId: string) => {
        state.isMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.addHelpEditorCreateParameObject).length != 0) {//不等于空

                //创建富文本编辑器
                state.addHelpEditor = createEditor(
                    state.addHelpEditorCreateParameObject.ref, 
                    state.addHelpEditorCreateParameObject.availableTag, 
                    state.addHelpEditorCreateParameObject.uploadPath, 
                    state.addHelpEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addHelpEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value, state.isMarkdown,state.addHelpEditor,undefined)
                    }
                );
                state.addHelpEditor.html(state.addHelpEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
        
        
    }

    //处理切换到Markdown编辑器
    const handleToggleMarkdownEditor = (editorId: string) => {
        
        if (Object.keys(state.addHelpEditor).length != 0) {//不等于空
            state.addHelpEditorCreateParameObject.html = state.addHelpEditor.html();//切换时保存富文本内容
			state.addHelpEditor.remove();
            state.addHelpEditor = {};
		}
        state.isMarkdown = true;
    }


    //加载添加帮助页
    const loadAddHelp = () => {
        proxy?.$axios({
            url: '/control/help/manage',
            method: 'get',
            params: {
                method : 'add'
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let returnValueMap = result.data;
                        for(let key in returnValueMap){
		    				if(key == "supportEditor"){
                                state.supportEditor = returnValueMap[key];//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                if(state.supportEditor == 20 || state.supportEditor == 40){
                                    state.isMarkdown = true;
                                }
                            }
		    			}
		    			let availableTag = ['source', '|', 'preview', 'code', 
		    				        '|', 'justifyleft', 'justifycenter', 'justifyright',
		    				        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
		    				        'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 
		    				        'formatblock', 'fontname', 'fontsize','fullscreen', '/', 'forecolor', 'hilitecolor', 'bold',
		    				        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
		    				         'media','embedVideo','uploadVideo', 'insertfile','emoticons', 'table', 'hr',   'pagebreak',
		    				         'link', 'unlink'];
		    			let uploadPath = "control/help/manage?method=upload&userName="+state.userName+"&isStaff=true";


                        


			    		//创建富文本编辑器
                        if (Object.keys(state.addHelpEditorCreateParameObject).length === 0) {//等于空
                            if(!state.isMarkdown){
                                //创建富文本编辑器
                                state.addHelpEditor = createEditor(contentRef.value, availableTag, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    
                                },(editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,false,state.addHelpEditor,undefined)
                                });
                            }
                           
                            state.addHelpEditorCreateParameObject = {
                                ref:contentRef.value,
                                availableTag:availableTag,
                                uploadPath:uploadPath,
                                userGradeList:null,
                                editorId:contentRef.value.getAttribute('editorId'),
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

    //在线帮助列表 点击单元格选择
    const cellExpandRow = (row:any,column:any,event:any,cell:any) => {
        if(column.label=="选择"){
            if(row.childNodeNumber ==0){
                state.helpTypeIdGroup.push(row.id);
                
                state.helpTypeId = row.id;
                
                let obj:any =new Object();
                obj.value = row.id;
                obj.label = row.name;
                state.options.length = 0;//清空
                state.options.push(obj);
                
                
                //因为只允许选中一个，所以将已选择的清空
                if (Object.keys(state.helpTypeIdGroup).length >1) {
                    state.helpTypeIdGroup.shift();//从Array 头部移除元素
                }
                
                state.helpType_form = false;
            }
        }else if(column.label=="分类名称"){
            if(row.childNodeNumber >0){
                state.parentId = row.id;
                queryHelpTypeList(1,row.id);
            }
        }
    }

    //加载帮助分类
    const loadHelpType = () => {
	    	
        state.helpType_form = true;
        helpType_ref.value.blur();//使Select选择器失去焦点，并隐藏下拉框
        
        if(state.helpTypeIdGroup.length ==0){
            state.helpTypeId = "";
            state.options.length = 0;//清空	
        }
        
        
        //清空数据
        state.totalrecord = 0;//服务器返回的long类型已转为String类型
        state.currentpage = 1;
        state.totalpage = 1;//服务器返回的long类型已转为String类型
        state.maxresult = 12;
        state.isShowPage = false;//显示分页栏
        state.parentId = '';
        
        queryHelpTypeList(1,'');
    }
    //分页
    const page = (page:number) => {
        
        queryHelpTypeList(page, state.parentId);
    }
	    
    //查询分类
    const queryHelpTypeList = (page:number,parentId:string) => {
        state.tableData = [];
        state.helpTypeIdList = [];
        state.navigation = '';
        
        state.parentId = parentId;

        proxy?.$axios({
            url: '/control/helpType/manage',
            method: 'get',
            params: {
                method : 'helpTypePageSelect_move',
                parentId : parentId,
                page : page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let mapData = result.data;
			    		for(let key in mapData){
			    			if(key == "pageView"){
			    				let typeView = mapData[key];
					    		let typeList = typeView.records;
					    		if(typeList != null && typeList.length >0){
					    			for(let i = 0; i<typeList.length; i++){
					    				let type = typeList[i];
					    				state.helpTypeIdList.push(type.id);
					    			
					    			}
					    		
					    		
					    			state.tableData = typeList;
					 
					    			state.totalrecord = parseInt(typeView.totalrecord);//服务器返回的long类型已转为String类型
					    			state.currentpage = typeView.currentpage;
									state.totalpage = parseInt(typeView.totalpage);//服务器返回的long类型已转为String类型
									state.maxresult = typeView.maxresult;
									state.isShowPage = true;//显示分页栏
					    		}
			    			}else if(key == "navigation"){
			    				state.navigation = mapData[key];
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

    //选中分类
    const selectedHelpType = (val:any) => {
        state.helpTypeId = val;
    }

    //提交表单
    const submitForm = () => {
        state.submitForm_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        if(state.name != null){
            formData.append('name', state.name);
            
        }
        
        if(state.helpTypeIdGroup != null && state.helpTypeIdGroup.length >0){
            for(let i=0; i<state.helpTypeIdGroup.length; i++){
                let typeId = state.helpTypeIdGroup[i];
                formData.append('helpTypeId', typeId);
                break;
            }
        }
        
        if(state.isMarkdown){
            formData.append('isMarkdown', state.isMarkdown.toString());
            formData.append('markdownContent', state.markdownContent);
        }else{
            if(contentRef.value.value != null && contentRef.value.value !=''){
                formData.append('content', contentRef.value.value);
            }
        }
       

        
        proxy?.$axios({
            url: '/control/help/manage?method=add&t=',
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
							path : '/admin/control/help/list',
						});
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

			    		
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

        loadAddHelp();

        
    }) 


    //keep-alive 进入时
    onActivated (()=>{
        if (Object.keys(state.addHelpEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isMarkdown){
                //创建富文本编辑器
                state.addHelpEditor = createEditor(
                    state.addHelpEditorCreateParameObject.ref, 
                    state.addHelpEditorCreateParameObject.availableTag, 
                    state.addHelpEditorCreateParameObject.uploadPath, 
                    state.addHelpEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleToggleMarkdownEditor(state.addHelpEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,"",state.addHelpEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,false,state.addHelpEditor,undefined)
                    }
                );
            }
		}
    })

    // keep-alive 离开时
    onDeactivated (()=>{
        if (Object.keys(state.addHelpEditor).length != 0) {//不等于空
            state.addHelpEditor.remove();
            state.addHelpEditor = {};
        }
    })



</script>
<style scoped lang="scss">
.data-form{
    :deep(.bytemd){
        height: calc(100vh - 100px);
        
    }
    :deep(.CodeMirror-scroll){//让外层滚动条不滚动
        overscroll-behavior:  contain;
    }
    :deep(.bytemd-preview){//让外层滚动条不滚动
        overscroll-behavior:  contain;
    }
}
    
</style>