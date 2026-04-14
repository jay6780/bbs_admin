<!-- 添加话题 -->
<template>
    <div class="main">
        <div class="navbar">
            <el-button type="primary" plain @click="router.push({path: '/admin/control/topic/list', query:{ visible : (route.query.visible != undefined ? route.query.visible:''),page:(route.query.page != undefined ? route.query.page:'')}})">返回</el-button>
        </div>
        <div class="data-form" >
            <el-form label-width="120"  @submit.native.prevent>
                <el-form-item label="标题" :required="true" :error="error.title" >
                    <el-input v-model.trim="state.title" maxlength="150" :clearable="true" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="标签" :required="true" :error="error.tagId">
                    <el-select v-model="state.tagIdGroup" size="large" class="custom-select-width" @click="queryTagList" @change="selectedTag" no-match-text="还没有标签" placeholder="选择标签">
                        <template v-for="tag in state.options">
                            <el-option-group :key="'group-'+tag.id" :label="tag.name" v-if="tag.childNodeNumber >0">
                                <el-option v-for="childTag in tag.childTag" :key="'childTag-'+tag.id" :label="childTag.name" :value="childTag.id"><div class="option-group">{{ childTag.name }}</div></el-option>
                            </el-option-group>
                            <el-option v-else :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
                
                        </template>
                    </el-select>

                </el-form-item>
                <el-form-item label="排序" :required="true" :error="error.sort">
                    <el-input-number v-model="state.sort" controls-position="right" :min="0" :max="99999999"></el-input-number>
                    <div class="form-help" >数字越大越在前</div>
                </el-form-item>
                <el-form-item label="允许评论" :required="true">
                    <el-switch v-model="state.allow" ></el-switch>
                </el-form-item>
                <el-form-item label="精华" :error="error.essence">
                    <el-switch v-model="state.essence" ></el-switch>
                </el-form-item>
                <el-form-item label="状态" :required="true">
                    <el-radio-group v-model="state.status">
                        <el-radio :label="10">待审核</el-radio>
                        <el-radio :label="20">已发布</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="内容" :required="true" :error="error.content">
                    <div v-show="!state.isMarkdown" style="width: 100%;">
                        <textarea ref="contentRef" :editorId="'addTopic'" style="width:99%;height:400px;visibility:hidden;"></textarea>
                    </div>
                    <div v-if="state.isMarkdown" style="width: 100%;">
                        <Editor  :editorId="'addTopic'" :value="state.markdownContent" :plugins="state.addTopicEditorPlugin" :locale="zhHans" :editorConfig="markdownEditorConfig" :sanitize="addTopicSanitize" placeholder="请输入内容..." @change="handleMarkdownChange"/>
                    </div>
                </el-form-item>
                <el-form-item label=" ">
                    <el-button type="primary" size="large" class="submitButton" @mousedown.native="submitForm" :disabled="state.submitForm_disabled">提交</el-button>
                </el-form-item>
            </el-form>
            
            <!-- 选择提及用户 -->
            <div class="selectMentionUserModule">
                <el-dialog title="选择用户" :z-index="900000" v-model="state.popup_mentionUser" @close="closeMentionUser" :draggable="true" top="40vh" width="500">
                    <div class="search">
                        <el-form :inline="true" label-width="auto" @keyup.enter.native="searchMentionUser">
                            <el-form-item :error="error.keyword">
                                <el-input v-model.trim="state.keyword" maxlength="30" :clearable="true" placeholder="用户账号或呢称"></el-input>
                            </el-form-item>
                            
                            <el-form-item >
                                <el-button type="primary" size="large" @click="searchMentionUser" >搜索</el-button>
                            </el-form-item>
                            
                        </el-form>
                    </div>
                    <div class="mentionUserItem" v-for="mentionUser in state.mentionUserList" @click="selectMentionUser(mentionUser)">
                        <div class="left-layout">
                            <div class="avatarBox">
                            
                                <img v-if="mentionUser.avatarName != null" :src="mentionUser.avatarPath+'100x100/'+mentionUser.avatarName" class="img">
                                <img v-if="mentionUser.avatarName == null" :src="mentionUser.avatar" width="48" height="48" class="img"/>
                                
                            </div>
                        </div>
                        <div class="right-layout">
                            <span class="userInfo">{{mentionUser.nickname != null && mentionUser.nickname != '' ?mentionUser.nickname : mentionUser.account}}</span>
                        </div>
                    </div>
                </el-dialog>
            </div>
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
    import { dayjs, ElMessage } from 'element-plus';
    import { processErrorInfo } from '@/utils/tool';
    import { createEditor } from '@/utils/editor';
    import { markdownPlugins,markdownEditorConfig,sanitize, markdownToHtml } from '@/utils/markdownEditor';
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { fileUpload } from '@/utils/markdownPlugin/plugin-file-upload';
    import { videoUpload } from '@/utils/markdownPlugin/plugin-video-upload';
    import { hideContent } from '@/utils/markdownPlugin/plugin-hide-content';
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import zhHans from 'bytemd/locales/zh_Hans.json'
    import type { Tag, User } from '@/types';
    import { letterAvatar } from '@/utils/letterAvatar';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { Top, Bottom,Delete,Plus} from '@element-plus/icons-vue'
    import { Editor } from '@bytemd/vue-next'

    const store = useStore(pinia);
    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();

    const {fileStorageSystem:store_fileStorageSystem} = storeToRefs(store)
 

    const contentRef = ref()


    interface VoteOptionItem {
        id: string;
        text: string;
    }

    const state = reactive({
        title :'',
        tagId :'',//标签Id
        sort : 0,
        allow : true,
        essence: false,
        status :20,
        content :'',
        markdownContent:'',//markdown内容
        isMarkdown:false,//是否使用markdown编辑器
        supportEditor:10,//支持编辑器

        isVote:false,//是否发起投票
        voteTitle :'',
        voteMaxChoice :1,
        voteEndDate_format:'',
        voteEndDate :'',//截止时间
        voteOptions: [{
            id: '',
            text: ''
        }] as Array<VoteOptionItem>,

        popup_mentionUser :false,//是否弹出选择提及用户表单
        keyword :'',//关键词
        mentionUserList:[] as Array<User>,//提及用户集合
        mentionUserEditorId:'',//提及用户编辑器Id
        currentMarkdownEditor:{} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        isAllowLoadTagGroup:true,//是否允许加载标签组
        tagIdGroup :[],//标签Id组
        loading :false,//是否正在从远程获取数据
        //options: [] as Array<OptionsItem>,//Select 选择器标签数据
        options: [] as Array<Tag>,//Select 选择器标签数据

        


        userName :'',//用户名称
        userGradeList :[],//会员等级

        addTopicEditor :{} as any,//添加话题编辑器
        addTopicEditorCreateParameObject :{} as any,//添加话题编辑器的创建参数

        addTopicEditorPlugin:[] as BytemdPlugin[],//添加话题Markdown编辑器插件
        
        submitForm_disabled:false,//提交按钮是否禁用
    });
    const error = reactive({
        title :'',
        tagId :'',
        sort :'',
        essence :'',
        content :'',
        
        keyword :'',
        voteOption :'',
        voteTitle :'',
        voteMaxChoice :'',
        voteEndDate :'',
    });

    //处理Markdown
    const handleMarkdownChange = (value: string) => {
        state.markdownContent = value;
    }

    //白名单
    const addTopicSanitize = (schema: any) => {
        schema = sanitize(schema);
        
        schema.tagNames.push('iframe');
        return schema;
    }

    //markdown生成Html
    const onHtml = () => {
        let html = markdownToHtml(addTopicSanitize,state.addTopicEditorPlugin,state.markdownContent);
        console.log("Html内容--",html);
    }
    


    //投票 添加项
    const addItem = () => {
        state.voteOptions.push({
            id: '',
            text: ''
        });
    }
    //投票 删除项
    const removeItem = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if (index !== -1) {
            state.voteOptions.splice(index, 1);
        }
    }
    //投票 上移
    const moveUp = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if (index >0) {
            let upData = state.voteOptions[index - 1];
            state.voteOptions.splice(index - 1, 1);
            state.voteOptions.splice(index, 0, upData);
        }
    }
    //投票 下移
    const moveDown = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if ((index + 1) < state.voteOptions.length) {
            let downData = state.voteOptions[index + 1];
            state.voteOptions.splice(index + 1, 1);
            state.voteOptions.splice(index, 0, downData);
        }
    }


    //处理切换到富文本编辑器
    const handleToggleRichtextEditor = (editorId: string) => {
        state.isMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.addTopicEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.addTopicEditor = createEditor(
                    state.addTopicEditorCreateParameObject.ref, 
                    state.addTopicEditorCreateParameObject.availableTag, 
                    state.addTopicEditorCreateParameObject.uploadPath, 
                    state.addTopicEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addTopicEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isMarkdown,state.addTopicEditor,undefined)
                    });
            }
        })
        
        
    }

    //处理切换到Markdown编辑器
    const handleToggleMarkdownEditor = (editorId: string) => {
        
        if (Object.keys(state.addTopicEditor).length != 0) {//不等于空
			state.addTopicEditor.remove();
            state.addTopicEditor = {};
		}
        state.isMarkdown = true;
    }


    //显示、隐藏提及弹窗
    const mentionPopUp = (editorId: string,ctx:BytemdEditorContext| undefined) => {
       // console.log("显示、隐藏提及弹窗",editorId);
      
        state.popup_mentionUser = true;
        state.mentionUserEditorId = editorId;
        state.keyword = "";
        state.mentionUserList.length = 0;
        state.currentMarkdownEditor = ctx;
        error.keyword = "";
    }

    //关闭提及用户弹出框
    const closeMentionUser = () => {
        state.popup_mentionUser = false;
        state.currentMarkdownEditor = undefined;
    }

    //选择提及用户
    const selectMentionUser = (mentionUser:User) => {
        let url = "user/control/home?userName="+mentionUser.userName;
        let title = mentionUser.nickname != null && mentionUser.nickname != '' ? '@'+mentionUser.nickname : '@'+mentionUser.account;


        let forum = state.mentionUserEditorId.split("_")[0];//版块
        
        if(state.isMarkdown){
            state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
        }else{
            state.addTopicEditor.insertMention(url,title);
        }
        closeMentionUser();
    }


    //搜索提及用户
    const searchMentionUser = () => {
        state.mentionUserList.length = 0
        error.keyword = "";
        if(state.keyword == null || state.keyword.trim() == ''){
            error.keyword = "请输入用户账号或呢称";
            return;
        }
        proxy?.$axios({
            url: '/control/user/queryUser',//暂时使用查询提及用户API
            method: 'get',
            params:  {keyword:state.keyword},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let mentionUser = result.data;
		    			if(mentionUser != null){
                            let userList = new Array();
                            if(mentionUser.nickname != null && mentionUser.nickname !=''){
                                mentionUser.avatar = letterAvatar(mentionUser.nickname, 48);
                            }else{
                                mentionUser.avatar = letterAvatar(mentionUser.account, 48);
                            }
                            userList.push(mentionUser);
                            
                            state.mentionUserList = userList;
                        }else{
                            error.keyword = "当前用户不存在";
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



    //加载添加话题页
    const loadAddTopic = () => {
        proxy?.$axios({
            url: '/control/topic/manage',
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
		    				if(key == "userName"){
		    					state.userName = returnValueMap[key];
		    				}else if(key == "userGradeList"){
		    					state.userGradeList = returnValueMap[key];
		    				}else if(key == "supportEditor"){
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
				        'formatblock', 'fontname',  'fontsize','fullscreen',  '/', 'forecolor', 'hilitecolor', 'bold',
				        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
				         'media','embedVideo','uploadVideo', 'insertfile','emoticons','table', 'hr',   'pagebreak',
				         'link', 'unlink','hide','hidePassword','hideComment','hideGrade','hidePoint'];

                         let uploadPath = "control/topic/manage?method=upload&userName="+state.userName+"&isStaff=true";
                           
		    			
                        if (Object.keys(state.addTopicEditorCreateParameObject).length === 0) {//等于空
                            if(!state.isMarkdown){
                                 //创建富文本编辑器
                                state.addTopicEditor = createEditor(contentRef.value, availableTag, uploadPath, state.userGradeList,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isMarkdown,state.addTopicEditor,undefined)
                                });
                            }
                           
                            state.addTopicEditorCreateParameObject = {
                                ref:contentRef.value,
                                availableTag:availableTag,
                                uploadPath:uploadPath,
                                userGradeList:state.userGradeList,
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


    //查询标签
    const queryTagList = () => {
        if(!state.isAllowLoadTagGroup){
            return;
        }

        proxy?.$axios({
            url: '/control/tag/manage',
            method: 'get',
            params: {
                method : 'allTag'
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            state.isAllowLoadTagGroup = false;
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		state.options = result.data;
                        
			    	}else if(result.code === 500){//错误
			    		
			    		
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //选中标签
    const selectedTag = (val:any) => {
        state.tagId = val;
    }

    //提交表单
    const submitForm = () => {
        state.submitForm_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        if(state.title != null && state.title != ''){
            formData.append('title', state.title);
            
        }
        
        if(state.tagId != null && state.tagId != ''){
            formData.append('tagId', state.tagId); 
        }
        if(state.sort != null && state.sort >=0){
            
            formData.append('sort', String(state.sort));

        }


        formData.append('allow', state.allow.toString());
        formData.append('status', String(state.status));
        formData.append('essence', state.essence.toString());
        if(state.isMarkdown){
            formData.append('isMarkdown', state.isMarkdown.toString());
            formData.append('markdownContent', state.markdownContent);
        }else{
            if(contentRef.value.value != null && contentRef.value.value !=''){
                formData.append('content', contentRef.value.value);
            }
        }



        formData.append('isVote', state.isVote.toString());
        if(state.voteTitle != null && state.voteTitle != ''){
            formData.append('voteTitle', state.voteTitle);
        }
        formData.append('voteMaxChoice', String(state.voteMaxChoice));
        if(state.voteEndDate_format != null && state.voteEndDate_format != ''){
            state.voteEndDate = dayjs(state.voteEndDate_format).format('YYYY-MM-DD HH:mm:ss');
        }else{
            state.voteEndDate = '';
        }
        formData.append('voteEndDate', state.voteEndDate);

        if(state.voteOptions != null && state.voteOptions.length >0){
            for(let i=0; i<state.voteOptions.length; i++){
                let voteOption = state.voteOptions[i];
                formData.append('voteOptionTextList', voteOption.text);
                
            }
        }

        
        proxy?.$axios({
            url: '/control/topic/manage?method=add',
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
							path : '/admin/control/topic/list',
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

        loadAddTopic();

        
    }) 


    //keep-alive 进入时
    onActivated (()=>{
        if (Object.keys(state.addTopicEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isMarkdown){
                //创建富文本编辑器
                state.addTopicEditor = createEditor(
                    state.addTopicEditorCreateParameObject.ref, 
                    state.addTopicEditorCreateParameObject.availableTag, 
                    state.addTopicEditorCreateParameObject.uploadPath, 
                    state.addTopicEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleToggleMarkdownEditor(state.addTopicEditorCreateParameObject.editorId);
                    },
                    (editorId: string)=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    (editorId: string)=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addTopicEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isMarkdown,state.addTopicEditor,undefined)
                    }
                );

            }
			
		}
    })

    // keep-alive 离开时
    onDeactivated (()=>{
        if (Object.keys(state.addTopicEditor).length != 0) {//不等于空
            state.addTopicEditor.remove();
            state.addTopicEditor = {};
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
.option-group{
    margin-left: 24px;
} 
//隐藏选择器分组分割线
.el-select-group__wrap:not(:last-of-type) {
     padding-bottom: 0px;
}
.el-select-group__wrap:not(:last-of-type)::after {
    height: 0px;
}
</style>