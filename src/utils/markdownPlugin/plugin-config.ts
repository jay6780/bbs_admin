import { type BytemdPlugin,type BytemdEditorContext } from 'bytemd';
import { nextTick } from 'vue';

/**
 * 配置（未开源）
 * @param scroll 获得焦点时是否滚动
 */
export default function config(scroll: boolean=true): BytemdPlugin {
 
  return {
    editorEffect(ctx: BytemdEditorContext) {
        
        
    }
  };
}

