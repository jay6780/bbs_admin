<template>
    <el-config-provider :locale="localLanguage">
        <router-view></router-view> 
    </el-config-provider>
</template>

<script setup lang="ts">
  import { getCurrentInstance, type ComponentInternalInstance, onMounted} from 'vue'
  import pinia from '@/store/store'
  import {useStore} from '@/store'
  import { storeToRefs } from 'pinia';
  //国际化 -- 指定显示中文
  import localLanguage from 'element-plus/es/locale/lang/zh-cn'//中文
    import {type AxiosResponse } from 'axios';


  const store = useStore(pinia);
  
  const {permissionMenuList:store_permissionMenuList} = storeToRefs(store)

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

 
  //查询文件存储系统
  const queryManageFramework = () => {
        
        proxy?.$axios({
            url: '/control/manage/index',
            method: 'get',
            params:  {
            }
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
                        for(let key in mapData){
							if(key == "fileStorageSystem"){
                                let fileStorageSystem = mapData[key];
                               // store_fileStorageSystem.value = fileStorageSystem
                                store.setFileStorageSystem(fileStorageSystem)
                            }else if(key == "permissionMenuList"){
                                let permissionMenuList = mapData[key];
                                store_permissionMenuList.value = permissionMenuList
                            }
                        }
                      
                    }else if(result.code === 500){//错误
                        
                        
                    }
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }


    onMounted(() => {
       
        queryManageFramework();

        
    }) 
</script>

