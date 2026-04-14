import type { DynamicRoute } from '@/types';
import { ref, onMounted } from 'vue';

/**
 * 这是一个组件定义对象，用于 Vue 服务化组件 (Modal Service)。
 * * 注意：template 属性已根据您的要求移除。
 * * 如果您现在使用 DocumentViewer.vue 文件来承载模板，请确保您的服务（DocumentService.ts）
 * 现在导入的是该 .vue 文件的编译后默认导出，而不是这个裸露的 setup/props 对象，
 * 除非您的构建流程能自动将 .vue 文件的模板注入到这个 setup/props 对象中。
 */
export const DocumentViewerComponent = {
    // 确保组件名称保持一致性，利于调试
    name: 'DocumentViewerDialog', 

    props: {
        // 文档的路由/名称信息
        dynamicRoute: {} as DynamicRoute ,
        // 关闭时回调的清理函数，由 DocumentService 提供
        onClose: { type: Function, required: true } 
    },
    
    // Setup 函数包含组件的反应式逻辑
    setup(props:any) {
        // 控制 ElDialog 的显示状态
        const visible = ref(false);
        
        onMounted(() => {
            // 组件挂载后延迟显示，以触发 ElDialog 的动画效果
            setTimeout(() => { visible.value = true; }, 50); 
        });

        // 处理对话框关闭事件 (包括点击关闭按钮或按 ESC)
        const handleDocumentClose = (done:any) => {
            visible.value = false;
            
            // 等待关闭动画结束 (~300ms) 后，执行服务传入的清理函数 (销毁实例)
            setTimeout(() => {
                props.onClose(); 
                if (done) done();
            }, 300); 
        };

        return {
            visible,
            handleDocumentClose
        };
    }
};