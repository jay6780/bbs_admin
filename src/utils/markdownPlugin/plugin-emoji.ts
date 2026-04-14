import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
import { render, h, } from 'vue';
import { EmojiPicker } from '@/components';
import { deleteEmojiEvent, handleClick } from './emojiEvent';


/**
 * 表情插件（未开源）
 * @returns 
 */
export function emoji(): BytemdPlugin {
  return {
  }
}




