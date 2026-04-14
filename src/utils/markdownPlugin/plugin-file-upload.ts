import type { BytemdPlugin } from 'bytemd'
import { editorUpload, showNotifications } from '../markdownEditor';
import { visit } from 'unist-util-visit'
import remarkExclamationMark from '../micromark-extension-exclamationMark/remark-exclamationMark';



/**
 * 文件上传插件（未开源）
 * @param uploadPath 上传服务器地址
 * @param uploadFieldName 上传字段名称
 * @param fileStorageSystem 文件存储系统
 * @returns 
 */
export function fileUpload(uploadPath:string, uploadFieldName:string, fileStorageSystem:number): BytemdPlugin {
  return {
    
  }
}


