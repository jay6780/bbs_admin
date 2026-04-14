import { createApp, type App } from 'vue';
import DocumentViewerDialog from '@/components/documentViewer/DocumentViewerDialog.vue'; 
import type { DynamicRoute } from '@/types';


/**
 * 创建并显示文档查看器组件
 * @param dynamicRoute 文档的路由元数据信息
 */
export function openDocumentViewer(dynamicRoute: DynamicRoute): void {
    // 1. 创建一个临时的 DOM 元素作为组件的挂载点
    const container = document.createElement('div');
    document.body.appendChild(container);

    let app: App | null = null; // 存储 Vue 应用实例

    /**
     * 销毁 Vue 实例和移除 DOM 元素
     */
    const onClose = () => {
        if (app) {
            // 销毁 Vue 应用实例，释放所有资源
            app.unmount();
        }
        
        // 从 DOM 中移除挂载点
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
        app = null;
    };

    app = createApp(DocumentViewerDialog, {
        dynamicRoute: dynamicRoute,
        onClose: onClose 
    });

    //挂载应用到创建的容器元素
    app.mount(container);
}