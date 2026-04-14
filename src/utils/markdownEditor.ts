import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'

import zhHansGfm from '@bytemd/plugin-gfm/locales/zh_Hans.json'
import zhHansMath from '@bytemd/plugin-math/locales/zh_Hans.json'
import zhHansMerimaid from './mermaid-extension/locales/zh_Hans.json'
import 'juejin-markdown-themes/dist/juejin.min.css';
//import 'github-markdown-css/github-markdown.css';
import 'katex/dist/katex.css' //公式
import highlightCode from "./markdownPlugin/plugin-highlight-code";
import linkTarget from "./markdownPlugin/plugin-link-target";
import filterIframe from "./markdownPlugin/plugin-iframe";
import floatToolbar from "./markdownPlugin/plugin-float-toolbar";
import { toggleEditor } from "./markdownPlugin/plugin-toggle-editor";
import axiosInstance from "./http";
import {type AxiosResponse } from "axios";
import { ElMessage, ElNotification } from "element-plus";
import { SHA256} from 'crypto-js';
import { h } from "vue";
import { getProcessor } from 'bytemd';
import type { BytemdPlugin } from 'bytemd'
import filterFont from "./markdownPlugin/plugin-font";
import mermaid from "./mermaid-extension";

//ByteMD插件
export const markdownPlugins = [
   
]

export const markdownEditorConfig = {
    //lineNumbers: true, //是否在编辑器左侧显示行号
}

/**
 * 白名单
 * @param schema 
 * https://github.com/syntax-tree/hast-util-sanitize/blob/main/lib/schema.js#L21
 * @returns 
 */
export const sanitize = (schema: any) => {
	

	return schema;
}


/**
 * Markdown转Html
 * markdownToHtml(addTopicSanitize,addTopicEditorPlugin.value,'# markdown text');
 * @param sanitize 白名单
 * @param plugin 插件
 * @param markdownText markdown文本
 */
export const markdownToHtml = (sanitize: any,plugin: any,markdownText: string) => {
	return "";
}


/**
 * 自定义Markdown转Html
 * customMarkdownToHtml('# markdown text');
 * @param markdownText markdown文本
 */
export const customMarkdownToHtml = (markdownText: string) => {
	
	return "";
}



/**
 * 文件上传
 * @param files 文件集合
 * @param insert 回调
 * @param uploadServer 上传服务器地址
 * @param uploadFieldName 上传字段名称
 * @param dir 文件类型 image、file、media
 * @param fileStorageSystem 文件存储系统
 */
export function editorUpload(files:File[], callback: (url: string, title: string,errorMessage: string) => void,uploadServer:string,uploadFieldName:string,dir:string,fileStorageSystem:number) {
	
    
    
}

/**
 * 显示Notification 通知
 * @param files 
 */
export async function showNotifications(files: File[]) {
	let map = new Map<string,any>();
	
	for(let i = 0; i < files.length; i++) {
	  let file = files[i];
	  let notification = await ElNotification({
		title: '通知',
		message: h('p', null, [
		  h('span', null, file.name+' 上传中 '),
		  h('span', { style: 'color: #67C23A', id:'uploadMessage_'+SHA256(file.name) }, ''),
		]),//VNode
		duration:0
	  })
	  map.set(file.name,notification)
	}
	return map;
}