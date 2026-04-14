<!--文档查看器-->
<template>
    <el-dialog title="前台文档" v-model="state.showDocument" :before-close="handleDocumentClose" width="100%" :fullscreen="true" :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <div class="frontendDocumentModule">
            
            <div class="document-container">
                <el-row >
                    <el-col :span="24"><div class="nodeName">{{props.dynamicRoute.name}} {{ props.dynamicRoute.routeEnumMapper }}</div></el-col>
                </el-row>
            </div>
            <el-row >
                <el-col :span="24">
                    <div class="doc">
                        <div v-html="state.documentContent" class="markdown-body-custom documentMarkdownContent"></div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </el-dialog>
</template>
<script lang="ts" setup>
    import { reactive,onMounted } from 'vue';

    import { type AxiosResponse } from 'axios';
    import type { DynamicRoute } from '@/types';
    import { processErrorInfo } from '@/utils/tool';
    import { marked, type Tokens } from 'marked';
    import axiosInstance from '@/utils/http';
  


    const props = defineProps<{
        dynamicRoute: DynamicRoute;
        onClose: () => void;
    }>();

    const state = reactive({
        documentContent : '',
        showDocument:false,//是否显示文档
    });

    //查看文档
    const viewDocument = () => {
        axiosInstance({
            url: '/control/frontendDocument/details',
            method: 'get',
            params: {
                routeEnumMapper:props.dynamicRoute.routeEnumMapper,
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        processMarkdown(result.data)
			    	}else if(result.code === 500){
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    // 自定义 Marked.js 渲染器 解析这种格式链接： [链接文本](#anchor:目标ID)  ##目标ID
    const customRenderer = {
        /**
         * 拦截所有 Markdown 链接 [text](href)
         * @param {Object} token - marked.Tokens.Link 对象。
         */
        link(token: Tokens.Link) {
            // 解构获取旧签名中的参数
            const { href, title, text } = token;

            // 1. 匹配自定义语法
            if (href.startsWith('#anchor:')) {
                
                const anchorId = '#' + href.substring('#anchor:'.length);
                return `<a 
                    class="custom-anchor-link" 
                    onclick="scrollToAnchor('${anchorId}'); return false;"
                    title="${title || ''}"
                >${text}</a>`;
            }

            //对于不匹配 #custom: 的普通链接，使用 marked.js 的默认处理
            return marked.Renderer.prototype.link.call(this, token);
            
        },
        /**
         * @param text 标题的文本内容 (可能已包含内联元素的 HTML，例如 '<b>Bold</b> Title')
         * @param level 标题的级别 (1-6)
         * @returns 返回自定义 HTML 字符串或 false 使用默认渲染
         */
        heading(token:Tokens.Heading) {
            // 获取标题级别：在 Tokens.Heading 中，级别是 depth 属性
            const level = token.depth;
            
            // 获取标题文本：在 Tokens.Heading 中，文本是 text 属性 (这是原始文本，未经过 inline 渲染)
            const text = token.text; 

            //应该对内联内容进行渲染。
            // 使用 marked.parseInline() 来确保标题文本中的粗体、斜体等被正确转换为 HTML。
            const parsedText = marked.parseInline(text);

            // 确保只有 h2, h3 标签被处理
            if (level < 2 || level > 3) {
                // 返回 false, null, 或 undefined 都可以让 Marked.js 使用默认渲染器
                return false; 
            }
            // 生成 ID 的逻辑 (基于原始文本进行标准化处理)
            const id = text
                //.toLowerCase()
                .replace(/<[^>]*>?/gm, '') // 移除任何内联 HTML 标签（例如来自粗体、斜体的标签）
               // .replace(/[^\w\s-]/g, '') // 移除特殊字符
                .replace(/[\s_]+/g, '-') // 用短横线替换空格
                .replace(/`/g, '') //移除反引号 ` 符号
                .trim();
            // 返回带 ID 的标题 HTML
            // 注意：因为这里的 text 是原始文本，如果标题内有加粗等 Markdown 语法，
            // Marked.js 默认不会对其进行内联渲染。如果你希望内联内容被渲染，需要调用 marked.parseInline(token.text)。
            return `<h${level} id="${id}">${parsedText}</h${level}>`;
        }
    };


    // 处理markdown文档
    async function processMarkdown(markdownSource: string): Promise<void> {
        try {
            // 启用自定义渲染器和扩展
            marked.use({ 
                renderer: customRenderer
            }); 
            const htmlResult = await marked.parse(markdownSource);
            state.documentContent = htmlResult;
        } catch (error) {
            console.error('Markdown 转换失败:', error);
        } finally {
            
        }
    }


    
   
    //处理文档弹窗关闭
    const handleDocumentClose = (done?: () => void) => {
        state.showDocument = false; // 隐藏对话框
        // 等待动画结束 (~300ms) 后，执行服务传入的清理函数
        setTimeout(() => {
            props.onClose(); 
            if (done) done();
        }, 300); 
    };

     onMounted(() => {
        viewDocument();
        // 组件挂载后延迟显示，以触发 Element Plus 的动画效果
        setTimeout(() => { state.showDocument = true; }, 50);
    });

</script>
<!--全局样式-->
<style>
.el-dialog .el-dialog__headerbtn {
    position: fixed;
    right: 15px;
}
</style>
<style scoped lang="scss">
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