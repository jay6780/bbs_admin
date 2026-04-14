import { type BytemdPlugin } from 'bytemd';

/**
 * 过滤font标签（未开源）
 * @returns 
 */
export default function filterFont(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      
    },
  };
}