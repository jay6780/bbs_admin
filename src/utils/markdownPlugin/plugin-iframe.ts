import { type BytemdPlugin } from 'bytemd';

/**
 * 过滤iframe标签（未开源）
 * @returns 
 */
export default function filterIframe(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      
    }
  };
}