<!-- AI助手 -->
<template>
    <el-dialog title="AI助手" :z-index="900000" v-model="dialogVisible" :draggable="true" :before-close="handleClose" :close-on-click-modal="false" top="10vh" width="750">
        
        <div class="aiChatModule">
            <el-scrollbar ref="aiChatScrollbar" :max-height="state.chatInfoScrollbarMaxHeight" class="scrollbar">
                
                <div v-for="aiChatInfo in state.aiChatInfoList">

                    <!--AI发的消息 -->
                    <div class="friend" v-if="aiChatInfo.member == 20">
                        <div class="container">
                            <div :ref="'aiChat_'+aiChatInfo.requestId" class="aiChatContent">
                                <AiChatTemplate @click-onInsertImage="handleInsert" :html="aiChatInfo.content"></AiChatTemplate>
                                <!-- 
                                <a class="msg-del"></a> -->
                            </div>
                        </div>
                    </div>
                    <!--用户发的消息 -->
                    <div class="self" v-if="aiChatInfo.member == 10">
                        <div class="container">
                            <span>
                                <em>{{aiChatInfo.content}}</em>
                                <!-- 
                                <a class="msg-error" title="发送失败"></a> -->
                                <!-- 
                                <a class="msg-del"></a>  -->
                            </span>
                        </div>
                    </div>
                </div>
                <div class="friend" v-if="state.submitForm_disabled">
                    <el-skeleton :rows="1" animated class="skeleton"/>
                </div>
            </el-scrollbar>
            <el-empty :description="state.description" :image-size="90" v-if="state.aiChatInfoList == null || state.aiChatInfoList.length==0"/>
        </div>
       
        <template #footer>
            <span class="dialog-footer">
                <div class="aiChatForm">
                    <el-form :model="state" ref="formRef"  :rules="rules" @submit.native.prevent>
                        <div class="singleRow" >
                            <div class="leftCell">
                                <el-form-item :error="error.prompt">
                                    <el-input v-model="state.prompt" placeholder="我想提问的内容..." show-word-limit type="textarea" :disabled="!state.allowChat || !verifyPermissionMenu('/control/aiInterface/manage?method=assistant*','post')" :autosize="{ minRows: 2 }" @keydown.enter="handleKeyCode($event)"/>
                                
                                </el-form-item>
                            </div>
                            <div class="rightCell">
                                <el-button type="primary" @mousedown.native="submitForm" :disabled="!state.allowChat || !verifyPermissionMenu('/control/aiInterface/manage?method=assistant*','post')" >提问</el-button>
                            </div>
                        </div>
                    </el-form>
                </div>
            </span>
        </template>
    </el-dialog>

    
</template>
              

<script setup lang="ts">
    import { type ComponentInternalInstance, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from "vue";
    import { ElMessageBox} from "element-plus";
    import { type AxiosResponse } from "axios";
    import { processErrorInfo,verifyPermissionMenu } from '@/utils/tool';
    import axiosInstance from "@/utils/http";
    import type { AiChatInfo, AiChatInsertData, AiProduct} from "@/types";
    import { escapeVueHtml } from "@/utils/escape";
    import Prism from "prismjs";  
    import { customMarkdownToHtml } from "@/utils/markdownEditor";

    const props = withDefaults(
        defineProps<{
            show?: boolean; // moadl开关
        }>(),
        {}
    );
    const emits = defineEmits(["insert","close","dialogRef"]);
    const state = reactive({
        dialogVisible: props.show,
        aiProductList: [] as Array<AiProduct>,//AI大模型产品
        selectedInterfaceProduct :0,//当前使用的接口产品
        prompt :'',//提示词
        aiChatInfoList: [] as Array<AiChatInfo>,//对话信息
        chatInfoScrollbarMaxHeight:"calc(100vh - 350px)",

        allowChat :false,//允许对话

        description:" ",

        submitForm_disabled:false,//提交按钮是否禁用
    });
    const error = reactive({
        prompt :'',
    });
    const { dialogVisible } = toRefs(state);
    //AI对话信息滚动条
    const aiChatScrollbar = ref()

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    /**
     * 插入
     * @param type 0.无 10.纯文本 20.代码 30.图片
     * @param text 
     */
    const handleInsert = (type:number,text:string,language:string) => {
        // 回调
        emits("insert", {type:type, content: text,language:language} as AiChatInsertData);
    };


    //关闭
    const handleClose = (done:any) => {
        //prismjs工具栏显示按钮
        document.body.setAttribute('data-toolbar-order','copy-to-clipboard')
   
        emits("close", {type:0, content: "" } as AiChatInsertData);//type 0.无 10.纯文本 20.代码 30.图片
        // 关闭弹窗
        //dialogVisible.value = false;
        done();
    };

    //窗口Ref
    emits("dialogRef", dialogVisible);
    

    


    //查询AI助手
    const queryAssistant = () => {
        axiosInstance({
            url: '/control/aiInterface/manage',
            method: 'get',
            params: {
                method : 'assistant'
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
		    				if(key == "aiProductList"){//AI大模型产品
		    					state.aiProductList = returnValueMap[key];

                                if(state.aiProductList != null && state.aiProductList.length >0){
                                    state.selectedInterfaceProduct = state.aiProductList[0].interfaceProduct;//默认选择第一个
                                }

		    				}else if(key == "allowChat"){//是否允许对话
		    					state.allowChat = returnValueMap[key];;
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

    const checkPromptValue = (rule: any, value: any, callback: any) => {
        if(state.allowChat){
            if(state.prompt == null || state.prompt.trim() == ''){
                return callback(new Error('提问内容不能为空'));
            }
        }
     }
    //校验规则
    const rules = reactive({
        prompt: [{ validator: checkPromptValue, trigger: 'blur' }],
        //captchaValue: [{ validator: checkCaptchaValue, trigger: 'blur' }],
 
    })

    //处理回车
    const handleKeyCode = (event: any) => {
        if (event.keyCode == 13) {
            if (event.ctrlKey) {//ctrl + 回车
                event.preventDefault();
                submitForm();
            } else {//回车
                state.prompt += '\n';
                
            }
        }
    }

    //提交表单
    const submitForm = () => {
        state.submitForm_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
  
        if(state.selectedInterfaceProduct != null && state.selectedInterfaceProduct >0){
            formData.append('interfaceProduct', String(state.selectedInterfaceProduct)); 
        }
        if(state.prompt != null && state.prompt.trim() != ''){
            formData.append('prompt', state.prompt); 

            let selfChat:AiChatInfo ={
                content: state.prompt.trim(),//对话内容
                member: 10//对话成员    10.用户 20.AI
            }
            state.aiChatInfoList.push(selfChat);

            scrollToBottom();//滚动
        }
       
        //清空
        state.prompt = "";
        
        axiosInstance({
            url: '/control/aiInterface/manage?method=assistant',
            method: 'post',
            data: formData,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            timeout: 0,// 定义请求超时时间
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
			    if(result){
			    	if(result.code === 200){//成功
                        let chatInfo = result.data;
			    		if(chatInfo != null){
                            if(chatInfo.statusCode == null){
                                //处理自定义标签
                                let contentNode = document.createElement("div");
                                contentNode.innerHTML = customMarkdownToHtml(chatInfo.text) as string;
                                bindNode(contentNode);
                                let aiChatInfo:AiChatInfo ={
                                    requestId:chatInfo.requestId,
                                    content: escapeVueHtml(contentNode.innerHTML),//对话内容
                                    member: 20//对话成员    10.用户 20.AI
                                }
                                state.aiChatInfoList.push(aiChatInfo);

                                nextTick(()=>{
                                    //渲染代码
                                    let aiChatRefValue =  (proxy?.$refs['aiChat_'+aiChatInfo.requestId] as any);
                                    
                                    if(aiChatRefValue != undefined && aiChatRefValue[0]){
                                        renderBindNode(aiChatRefValue[0]); 
                                    }
                                            
                                    nextTick(()=> {
                                        setTimeout(function () {
                                            scrollToBottom();//滚动
                                        }, 0);
                                    });
                                });
                            }else{
                                let text = "状态码："+chatInfo.statusCode +"</br>  错误码："+chatInfo.errorCode +"</br>  错误信息："+chatInfo.errorMessage +"  "
                                ElMessageBox.alert(text , '错误', {
                                    type:'error',
                                    draggable: true,
                                    dangerouslyUseHTMLString: true,
                                    showConfirmButton: false
                                }).catch((error) => {
                                    console.log(error);
                                });
                            }
			    		}

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


    //递归绑定节点参数
    const bindNode = (node:any) => {
        
        
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");
                    
                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次
                
                    let html = '';
                    
                    //html = '<ai-chat-image-view src="'+src+'"></ai-chat-image-view>';
                    //接收来自defineEmits(['insertImage'])的参数      insertImage大写转为横线加小写(@insert-image) 
                    html = '<ai-chat-image-view src="'+src+'" @insert-image="onHandleInsert_renderTemplate"></ai-chat-image-view>';
                



                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点	 
                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }

                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){

                                    
                    let firstChildNode = null;//第一个子节点

                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }

                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null && firstChildNode.getAttribute("class").indexOf("language-") != -1){//Markdown代码
                        
                        let class_val = firstChildNode.className;
                        let lan_class = "";
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('language-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        if(firstChildNode.getAttribute("class").indexOf("language-mermaid") == -1){
                            childNode.className = "line-numbers "+lan_class;
                            childNode.setAttribute("data-prismjs-copy","复制");
                            childNode.setAttribute("data-prismjs-copy-error","按Ctrl+C复制");
                            childNode.setAttribute("data-prismjs-copy-success","复制成功");


                            let nodeHtml = "";

                            //删除code节点
                            let preChildNodeList = childNode.childNodes;
                            for(let p = 0;p < preChildNodeList.length;p++){
                                let preChildNode = preChildNodeList[p];
                                if(preChildNode.nodeName.toLowerCase() == "code" ){
                                    nodeHtml += preChildNode.innerHTML;
                                    preChildNode.parentNode.removeChild(preChildNode);
                                }
                                
                            }
                            
                            let dom = document.createElement('code');
                            dom.className = "line-numbers "+lan_class;
                            dom.innerHTML=nodeHtml;
                            
                        
                            childNode.appendChild(dom);
                        }
                    }
                }
                
                bindNode(childNode);

                
            }
        }
    }

    //递归渲染绑定节点
    const renderBindNode = (node:any) => {	
         //先找到子节点
         let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let firstChildNode:any = null;//第一个子节点
                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                   
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null){
                        
                        Prism.highlightAllUnder(childNode);
                    }
                }
                renderBindNode(childNode);
            }
        }
    }

    //代码插入到编辑器插件
    const insertToEditorPlugin = () => {
       // if(document.body.hasAttribute('data-toolbar-order')){
       //     return;
       // }

        //代码插入到编辑器
        Prism.plugins.toolbar.registerButton('insert-to-editor', function (env:any) {
            let element = env.element;

            
            let settings:any = {
                'insert': '插入',
                'insert-error': '插入错误',
                'insert-success': '已插入!',
                'insert-timeout': 5000
            };

            let prefix = 'data-prismjs-';
            for (let key in settings) {
                let attr = prefix + key;
                let startElement = element;
                while (startElement && !startElement.hasAttribute(attr)) {
                    startElement = startElement.parentElement;
                }
                if (startElement) {
                    settings[key] = startElement.getAttribute(attr);
                }
            }


            let linkInsert = document.createElement('button');
            linkInsert.className = 'insert-to-editor-button';
            linkInsert.setAttribute('type', 'button');
            let linkSpan = document.createElement('span');
            linkInsert.appendChild(linkSpan);

            setState('insert');


            registerEditor(linkInsert, {
                getText: function () {
                    return element.textContent;
                },
                getLanguage: function () {
                    return env.language;
                },
                success: function () {
                    setState('insert-success');
                    resetText();
                },
                error: function () {
                    setState('insert-error');
                    resetText();
                }
            });

            return linkInsert;



            
            function resetText() {
                setTimeout(function () { setState('insert'); }, settings['insert-timeout']);
            }

            //@param {"insert" | "insert-error" | "insert-success"} state
            function setState(state:any) {
                linkSpan.textContent = settings[state];
                linkInsert.setAttribute('data-insert-state', state);
            }

            /**
             * 当用户点击给定的元素时，给定的文本将被插入到编辑器。
             *
             * @param {HTMLElement} element
             * @param {CodeInfo} codeInfo
             *
             * @typedef CodeInfo
             * @property {() => string} getText
             * @property {() => void} success
             * @property {(reason: unknown) => void} error
             */
            function registerEditor(element:any, codeInfo:any) {
                element.addEventListener('click', function () {
                    insertCodeToEditor(codeInfo);
                });
            }

            /**
             * 
             * @param codeInfo 插入代码到编辑器
             */
            function insertCodeToEditor(codeInfo:any) {
                handleInsert(20,codeInfo.getText(),codeInfo.getLanguage());
            }

        });
    }


    

    //滚动到最底层
    const scrollToBottom = () => {
        nextTick(()=>{
            //滚动框高度
            let scrollbarHeight = aiChatScrollbar.value.wrapRef.childNodes[0].clientHeight;

            aiChatScrollbar.value.setScrollTop(scrollbarHeight); 
        })
    }

   

    onMounted(() => {
        //代码插入到编辑器插件
        insertToEditorPlugin();
       //prismjs工具栏显示按钮
      //  document.body.setAttribute('data-toolbar-order','copy-to-clipboard,insert-to-editor')
        queryAssistant();

        if(!verifyPermissionMenu('/control/aiInterface/manage?method=assistant*','post')){
            state.description = "您没有使用权限"
        }


    }) 
    

</script>
<style scoped lang="scss">
.aiChatModule {
    
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    background: #fff;
    min-height: 200px;
    .friend{
        margin: 0px 12px 26px 0px;
        position: relative;
        .container{
            position: relative;
            margin-left: 0px;
            margin-right: 30px;
        }
        .skeleton{
            width: 50%;
        }
        .msg-del{
            background: #ececec;
            color: #919191;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -10px;
            right: -10px;
            position: absolute;
            &::before {
                content: "\2716";
            }
            
        }
        .msg-del:hover {
            color: #86909c;
        }
        &:after{
            content: "";
            display: block;
            height: 0;
            clear: both;
            visibility: hidden;
        }
    }
    .self{
        margin: 0px 0px 26px 46px;
        position: relative;
        .container{
            position: relative;
            text-align: initial;
            margin-left: 50px;
            margin-right: 0px;
            span{
                min-height: 40px;
                min-width: 96px;
                font-size: 15px;
                border: 1px #fff solid;
                border-radius: 10px;
                position: relative;
                max-width: 94%;
                background: #fafafa;
                float: right;
                margin-right: 10px;
                em{
                    font-style: normal;
                    padding: 10px;
                    display: block;
                    line-height: 28px;
                    white-space:normal; word-break:break-all; 
                }
            }
        }
        .msg-del{
            background: #ececec;
            color: #919191;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -10px;
            left: -10px;
            position: absolute;
            &::before {
                content: "\2716";
            }
            
        }
        .msg-del:hover {
            color: #86909c;
        }
        .msg-error{
            background: #fef0f0;
            color: #F56C6C;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -5px;
            left: -15px;
            position: absolute;
            &::before {
                content: "!";
            }
            
        }
        .msg-error:hover {
            background: #fef0f0;
            color: #c45656;

            
        }
        
        &:after{
            content: "";
            display: block;
            height: 0;
            clear: both;
            visibility: hidden;

        }

            

    }
}

:deep(.aiChatContent) {
  //  word-break: break-word;
  //  line-height: 1.75;
    font-weight: 400;
  //  font-size: 14px;
  //  overflow-x: hidden;//此属性和 el-image延迟加载有冲突
    overflow-x: visible;
 //   color: #252933;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.5;
        margin-top: 35px;
        margin-bottom: 10px;
        padding-bottom: 5px;
    }
    h1 {
        font-size: 24px;
        line-height: 38px;
        margin-bottom: 5px;
    }
    h2 {
        font-size: 22px;
        line-height: 34px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e6eb;
    }
    h3 {
        font-size: 20px;
        line-height: 28px;
    }
    h4 {
        font-size: 18px;
        line-height: 26px;
    }
    h5 {
        font-size: 17px;
        line-height: 24px;
    }
    h6 {
        font-size: 16px;
        line-height: 24px;
    }
    p {
        line-height: inherit;
        margin-top: 22px;
        margin-bottom: 22px;
    }
    hr {
        border-top: 1px solid #c9cdd4;
        border-bottom: none;
        border-left: none;
        border-right: none;
        margin-top: 32px;
        margin-bottom: 32px;
    }
    code {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
        word-wrap : break-word;word-break : break-all;
        border-radius: 2px;
        overflow-x: auto;
        background-color: #fff5f5;
        color: #ff502c;
    //  font-size: 0.87em;
        padding: 0.065em 0.4em;
    }
    a {
        text-decoration: none;
        &:hover, &a:active {
            color: #275b8c;
        }
    }
    
    blockquote {
        color: #86909c;
        padding: 1px 23px;
        margin: 22px 0;
        border-left: 4px solid #c9cdd4;
        background-color: #FAFCFF;
        &::after {
            display: block;
            content: "";
        }
        &> p {
            margin: 10px 0;
        }
    }
    ol,
    ul {
        padding-left: 28px;
    }
    ol li,
    ul li {
        margin-bottom: 0;
        list-style: inherit;
    }
    ol li .task-list-item,
    ul li .task-list-item {
        list-style: none;
    }
    ol li .task-list-item ul,
    ol li .task-list-item ol,
    ul li .task-list-item ul,
    ul li .task-list-item ol {
        margin-top: 0;
    }
    ol ul,
    ol ol,
    ul ul,
    ul ol {
        margin-top: 3px;
    }
    ol li {
        padding-left: 6px;
    }
    .contains-task-list {
        padding-left: 0;
    }
    .task-list-item {
        list-style: none;
    }
    .task-list-item-checkbox{
        width: 15px;
        height: 15px;
        position: relative;
        top: 3px;
    }

    font-size: 15px;
    line-height: 1.8;
    color: #222;
    word-wrap : break-word;word-break : break-all;
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
    p{
        font-size:16px;
        word-wrap : break-word;word-break : break-all;
    }
    code[class*="language-"]{
        padding: 0 0;
    }
    pre code{/*连续字母数字换行*/
        word-break: break-all;
    }
    iframe{
        width:100%; height: 550px;padding:10px 0px; 
    }
    video{
        width:100%; height: 550px;padding:10px 0px; outline:none;
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
            margin-left:20px;
            list-style-type:disc;
        }
    }
}

@media (max-width: 720px) {
    .aiChatContent h1 {
      font-size: 24px;
    }
    .aiChatContent h2 {
      font-size: 20px;
    }
    .aiChatContent h3 {
      font-size: 18px;
    }
}

.aiChatForm{
     margin-top: 10px;
     background: #fff;
    /* 单行表单 */
    .singleRow{
        display: flex;justify-content:flex-start;align-items: stretch;
        .leftCell{
            width: 100%;

            :deep(.el-form-item__error){
                font-size: 14px; padding-top: 8px;
            }
        }
        .rightCell{
            margin-left: 12px;

            .el-button{
                font-size: 15px;
                height: calc(100% - 18px);
            }
            
        }
    }
 }
</style>

  