<!-- 修改前台API -->
<template>
    <div class="main" >
        <div class="navbar">
            <el-button type="primary" plain @click="router.push({path: '/admin/control/frontendApi/list'})">返回</el-button>
        </div>
        <div class="data-form label-width-blank frontendApiModule" >
            <el-form label-width="auto"  @submit.native.prevent>
                <el-form-item label="名称" :required="true" :error="error.frontendApi.name">
                    <el-input v-model.trim="state.name" maxlength="80" :clearable="true" show-word-limit></el-input>
                </el-form-item>

                <el-form-item label="URL路径" :required="true" :error="error.frontendApi.url">
                    <el-input v-model.trim="state.url" maxlength="80" :clearable="true" show-word-limit @blur="checkUrl"></el-input>
                    <div class="form-help" >URL路径只能输入由数字、26个英文字母、下划线和或者左斜杆组成，左斜杆不能在最后面或连续出现。例一：/aaa/ggg &nbsp;&nbsp; 例二：/aaa </div>
                </el-form-item>
                <el-form-item label="请求方法" :required="true" :error="error.frontendApi.httpMethod">
                    <el-radio-group v-model="state.httpMethod" @change="checkUrl" >
                        <el-radio label="GET">GET</el-radio>
                        <el-radio label="POST">POST</el-radio>
                        <el-radio label="">不限制</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="访问需要登录">
                    <el-switch v-model="state.requiresLogin" :disabled="state.disabled_requiresLogin"></el-switch>
                    <div class="form-help" >访问URI为/user/开头的地址则默认需要登录后才能访问，本设置无效</div>
                    <div v-if="state.disabled_requiresLogin" style="color: #ffa940;">URL路径为/user/开头的地址不需要设置本参数</div>
                </el-form-item>
                <el-form-item label="功能" :required="true" :error="error.frontendApi.routeEnumMapper">
                    <el-select v-model="state.routeGroup" @change="selectedRouteGroup" size="large" class="custom-select-width" placeholder="选择组">
                        <el-option v-for="dynamicRouteGroup in state.customDynamicRouteGroupList" :key="dynamicRouteGroup.groupEnum" :label="dynamicRouteGroup.name" :value="dynamicRouteGroup.groupEnum"></el-option>
                    </el-select>
                    <el-select class="placeholder custom-select-width" v-model="state.routeEnumMapper" size="large" placeholder="选择功能">
                        <el-option v-for="dynamicRoute in state.customDynamicRouteList" :key="dynamicRoute.routeEnumMapper" :label="dynamicRoute.name" :value="dynamicRoute.routeEnumMapper"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 话题--话题分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6010100'">
                    <el-form-item label="选择标签" :error="error.configTopicPage.tagId">
   
                        <el-select v-model="state.configTopicPage.tagIdGroup" size="large" class="custom-select-width" v-show="state.configTopicPage.tag_transferPrameter == false" @change="selectedTopicTag" @click="loadTopicTag" multiple no-match-text="还没有标签" placeholder="请选择">
                            <template v-for="tag in state.configTopicPage.tagOptions">
                                <el-option-group :key="'group-'+tag.id" :label="tag.name" v-if="tag.childNodeNumber >0">
                                    <el-option v-for="childTag in tag.childTag" :key="'childTag-'+tag.id" :label="childTag.name" :value="childTag.id"><div class="option-group">{{ childTag.name }}</div></el-option>
                                </el-option-group>
                                <el-option v-else :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
                    
                            </template>
                        </el-select>
                        <el-switch class="placeholder" v-model="state.configTopicPage.tag_transferPrameter" active-text="传递标签参数"/>
                    </el-form-item>
                    <el-form-item label="排序" :required="true" :error="error.configTopicPage.sort">
                        <el-select v-model="state.configTopicPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configTopicPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configTopicPage.maxResult" >
                        <el-col :span="5"><el-input v-model.trim="state.configTopicPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configTopicPage.pageCount" >
                        <el-col :span="5"><el-input v-model.trim="state.configTopicPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 话题--评论分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6010300'">
                    <el-form-item label="排序" :required="true" :error="error.configCommentPage.sort">
                        <el-select v-model="state.configCommentPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configCommentPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configCommentPage.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configCommentPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configCommentPage.pageCount" >
                        <el-col :span="8"><el-input v-model.trim="state.configCommentPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 话题--相似话题-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6011300'">
                    <el-form-item label="显示记录数" :error="error.configSimilarTopic.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configSimilarTopic.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 话题--热门话题-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6011400'">
                    <el-form-item label="显示记录数" :error="error.configHotTopic.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configHotTopic.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 话题--话题精华分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6011500'">
                    <el-form-item label="排序" :required="true" :error="error.configTopicFeaturedPage.sort">
                        <el-select v-model="state.configTopicFeaturedPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configTopicFeaturedPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configTopicFeaturedPage.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configTopicFeaturedPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configTopicFeaturedPage.pageCount" >
                        <el-col :span="8"><el-input v-model.trim="state.configTopicFeaturedPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>

                <!-- 问答--问题分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6020100'">
                    <el-form-item label="选择标签" :error="error.configQuestionPage.tagId">
                        <el-select ref="page_question_tag_ref" size="large" class="custom-select-width"  v-model="state.configQuestionPage.tagIdGroup" v-show="state.configQuestionPage.tag_transferPrameter == false" @click="loadQuestionTag" multiple placeholder="请选择">
                            <el-option v-for="item in state.configQuestionPage.tagOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-switch class="placeholder" v-model="state.configQuestionPage.tag_transferPrameter" active-text="传递标签参数"/>
                    </el-form-item>
                    <el-form-item label="过滤条件">
                        <el-select v-model="state.configQuestionPage.filterCondition" size="large" class="custom-select-width"  v-show="state.configQuestionPage.filterCondition_transferPrameter == false" placeholder="请选择">
                            <el-option v-for="item in state.configQuestionPage.filterConditionOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-switch class="placeholder" v-model="state.configQuestionPage.filterCondition_transferPrameter" active-text="传递过滤参数"/>
                    </el-form-item>
                    <div class="form-help" >选择'传递过滤参数'时接收参数字段为filterCondition，全部：值为空或10 &nbsp; 未解决：20 &nbsp; 已解决：30 &nbsp; 积分悬赏：40 &nbsp; 现金悬赏：50</div>
                
                    <el-form-item label="排序" :error="error.configQuestionPage.sort">
                        <el-select v-model="state.configQuestionPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configQuestionPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configQuestionPage.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configQuestionPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configQuestionPage.pageCount" >
                        <el-col :span="8"><el-input v-model.trim="state.configQuestionPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    
                    
                    <el-dialog title="选择标签" v-model="state.configQuestionPage.question_tag_form">
                        <div class="dialog-nav-breadcrumb">
                            <el-breadcrumb :separator-icon="ArrowRight">
                                <el-breadcrumb-item @click="queryQuestionTag(1,'')">全部标签</el-breadcrumb-item>
                                <el-breadcrumb-item v-for="(value, key) in state.configQuestionPage.navigation" @click="queryQuestionTag(1,String(key))">{{value}}</el-breadcrumb-item>
                                
                            </el-breadcrumb>
                        </div>
                        <div class="dialog-data-table" >
                            <el-table :data="state.configQuestionPage.tableData" @cell-click="cellExpandRow_questionTag" :show-header="false" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                                <el-table-column label="选择" align="right" width="50">
                                    <template #default="scope">
                                        <el-radio v-model="state.configQuestionPage.tagId" v-if="scope.row.childNodeNumber ==0" :label="state.configQuestionPage.tagIdList[scope.$index]" >&nbsp;</el-radio>
                                    </template>
                                </el-table-column>
                                <el-table-column label="标签名称">
                                    <template #default="scope">
                                        <el-icon class="icon icon-folder" v-if="scope.row.childNodeNumber >0"><Folder /></el-icon>
                                        <el-icon class="icon icon-file" v-if="scope.row.childNodeNumber ==0"><Document /></el-icon>{{scope.row.name}}
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="pagination-wrapper" v-if="state.configQuestionPage.isShowPage">
                                <el-pagination background  @current-change="questionTagPage" :current-page="state.configQuestionPage.currentpage"  :page-size="state.configQuestionPage.maxresult" layout="total, prev, pager, next,jumper" :total="state.configQuestionPage.totalrecord"></el-pagination>
                            </div>
                        </div>
                    </el-dialog>
                </div>
                <!-- 问答--答案分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6020300'">
                    <el-form-item label="排序" :required="true" :error="error.configAnswerPage.sort">
                        <el-select v-model="state.configAnswerPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configAnswerPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configAnswerPage.maxResult" >
                       <el-col :span="8"><el-input v-model.trim="state.configAnswerPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configAnswerPage.pageCount" >
                        <el-col :span="8"><el-input v-model.trim="state.configAnswerPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 问答--相似问题-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6021100'">
                    <el-form-item label="显示记录数" :error="error.configSimilarQuestion.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configSimilarQuestion.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                <!-- 红包--领取红包用户分页 -->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6070200'">
                    <el-form-item label="排序" :required="true" :error="error.configRedEnvelopeUserPage.sort">
                        <el-select v-model="state.configRedEnvelopeUserPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configRedEnvelopeUserPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="显示记录数" :error="error.configRedEnvelopeUserPage.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configRedEnvelopeUserPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                </div>
                 <!-- 广告--图片广告 -->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6100100'" class="table-container">
                    <el-table :data="state.configImageAd.tableList" row-key="key" tooltip-effect="dark" :show-header="false" stripe :style="{ width: '100%' }" empty-text="没有项">
                        <el-table-column label="表单">
                            <template #default="scope">	
                                
                                <el-form-item label="图片名称" :required="true" :error="error.configImageAd.name.get(scope.row.key)">
                                    <el-input v-model.trim="state.configImageAd.name[scope.row.key]" maxlength="40" :clearable="true" show-word-limit></el-input>
                                </el-form-item>
                                <el-form-item :label="'图片名称（'+value+'）'" :error="error.configImageAd.multiLanguageExtensionField.get(scope.row.key+'name-'+key)" v-for="(value,key) in state.multiLanguageExtensionParameterMap">
                                    <el-input v-model.trim="state.configImageAd.multiLanguageExtensionField[scope.row.key+'name-'+key]" maxlength="50" :clearable="true" show-word-limit></el-input>
                                </el-form-item>
                                <el-form-item label="图片链接" :error="error.configImageAd.link.get(scope.row.key)">
                                    <el-input v-model.trim="state.configImageAd.link[scope.row.key]" maxlength="200" :clearable="true" show-word-limit></el-input>
                                </el-form-item>
                                <el-form-item label="图片" :error="error.configImageAd.imagePath.get(scope.row.key)" >
                                     <el-upload action="#" v-model:file-list="state.configImageAd.uploadImgs[scope.row.key]" list-type="picture-card" :auto-upload="false" :on-change="(file: UploadFile, fileList:UploadUserFile[]) => {configImageAd_handleChange(file, fileList, scope.row.key)}" :accept="'image/*'">
                                    
                                        <el-icon><Plus /></el-icon>
                                        <template #file="{ file }">
                                            <div>
                                                <!-- 因为移动el-upload时回显ile.url会发生错误，所以url地址转为base64格式图片  -->
                                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                                                <span class="el-upload-list__item-actions">
                                                <span
                                                    class="el-upload-list__item-preview"
                                                    @click="configImageAd_openImagePreview(file)"
                                                >
                                                    <el-icon><zoom-in /></el-icon>
                                                </span>
                                                <span
                                                    class="el-upload-list__item-delete"
                                                    @click="configImageAd_handleImageRemove(file,state.configImageAd.uploadImgs[scope.row.key],scope.row.key)"
                                                >
                                                    <el-icon><Delete /></el-icon>
                                                </span>
                                                </span>
                                            </div>
                                        </template>
                                    </el-upload>


                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="right" width="200">
                            <template #default="scope">	
                                <el-button size="large" :icon="Top" circle @click.prevent="configImageAd_moveUp(scope.row,scope.$index)" title="上移"></el-button>
                                <el-button size="large" :icon="Bottom" circle @click.prevent="configImageAd_moveDown(scope.row,scope.$index)" title="下移"></el-button>
                                <el-button size="large" :icon="Delete" circle @click.prevent="configImageAd_removeItem(scope.row,scope.$index)" title="删除"></el-button>
                            </template>
                        </el-table-column>
                        
                    </el-table>

                    <el-form-item  label=" ">
                        <div class="item-button"><el-button size="large" :icon="Plus" @click="configImageAd_addItem">添加项</el-button></div>
                         <!-- 图片预览 -->
                         <el-image-viewer v-if="state.configImageAd.isImageViewer" @close="configImageAd_closeImagePreview" :url-list="[state.configImageAd.localImageUrl]" hide-on-click-modal/>
                    </el-form-item>
                </div>
                <!-- 在线帮助--在线帮助分页-->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6110100'">
                    <el-form-item label="选择分类" :error="error.configHelpPage.helpTypeId">
                        <el-select ref="page_helpType_ref" v-model="state.configHelpPage.helpTypeIdGroup" size="large" class="custom-select-width"  v-if="state.configHelpPage.helpType_transferPrameter == false" @click="load_page_helpType" multiple placeholder="请选择">
                            <el-option v-for="item in state.configHelpPage.helpTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-switch class="placeholder" v-model="state.configHelpPage.helpType_transferPrameter" active-text="传递分类参数"/>
                    </el-form-item>
                    <el-form-item label="排序" :error="error.configHelpPage.sort">
                        <el-select v-model="state.configHelpPage.sort" size="large" class="custom-select-width"  placeholder="请选择">
                            <el-option v-for="item in state.configHelpPage.sortOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示记录数" :error="error.configHelpPage.maxResult" >
                        <el-col :span="8"><el-input v-model.trim="state.configHelpPage.maxResult" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    <el-form-item label="页码显示总数" :error="error.configHelpPage.pageCount" >
                        <el-col :span="8"><el-input v-model.trim="state.configHelpPage.pageCount" maxlength="9" :clearable="true" show-word-limit></el-input></el-col>
                    </el-form-item>
                    
                    
                    
                    <el-dialog title="选择分类" v-model="state.configHelpPage.helpType_form">
                        <div class="dialog-nav-breadcrumb">
                            <el-breadcrumb :separator-icon="ArrowRight">
                                <el-breadcrumb-item @click="query_page_helpType(1,'')">全部分类</el-breadcrumb-item>
                                <el-breadcrumb-item v-for="(value, key) in state.configHelpPage.navigation" @click="query_page_helpType(1,String(key))">{{value}}</el-breadcrumb-item>
                                
                            </el-breadcrumb>
                        </div>
                        <div class="dialog-data-table" >
                            <el-table :data="state.configHelpPage.tableData" @cell-click="cellExpandRow_page_helpType" :show-header="false" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                                <el-table-column label="选择" align="right" width="50">
                                    <template #default="scope">
                                        <el-radio v-model="state.configHelpPage.helpTypeId" v-if="scope.row.childNodeNumber ==0" :label="state.configHelpPage.helpTypeIdList[scope.$index]" >&nbsp;</el-radio>
                                    </template>
                                </el-table-column>
                                <el-table-column label="分类名称">
                                    <template #default="scope">
                                    <el-icon class="icon icon-folder" v-if="scope.row.childNodeNumber >0"><Folder /></el-icon>
                                    <el-icon class="icon icon-file" v-if="scope.row.childNodeNumber ==0"><Document /></el-icon>{{scope.row.name}}
                                </template>
                                </el-table-column>
                            </el-table>
                            <div class="pagination-wrapper" v-if="state.configHelpPage.isShowPage">
                                <el-pagination background  @current-change="page_helpTypePage" :current-page="state.configHelpPage.currentpage"  :page-size="state.configHelpPage.maxresult" layout="total, prev, pager, next,jumper" :total="state.configHelpPage.totalrecord"></el-pagination>
                            </div>
                        </div>
                    </el-dialog>
                </div>
                
                <!-- 在线帮助部分--推荐在线帮助-->
                <div  v-if="state.routeEnumMapper == 'CUSTOM_6110200'" class="table-item-container">
                    <el-table :data="state.configRecommendedHelp.tableList" row-key="key" tooltip-effect="dark" :show-header="false" stripe :style="{ width: '100%' }" empty-text="没有项">
                        <el-table-column label="索引" align="center" width="50">
                            <template #default="scope">	
                                {{scope.$index+1}}
                            </template>
                        </el-table-column>
                        <el-table-column label="帮助名称" >
                            <template #default="scope">	
                                {{scope.row.name}}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="right" width="200">
                            <template #default="scope">	
                                <el-button size="large" :icon="Top" circle @click.prevent="recommendHelp_moveUp(scope.row,scope.$index)" title="上移"></el-button>
                                <el-button size="large" :icon="Bottom" circle @click.prevent="recommendHelp_moveDown(scope.row,scope.$index)" title="下移"></el-button>
                                <el-button size="large" :icon="Delete" circle @click.prevent="recommendHelp_removeItem(scope.row,scope.$index)" title="删除"></el-button>
                            </template>
                        </el-table-column>
                        
                    </el-table>
                    <el-form-item>
                        <div class="item-button"><el-button size="large" :icon="Plus" @click="recommendHelp_loadHelp">添加项</el-button></div>
                    </el-form-item>
                
                    <el-dialog title="选择帮助" v-model="state.configRecommendedHelp.help_form">
                        <div class="dialog-nav-search">
                            <el-form :inline="true" label-width="auto" @submit.native.prevent   >
                                <el-form-item :error="error.configRecommendedHelp.keyword" >
                                    <el-tooltip content="不限制请留空" placement="top">
                                        <el-input v-model.trim="state.configRecommendedHelp.keyword" @keyup.enter.native="recommendHelp_helpPage(1)" maxlength="50" placeholder="关键词"></el-input>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item >
                                    <el-button type="primary" size="large" class="submitButton" @click="recommendHelp_helpPage(1)" >搜索</el-button>
                                </el-form-item>
                                
                            </el-form>
                        </div>
                        <div class="dialog-data-table" >
                            <el-table :data="state.configRecommendedHelp.tableData" @cell-click="cellExpandRow_recommendHelp" :show-header="false" tooltip-effect="dark" :style="{ width: '100%' }" stripe empty-text="没有内容">
                                <el-table-column label="选择" align="right" width="50">
                                    <template #default="scope">
                                        <el-checkbox v-model="state.configRecommendedHelp.helpIdGroup[scope.$index]" @click.native.prevent="radioClickEvent($event)">&nbsp;</el-checkbox>
                                    </template>
                                </el-table-column>
                                <el-table-column label="帮助名称">
                                    <template #default="scope">
                                        {{scope.row.name}}
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="pagination-wrapper" v-if="state.configRecommendedHelp.isShowPage">
                                <el-pagination background  @current-change="recommendHelp_helpPage" :current-page="state.configRecommendedHelp.currentpage"  :page-size="state.configRecommendedHelp.maxresult" layout="total, prev, pager, next,jumper" :total="state.configRecommendedHelp.totalrecord"></el-pagination>
                            </div>
                        </div>
                    </el-dialog>
                </div>
                <!-- 其它 -- 自定义HTML -->
                <div v-show="state.routeEnumMapper == 'CUSTOM_6150100'">
                    <el-form-item label="内容" :error="error.configCustomHtml.content" >
                        <div class="editor-container">
                            <el-affix target=".editor-container" :offset="state.configCustomHtml.editorToolbarHeightFromTop" @scroll="onAffixEditor">
                                <div class="toolbar-container">
                                    <div class="toolbar">
                                        <!-- :hide-after="0" 还会有过渡动画，需要将transition设置为空字符串禁用过渡动画才能避免鼠标快速划过时的视觉残留 -->
                                        <el-tooltip effect="dark" content="上传图片" placement="top" transition=" " :hide-after="0">
                                            <div class="functionIcon" @click="onEditorUpload('image')"><el-icon class="icon"><Picture /></el-icon></div>
                                        </el-tooltip>
                                        <el-tooltip effect="dark" content="上传视频" placement="top" transition=" " :hide-after="0">
                                            <div class="functionIcon" @click="onEditorUpload('media')"><el-icon class="icon"><VideoCamera /></el-icon></div>
                                        </el-tooltip>
                                        <el-tooltip effect="dark" content="上传文件" placement="top" transition=" " :hide-after="0">
                                            <div class="functionIcon" @click="onEditorUpload('file')"><el-icon class="icon"><DocumentAdd /></el-icon></div>
                                        </el-tooltip>
                                    </div>
                                </div>
                            </el-affix>
                            
                            <textarea ref="configCustomHtml_htmlContent_ref" v-model="state.configCustomHtml.content" placeholder="请输入代码"></textarea>
                        </div>
                    </el-form-item>
                </div>
                
                <!-- 其它--热门搜索词 -->
                <div v-if="state.routeEnumMapper == 'CUSTOM_6150200'">
                    <el-form-item v-for="(formOption, index) in state.configHotSearchTerm.formOptions" label="搜索词"  :prop="'configHotSearchTerm.formOptions.' + index + '.value'">
                        
                        <el-col :span="14">
                            <el-input v-model.trim="formOption.value" maxlength="40"></el-input>
                        </el-col>
                        <el-col :span="6" :offset="1">
                            <el-button size="large" :icon="Top" circle @click.prevent="configHotSearchTerm_moveUp(formOption)" title="上移"></el-button>
                            <el-button size="large" :icon="Bottom" circle @click.prevent="configHotSearchTerm_moveDown(formOption)" title="下移"></el-button>
                            <el-button size="large" :icon="Delete" circle @click.prevent="configHotSearchTerm_removeItem(formOption)" title="删除"></el-button>
                        </el-col>
                        
                    </el-form-item>
                    <el-form-item label=" ">
                        <div class="item-button"><el-button size="large" :icon="Plus" @click="configHotSearchTerm_addItem">添加项</el-button></div>
                    </el-form-item>
                </div>

                
                <el-form-item label=" ">
                    <el-button type="primary" size="large" class="submitButton" @click="submitForm" :disabled="state.submitForm_disabled">提交</el-button>
                </el-form-item>
            </el-form>
            
            
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, markRaw, nextTick, onMounted, reactive, ref, watch } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { type AxiosResponse } from 'axios';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage, type UploadFile, type UploadUserFile } from 'element-plus';
    import { getType, processErrorInfo_object, toBase64Image } from '@/utils/tool';
    import type { ConfigImageAd, DynamicRoute, DynamicRouteGroup, Help, Tag } from '@/types';
    import { Top, Bottom,Delete,Plus,ArrowRight} from '@element-plus/icons-vue'
    import { storeToRefs } from 'pinia';
    import CodeMirror from "codemirror";
    import "codemirror/lib/codemirror.css";
    import "codemirror/mode/xml/xml";
    import "codemirror/mode/javascript/javascript";
    import "codemirror/mode/css/css";
    import "codemirror/mode/htmlmixed/htmlmixed";
    import "codemirror/mode/vue/vue";
    import "codemirror/addon/display/placeholder";
import { editorUpload, showNotifications } from '@/utils/markdownEditor';
    
    const store = useStore(pinia);
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();

    const page_question_tag_ref = ref()
    const page_helpType_ref = ref()
    const configCustomHtml_htmlContent_ref = ref()
    const {fileStorageSystem:store_fileStorageSystem} = storeToRefs(store)

    //Select 选择器选项
    interface OptionsItem {
        value: string;
        label: string;
    }

    const state = reactive({
        id :'',
        name :'',
        url :'',
        httpMethod :'GET',
        requiresLogin :false,//访问需要登录
        routeEnumMapper: '',
        routeGroup: '',
        customDynamicRouteGroupList:[] as Array<DynamicRouteGroup>,//自定义动态路由组集合
        multiLanguageExtensionParameterMap: {} as Map<string,string>,//多语言扩展参数
        customDynamicRouteList:[] as Array<DynamicRoute>,//自定义动态路由集合
        disabled_requiresLogin:false,
        
        configTopicPage :{//话题--话题分页
            isAllowLoadTagGroup:true,//是否允许加载标签组	
            tagIdGroup :[] as Array<string>,//标签Id组
            tagOptions: [] as Array<Tag>,//Select 选择器标签数据,
            
            sortOptions: [{//排序
                    value: 1,
                    label: '按发表时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按发表时间 旧 -> 新'
                }, {
                    value: 3,
                    label: '按回复时间 新 -> 旧'
                }, {
                    value: 4,
                    label: '按回复时间 旧 -> 新'
                }],
                
            tagId: '',
            tagName :'',//标签名称
            tag_transferPrameter: false,
            sort: 1,
            maxResult: '',
            pageCount: '',
        },
        configCommentPage:{//话题--评论分页
            sortOptions: [{//排序
                    value: 1,
                    label: '按发布时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按发布时间 旧 -> 新'
                }],
            sort: 1,
            maxResult: '',
            pageCount: '',
        },
        configSimilarTopic :{//话题--相似话题
            maxResult: '',
        },
        configHotTopic :{//话题--热门话题
            maxResult: '',
        },
        configTopicFeaturedPage :{//话题--话题精华分页
            sortOptions: [{//排序
                    value: 1,
                    label: '按发表时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按发表时间 旧 -> 新'
                }],
            sort: 1,
            maxResult: '',
            pageCount: '',
        },
        configQuestionPage :{//问答--问题分页	
            tagIdGroup :[] as Array<string>,//标签Id组
            tagOptions:[] as Array<OptionsItem>,
            tableData: [],//表格内容
            parentId : '',//父Id
            tagIdList: [] as Array<string>,//可选择Id集合
            totalrecord : 0, //总记录数
            currentpage : 1, //当前页码
            totalpage : 1, //总页数
            maxresult: 12, //每页显示记录数
            isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误
            question_tag_form:false,//是否显示问题标签表单
            navigation: '',
            sortOptions: [{//排序
                    value: 1,
                    label: '按发表时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按发表时间 旧 -> 新'
                }, {
                    value: 3,
                    label: '按回答时间 新 -> 旧'
                }, {
                    value: 4,
                    label: '按回答时间 旧 -> 新'
                }],
                    
            filterConditionOptions: [{//过滤条件
                    value: 10,
                    label: '全部'
                }, {
                    value: 20,
                    label: '未解决'
                }, {
                    value: 30,
                    label: '已解决'
                }, {
                    value: 40,
                    label: '积分悬赏'
                }, {
                    value: 50,
                    label: '现金悬赏'
                }],
            tagId: '',
            tag_transferPrameter: false,
            filterCondition: 10,
            filterCondition_transferPrameter: false,
            sort: 1,
            maxResult: '',
            pageCount: '',
        },
        configAnswerPage :{//问答--答案分页
            sortOptions: [{//排序
                    value: 1,
                    label: '按回答时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按回答时间 旧 -> 新'
                }],
            sort: 1,
            maxResult: '',
            pageCount: '',
        },
        configSimilarQuestion :{//问答--相似问题
            maxResult: '',
        },
        configRedEnvelopeUserPage :{//红包--领取红包用户分页
            sortOptions: [{//排序
                    value: 10,
                    label: '按领取时间 新 -> 旧'
                }, {
                    value: 20,
                    label: '按领取时间 旧 -> 新'
                }],
            sort: 10,
            maxResult: '',
        },
        configImageAd :{//广告--图片广告
            tableList:[] as any,
            uploadImgs:{} as Record<string, any[]>,//上传图片集合
            localImageUrl:'' as string | undefined,//本地预览图
            isImageViewer: false,//是否显示图片查看器
            name: {} as Record<string, string>,  
            link:  {} as Record<string, string>,
            imagePath: {} as Record<string, string>,
            multiLanguageExtensionField : {} as Record<string, string>, //多语言扩展字段
        },
        configHelpPage :{//在线帮助--在线帮助分页
            helpTypeIdGroup :[] as Array<string>,//分类Id组
            helpTypeOptions:[] as Array<OptionsItem>,
            tableData: [],//表格内容
            parentId : '',//父Id
            helpTypeIdList: [] as Array<string>,//可选择Id集合
            totalrecord : 0, //总记录数
            currentpage : 1, //当前页码
            totalpage : 1, //总页数
            maxresult: 12, //每页显示记录数
            isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误
            helpType_form:false,//是否显示帮助分类表单
            navigation: '',
            
            helpType_transferPrameter:false,
            sortOptions: [{//排序
                    value: 1,
                    label: '按发布时间 新 -> 旧'
                }, {
                    value: 2,
                    label: '按发布时间 旧 -> 新'
                }],
            helpTypeId: '',
            maxResult: '',
            pageCount: '',
            sort : 1,
        },
        configRecommendedHelp:{//在线帮助--推荐在线帮助
            help_form:false,//是否显示帮助表单
            
            keyword: '',//关键词
            tableList :[] as any,
            helpIdGroup :[] as Array<boolean>,//帮助Id组
            tableData: [] as any,//表格内容
            totalrecord : 0, //总记录数
            currentpage : 1, //当前页码
            totalpage : 1, //总页数
            maxresult: 12, //每页显示记录数
            isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误
        },
        configCustomHtml:{//其它 -- 自定义HTML
            content:'',
            editor: {} as any,//编辑器
            editorToolbarHeightFromTop: 106,//编辑器工具栏距顶部高度
        },
        configHotSearchTerm:{//其它--热门搜索词
            formOptions: [] as any,
        },

        submitForm_disabled:false,//提交按钮是否禁用
    });
    const error = reactive({
        frontendApi:{
            name :'',
            url :'',
            httpMethod :'',
            requiresLogin: '',
            routeEnumMapper: '',
        },
        configTopicPage :{//话题--话题分页
            tagId: '',
            tag_transferPrameter: '',
            sort: '',
            maxResult: '',
            pageCount: '',
        },
        configCommentPage:{//话题--评论分页
            sort: '',
            maxResult: '',
            pageCount: '',
        },
        configSimilarTopic :{//话题--相似话题
            maxResult: '',
        },
        configHotTopic :{//话题--热门话题
            maxResult: '',
        },
        configTopicFeaturedPage :{//话题--话题精华分页
            sort: '',
            maxResult: '',
            pageCount: '',
        },
        configQuestionPage :{//问答--问题分页
            tagId: '',
            tagName :'',//标签名称
            tag_transferPrameter: '',
            sort: '',
            maxResult: '',
            pageCount: '',
        },
        configAnswerPage :{//问答--答案分页
            sort: '',
            maxResult: '',
            pageCount: '',
        },
        configSimilarQuestion :{//问答--相似问题
            maxResult: '',
        },
        configRedEnvelopeUserPage :{//红包--领取红包用户分页
            sort: '',
            maxResult: '',
        },
        configImageAd :{//广告--图片广告
            name: new Map(),
            link: new Map(),
            imagePath: new Map(),
            multiLanguageExtensionField : new Map(),
        },
        configHelpPage :{//在线帮助--在线帮助分页
            helpTypeId: '',
            maxResult: '',
            pageCount: '',
            sort: '',
        },
        configRecommendedHelp:{//在线帮助--推荐在线帮助
            keyword: '',//关键词
        },
        configCustomHtml:{//其它 -- 自定义HTML
            content: '',
        },
        configHotSearchTerm:{//其它--热门搜索词

        },
    });

    //查询修改前台API
    const queryEditFrontendApi = () => {
        proxy?.$axios({
            url: '/control/frontendApi/manage',
            method: 'get',
            params: {
                method : 'editFrontendApi',
                frontendApiId : state.id
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        const { frontendApi, customDynamicRouteGroupList, multiLanguageExtensionParameterMap } = result.data;
                        if(frontendApi){
                            state.name = frontendApi.name;
                            state.url = frontendApi.url;
                            state.httpMethod = frontendApi.httpMethod;
                            state.requiresLogin = frontendApi.requiresLogin;
                            state.routeEnumMapper = frontendApi.routeEnumMapper;
                            state.multiLanguageExtensionParameterMap = multiLanguageExtensionParameterMap;
                            if(frontendApi.configObject){
                                if(frontendApi.routeEnumMapper == "CUSTOM_6010100"){//话题分页
                                    Object.assign(state.configTopicPage, {
                                        tagId: frontendApi.configObject.tagId,
                                        tagName: frontendApi.configObject.tagName,
                                        tag_transferPrameter: frontendApi.configObject.tag_transferPrameter,
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });
                                    if(frontendApi.configObject.tagId){
                                        state.configTopicPage.tagIdGroup.push(frontendApi.configObject.tagId)
                                        loadTopicTag()//加载话题标签
                                    }
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6010300"){//评论分页
                                    Object.assign(state.configCommentPage, {
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6011300"){//相似话题
                                    Object.assign(state.configSimilarTopic, {
                                        maxResult: frontendApi.configObject.maxResult,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6011400"){//热门话题
                                    Object.assign(state.configHotTopic, {
                                        maxResult: frontendApi.configObject.maxResult,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6011500"){//话题精华分页
                                    Object.assign(state.configTopicFeaturedPage, {
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6020100"){//问题分页
                                    Object.assign(state.configQuestionPage, {
                                        tagId: frontendApi.configObject.tagId,
                                        tag_transferPrameter: frontendApi.configObject.tag_transferPrameter,
                                        filterCondition: frontendApi.configObject.filterCondition,
                                        filterCondition_transferPrameter:frontendApi.configObject.filterCondition_transferPrameter,
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });
                                    if(frontendApi.configObject.tagId){

							        	state.configQuestionPage.tagIdGroup.push(frontendApi.configObject.tagId)
							        	let obj:any =new Object();
										obj.value = frontendApi.configObject.tagId;
										obj.label = frontendApi.configObject.tagName;
										state.configQuestionPage.tagOptions.length = 0;//清空
										state.configQuestionPage.tagOptions.push(obj);
                                    }
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6020300"){//答案分页
                                    Object.assign(state.configAnswerPage, {
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6021100"){//相似问题
                                    Object.assign(state.configSimilarQuestion, {
                                        maxResult: frontendApi.configObject.maxResult,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6070200"){//领取红包用户分页
                                    Object.assign(state.configRedEnvelopeUserPage, {
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                    });
                                }else if(frontendApi.routeEnumMapper == "CUSTOM_6100100"){//图片广告
                                     frontendApi.configObject.forEach((configImageAd:ConfigImageAd ) => {

                                        const rowKey = Math.random().toString(36).slice(2) + Date.now();

                                        state.configImageAd.name[rowKey] = configImageAd.name;
                                        state.configImageAd.link[rowKey] = configImageAd.link;
                                        state.configImageAd.imagePath[rowKey] = configImageAd.imagePath;

                                        const multiMap = configImageAd.multiLanguageExtensionField as Record<string, any>;


                                        //处理多语言扩展字段
                                        for (let langKey in state.multiLanguageExtensionParameterMap) {
                                            // 构造字段名，例如 "name-en_US"
                                            const fieldKey = 'name-' + langKey;
                                            
                                           const backendValue = multiMap[fieldKey];

                                            if (backendValue !== undefined && backendValue !== null) {
                                                state.configImageAd.multiLanguageExtensionField[rowKey +fieldKey] = backendValue;
                                            } 
                                        }

                                        if (configImageAd.imagePath) {
                                            state.configImageAd.uploadImgs[rowKey] = [{
                                                url: configImageAd.imagePath,
                                                name: configImageAd.name
                                            }];
                                        } else {
                                            state.configImageAd.uploadImgs[rowKey] = [];
                                        }

                                        state.configImageAd.tableList.push({
                                            key: rowKey
                                        });

                                    });
                                }if(frontendApi.routeEnumMapper == "CUSTOM_6110100"){//在线帮助分页
                                    Object.assign(state.configHelpPage, {
                                        helpTypeId: frontendApi.configObject.helpTypeId,
                                        helpTypeName: frontendApi.configObject.helpTypeName,
                                        helpType_transferPrameter: frontendApi.configObject.helpType_transferPrameter,
                                        sort: frontendApi.configObject.sort,
                                        maxResult: frontendApi.configObject.maxResult,
                                        pageCount: frontendApi.configObject.pageCount,
                                    });

                                    if(frontendApi.configObject.helpTypeId){
							        	state.configHelpPage.helpTypeIdGroup.push(frontendApi.configObject.helpTypeId)
							        	let obj:any =new Object();
										obj.value = frontendApi.configObject.helpTypeId;
										obj.label = frontendApi.configObject.helpTypeName;
										state.configHelpPage.helpTypeOptions.length = 0;//清空
										state.configHelpPage.helpTypeOptions.push(obj);
                                    }
                                }if(frontendApi.routeEnumMapper == "CUSTOM_6110200"){///推荐在线帮助
                                    if(frontendApi.configObject.recommendHelpList != null && frontendApi.configObject.recommendHelpList.length >0){
                                        frontendApi.configObject.recommendHelpList.forEach((help:Help ) => {
                                            state.configRecommendedHelp.tableList.push({
                                                id: help.id,
                                                name:help.name,
                                            });
                                        });
                                    }
                                 }if(frontendApi.routeEnumMapper == "CUSTOM_6150100"){//自定义HTML
                                    Object.assign(state.configCustomHtml, {
                                        content: frontendApi.configObject.content,
                                    });
                                 }if(frontendApi.routeEnumMapper == "CUSTOM_6150200"){//热门搜索词
                                    if(frontendApi.configObject.searchTermList != null && frontendApi.configObject.searchTermList.length >0){
                                        frontendApi.configObject.searchTermList.forEach((item:string, index:number) => {
                                            state.configHotSearchTerm.formOptions.push({
										    	key: item,
												value: item
								            });
                                        });
                                    }
                                 }
                            }
                            
                        }
                        if(customDynamicRouteGroupList){
                            state.customDynamicRouteGroupList =customDynamicRouteGroupList;
                            

                            if(state.customDynamicRouteGroupList != null && state.customDynamicRouteGroupList.length >0){
                                A:for(let i=0; i<state.customDynamicRouteGroupList.length; i++){
                                    let dynamicRouteGroup = state.customDynamicRouteGroupList[i];
                                    if(dynamicRouteGroup.dynamicRouteList != null && dynamicRouteGroup.dynamicRouteList.length >0){
                                        state.customDynamicRouteList = dynamicRouteGroup.dynamicRouteList;
                                        for(let j=0; j<dynamicRouteGroup.dynamicRouteList.length; j++){
                                            let dynamicRoute = dynamicRouteGroup.dynamicRouteList[j];
                                            if(state.routeEnumMapper == dynamicRoute.routeEnumMapper){
                                                state.routeGroup = dynamicRouteGroup.groupEnum;
                                                break A;
                                            }
                                            
                                        }
                                    }
                                }
                            }
                        }
			    	}else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo_object(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //选中路由组
    const selectedRouteGroup = (val:any) => {
      
        //清空
        state.routeEnumMapper = "";
        
        state.customDynamicRouteList = [];
            
        if(state.customDynamicRouteGroupList != null && state.customDynamicRouteGroupList.length >0){
            for(let i=0; i<state.customDynamicRouteGroupList.length; i++){
                let dynamicRouteGroup = state.customDynamicRouteGroupList[i];
                if(dynamicRouteGroup.groupEnum == val){
                    if(dynamicRouteGroup.dynamicRouteList != null && dynamicRouteGroup.dynamicRouteList.length >0){
                         state.customDynamicRouteList = dynamicRouteGroup.dynamicRouteList;
                        for(let j=0; j<dynamicRouteGroup.dynamicRouteList.length; j++){
                            let dynamicRoute = dynamicRouteGroup.dynamicRouteList[j];
                                
                            //默认选择第一项
                            state.routeEnumMapper = dynamicRoute.routeEnumMapper;
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }

    //校验URL路径
    const checkUrl = () => {
        error.frontendApi.url = "";


        proxy?.$axios({
            url: '/control/frontendApi/manage',
            method: 'get',
            params: {
                method : 'checkUrl',
                url: state.url,
                httpMethod: state.httpMethod,
                frontendApiId: state.id,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		
			    	}else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo_object(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    //选中话题标签
    const selectedTopicTag = (val:any) => {
        //因为只允许选中一个，所以将已选择的清空
        if (Object.keys(state.configTopicPage.tagIdGroup).length >1) {
            state.configTopicPage.tagIdGroup.shift();//从Array 头部移除元素
        }
        
        state.configTopicPage.tagId = val[0];
    }
 
    //加载话题标签
    const loadTopicTag = () => {
        if(!state.configTopicPage.isAllowLoadTagGroup){
            return;
        }

        proxy?.$axios({
            url: '/control/tag/manage',
            method: 'get',
            params: {
                method : 'allTag'
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            state.configTopicPage.isAllowLoadTagGroup = false;
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		state.configTopicPage.tagOptions = result.data;
			    	}else if(result.code === 500){//错误
			    		
			    		
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //点击单元格选择
    const cellExpandRow_questionTag = (row:any,column:any,event:any,cell:any) => {
        if(column.label=="选择"){
            if(row.childNodeNumber ==0){
                state.configQuestionPage.tagIdGroup.push(row.id);
                
                state.configQuestionPage.tagId = row.id;
                
                let obj:any =new Object();
                obj.value = row.id;
                obj.label = row.name;
                state.configQuestionPage.tagOptions.length = 0;//清空
                state.configQuestionPage.tagOptions.push(obj);
                
                
                //因为只允许选中一个，所以将已选择的清空
                if (Object.keys(state.configQuestionPage.tagIdGroup).length >1) {
                    state.configQuestionPage.tagIdGroup.shift();//从Array 头部移除元素
                }
                
                state.configQuestionPage.question_tag_form = false;
            }
        }else if(column.label=="标签名称"){
            if(row.childNodeNumber >0){
                state.configQuestionPage.parentId = row.id;
                queryQuestionTag(1,row.id);
            }
        }
    }

    //加载问题标签
    const loadQuestionTag = () => {
	    	
        state.configQuestionPage.question_tag_form = true;
        page_question_tag_ref.value.blur();//使Select选择器失去焦点，并隐藏下拉框
        
        if(state.configQuestionPage.tagIdGroup.length ==0){
            state.configQuestionPage.tagId = "";
            state.configQuestionPage.tagOptions.length = 0;//清空	
        }
        
        
        //清空数据
        state.configQuestionPage.totalrecord = 0;//服务器返回的long类型已转为String类型
        state.configQuestionPage.currentpage = 1;
        state.configQuestionPage.totalpage = 1;//服务器返回的long类型已转为String类型
        state.configQuestionPage.maxresult = 12;
        state.configQuestionPage.isShowPage = false;//显示分页栏
        state.configQuestionPage.parentId = '';
        
        queryQuestionTag(1,'');
    }
    //问题标签分页
    const questionTagPage = (page:number) => {
        
        queryQuestionTag(page, state.configQuestionPage.parentId);
    }

    //查询问题标签
    const queryQuestionTag = (page:number,parentId:string) => {
        state.configQuestionPage.tableData = [];
        state.configQuestionPage.tagIdList = [];
        state.configQuestionPage.navigation = '';
        
        state.configQuestionPage.parentId = parentId;


        proxy?.$axios({
            url: '/control/questionTag/manage',
            method: 'get',
            params: {
                method : 'questionTagPage',
                parentId : parentId,
                page : page
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let {pageView,navigation} = result.data
                       
                        let tagList = pageView.records;
                        if(tagList != null && tagList.length >0){
                            for(let i = 0; i<tagList.length; i++){
                                let tag = tagList[i];
                                state.configQuestionPage.tagIdList.push(tag.id);
                            
                            }
                        
                        
                            state.configQuestionPage.tableData = tagList;
                
                            state.configQuestionPage.totalrecord = parseInt(pageView.totalrecord);//服务器返回的long类型已转为String类型
                            state.configQuestionPage.currentpage = pageView.currentpage;
                            state.configQuestionPage.totalpage = parseInt(pageView.totalpage);//服务器返回的long类型已转为String类型
                            state.configQuestionPage.maxresult = pageView.maxresult;
                            state.configQuestionPage.isShowPage = true;//显示分页栏
                        }
                    
                        state.configQuestionPage.navigation = navigation;
                            
                        
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

     //广告--图片广告 添加项
    const configImageAd_addItem = () => {
        // 使用随机数 + 时间戳
        let key = Math.random().toString(36).slice(2) + Date.now();

        state.configImageAd.name[key] = "";
        state.configImageAd.link[key] = "";
        state.configImageAd.imagePath[key] = "";
        

        Object.keys(state.multiLanguageExtensionParameterMap).forEach((langKey) => {
            // 拼接方式必须与 HTML 中的 v-model 保持完全一致：row.key + 'name-' + langKey
            const compositeKey = key + 'name-' + langKey;
            state.configImageAd.multiLanguageExtensionField[compositeKey] = "";
        });

        // 如果有上传组件，初始化文件列表为空数组
        state.configImageAd.uploadImgs[key] = [];

        state.configImageAd.tableList.push({
            key: key
        });
    }

    //处理上传图片
    const configImageAd_handleChange = (file: UploadFile, fileList:UploadUserFile[],key:string) => {
        if (fileList.length > 1) {
            fileList.splice(0, 1);
        }

        //使用Base64格式显示图片
        toBase64Image(file.raw).then((data:any) => {
            file.url = data
        })
    }
    //处理删除图片
    const configImageAd_handleImageRemove = (file: UploadFile,fileList:UploadUserFile[],tableKey:any) => {
        if (state.configImageAd.imagePath) {
            state.configImageAd.imagePath[tableKey] = '';
        }
        let index = fileList.findIndex( fileItem => {
            return fileItem.uid === file.uid
        });
        fileList.splice(index, 1);

    }
    //打开图片预览
    const configImageAd_openImagePreview = (file: UploadFile) => {
        if(file.url!.indexOf("blob:") == 0){//如果是blob格式图片
            //使用Base64格式显示图片
            toBase64Image(file.raw).then((data:any) => {
                state.configImageAd.localImageUrl = data; 
            })
        }else{
            state.configImageAd.localImageUrl = file.url; 
        }
        state.configImageAd.isImageViewer = true;
    }
    //关闭图片预览
    const configImageAd_closeImagePreview= () => {
        state.configImageAd.localImageUrl = '';
        state.configImageAd.isImageViewer = false;
    }

    //上移
    const configImageAd_moveUp= (row:any,index:any) => {
        if (index >0) {
            // 获取上一行的数据对象
            let upData = state.configImageAd.tableList[index - 1];
            //交换 tableList 数组中的对象位置
            state.configImageAd.tableList.splice(index - 1, 1);
            state.configImageAd.tableList.splice(index, 0, upData);
        }
    
    }
    //下移
    const configImageAd_moveDown= (row:any,index:any) => {
        if ((index + 1) < state.configImageAd.tableList.length) {
            let downData = state.configImageAd.tableList[index + 1];
            state.configImageAd.tableList.splice(index + 1, 1);
            state.configImageAd.tableList.splice(index, 0, downData);
   
        }
    
    }
    //删除
    const configImageAd_removeItem= (row:any,index:any) => {
        state.configImageAd.tableList.splice(index, 1);
        

        delete state.configImageAd.name[row.key];
        delete state.configImageAd.multiLanguageExtensionField[row.key];
        delete state.configImageAd.link[row.key];
        delete state.configImageAd.uploadImgs[row.key];
        delete state.configImageAd.imagePath[row.key];
        state.configImageAd.localImageUrl = '';//本地预览图
    }


    //空的点击事件  不写上本方法点击cellExpandRow时会运行两次
    const radioClickEvent = (event:any) => {
        
    }

    
    //在线帮助分页 ---点击单元格选择
    const cellExpandRow_page_helpType = (row:any,column:any,event:any,cell:any) => {
        if(column.label=="选择"){
            if(row.childNodeNumber ==0){
                state.configHelpPage.helpTypeIdGroup.push(row.id);
                
                state.configHelpPage.helpTypeId = row.id;
                
                let obj:any =new Object();
                obj.value = row.id;
                obj.label = row.name;
                state.configHelpPage.helpTypeOptions.length = 0;//清空
                state.configHelpPage.helpTypeOptions.push(obj);
                
                
                //因为只允许选中一个，所以将已选择的清空
                if (Object.keys(state.configHelpPage.helpTypeIdGroup).length >1) {
                    state.configHelpPage.helpTypeIdGroup.shift();//从Array 头部移除元素
                }
                
                state.configHelpPage.helpType_form = false;
            }
        }else if(column.label=="分类名称"){
            if(row.childNodeNumber >0){
                state.configHelpPage.parentId = row.id;
                query_page_helpType(1,row.id);
            }
        }
    }

    //加载帮助分类 -- 分页
    const load_page_helpType = () => {
        
        state.configHelpPage.helpType_form = true;
        page_helpType_ref.value.blur();//使Select选择器失去焦点，并隐藏下拉框
        
        if(state.configHelpPage.helpTypeIdGroup.length ==0){
            state.configHelpPage.helpTypeId = "";
            state.configHelpPage.helpTypeOptions.length = 0;//清空	
        }
        
        
        //清空数据
        state.configHelpPage.totalrecord = 0;//服务器返回的long类型已转为String类型
        state.configHelpPage.currentpage = 1;
        state.configHelpPage.totalpage = 1;//服务器返回的long类型已转为String类型
        state.configHelpPage.maxresult = 12;
        state.configHelpPage.isShowPage = false;//显示分页栏
        state.configHelpPage.parentId = '';
        
        query_page_helpType(1,'');
    }

    //帮助分类分页 -- 分页
    const page_helpTypePage = (page:number) => {
        
        query_page_helpType(page, state.configHelpPage.parentId);
    }
    //查询帮助分类 -- 分页
    const query_page_helpType = (page:number,parentId:string) => {
        
        state.configHelpPage.tableData = [];
        state.configHelpPage.helpTypeIdList = [];
        state.configHelpPage.navigation = '';
        

       // state.configHelpPage.parentId = parentId;

        proxy?.$axios({
            url: '/control/helpType/manage',
            method: 'get',
            params: {
                method : 'helpTypePageSelect',
                parentId : parentId,
                page : page
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let mapData = result.data;
			    		for(let key in mapData){
			    			if(key == "pageView"){
			    				let typeView = mapData[key];
					    		let typeList = typeView.records;
					    		if(typeList != null && typeList.length >0){
					    			for(let i = 0; i<typeList.length; i++){
					    				let type = typeList[i];
					    				state.configHelpPage.helpTypeIdList.push(type.id);
					    			
					    			}
					    		
					    		
					    			state.configHelpPage.tableData = typeList;
					 
					    			state.configHelpPage.totalrecord = parseInt(typeView.totalrecord);//服务器返回的long类型已转为String类型
					    			state.configHelpPage.currentpage = typeView.currentpage;
									state.configHelpPage.totalpage = parseInt(typeView.totalpage);//服务器返回的long类型已转为String类型
									state.configHelpPage.maxresult = typeView.maxresult;
									state.configHelpPage.isShowPage = true;//显示分页栏
					    		}
			    			}else if(key == "navigation"){
			    				state.configHelpPage.navigation = mapData[key];
			    			}
			    		}
			    	}else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo_object(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }



    //推荐在线帮助 - 集合 --点击单元格选择
    const cellExpandRow_recommendHelp = (row:any,column:any,event:any,cell:any) => {
        if(column.label=="选择"){
            for(let i =0; i< state.configRecommendedHelp.tableData.length; i++){
                let search_help = state.configRecommendedHelp.tableData[i];
                if(row.id == search_help.id){
                    if(state.configRecommendedHelp.helpIdGroup[i] == true){//原来已选中
                        state.configRecommendedHelp.helpIdGroup[i] = false;
                        for(let j =0; j< state.configRecommendedHelp.tableList.length; j++){
                            let help = state.configRecommendedHelp.tableList[j];
                            if(row.id == help.id){
                                state.configRecommendedHelp.tableList.splice(j, 1);
                                break;
                            }
                        }
                    }else{
                        state.configRecommendedHelp.helpIdGroup[i] = true;
                        state.configRecommendedHelp.tableList.push(row);
                    }
                
                    
                }
            }
        }
    }

    //推荐在线帮助 - 集合 -- 加载 
    const recommendHelp_loadHelp = () => {
        state.configRecommendedHelp.help_form = true;

        state.configRecommendedHelp.helpIdGroup.length = 0;//清空
        state.configRecommendedHelp.keyword = '';//关键词

        //清空数据
        state.configRecommendedHelp.totalrecord = 0;//服务器返回的long类型已转为String类型
        state.configRecommendedHelp.currentpage = 1;
        state.configRecommendedHelp.totalpage = 1;//服务器返回的long类型已转为String类型
        state.configRecommendedHelp.maxresult = 12;
        state.configRecommendedHelp.isShowPage = false;//显示分页栏
        
        search_collection_help(1,'');
    }

    //推荐在线帮助 -- 分页
    const recommendHelp_helpPage = (page:number) => {
        
        search_collection_help(page, state.configRecommendedHelp.keyword);
    }
    
    //推荐在线帮助 - 集合 搜索分类
    const search_collection_help = (page:number,keyword:string) => {
        
        state.configRecommendedHelp.tableData = [];
        state.configRecommendedHelp.helpIdGroup = [];

        state.configRecommendedHelp.totalrecord = 0;//服务器返回的long类型已转为String类型
        state.configRecommendedHelp.currentpage = 1;
        state.configRecommendedHelp.totalpage = 1;//服务器返回的long类型已转为String类型
        state.configRecommendedHelp.maxresult = 12;
        state.configRecommendedHelp.isShowPage = false;//显示分页栏

        proxy?.$axios({
            url: '/control/help/manage',
            method: 'get',
            params: {
                method : 'ajax_searchHelpPage',
                keyword : keyword,
                page : page
            },
           // showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let pageView = result.data;
			    		let list = pageView.records;
			    		if(list != null && list.length >0){
			    			
			    			A:for(let i =0; i<list.length; i++){
			    				let help = list[i];
			    				
			    				for(let j =0; j<state.configRecommendedHelp.tableList.length; j++){
			    					let item = state.configRecommendedHelp.tableList[j];
			    					if(item.id == help.id){
			    						state.configRecommendedHelp.helpIdGroup.push(true);
			    						continue A;
			    					}
			    				}
			    				state.configRecommendedHelp.helpIdGroup.push(false);
			    			}
			    			
			    			state.configRecommendedHelp.tableData = list;
			 
			    			state.configRecommendedHelp.totalrecord = parseInt(pageView.totalrecord);//服务器返回的long类型已转为String类型
			    			state.configRecommendedHelp.currentpage = pageView.currentpage;
							state.configRecommendedHelp.totalpage = parseInt(pageView.totalpage);//服务器返回的long类型已转为String类型
							state.configRecommendedHelp.maxresult = pageView.maxresult;
							state.configRecommendedHelp.isShowPage = true;//显示分页栏
			    		}
			    	}else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo_object(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //推荐在线帮助 - 集合 -- 上移
    const recommendHelp_moveUp = (row:any,index:any) => {
        if (index >0) {
            let upData = state.configRecommendedHelp.tableList[index - 1];
            state.configRecommendedHelp.tableList.splice(index - 1, 1);
            state.configRecommendedHelp.tableList.splice(index, 0, upData);
        }
    
    }
    //推荐在线帮助 - 集合 -- 下移
    const recommendHelp_moveDown = (row:any,index:any) => {
        if ((index + 1) < state.configRecommendedHelp.tableList.length) {
            let downData = state.configRecommendedHelp.tableList[index + 1];
            state.configRecommendedHelp.tableList.splice(index + 1, 1);
            state.configRecommendedHelp.tableList.splice(index, 0, downData); 
        }
    
    }
    //推荐在线帮助 - 集合 -- 删除
    const recommendHelp_removeItem = (row:any,index:any) => {
        state.configRecommendedHelp.tableList.splice(index, 1);
    }

    //其它 -- 自定义HTML -- 编辑器
    const configCustomHtml_editor = () => {
        let uploadPath = "control/frontendApi/manage?method=upload";
       
        let templateRefValue =  configCustomHtml_htmlContent_ref.value;
        if(templateRefValue != undefined){
            let editor = markRaw(CodeMirror.fromTextArea(templateRefValue, {
                lineNumbers: true,
                mode: 'text/html',
                indentUnit: 4,
                extraKeys: {"Alt-/": "autocomplete"},
                indentWithTabs: true,
                autoCloseTags: true,
                lineWrapping: true, //自动换行
                
            }));
            editor.setSize("100%","100%");//设置自适应高度 
            // 监听粘贴事件
            editor.on('paste', (cm :any, e :any) => {
                // 获取剪贴板中的图片数据
                const items = (e.clipboardData || (window as any).clipboardData).items;
                
                const files = Array.from(items ?? [])
                    .map((item :any) => {
                        if (item.type.startsWith('image/')) {
                        return item.getAsFile()
                        }
                    })
                    .filter((f): f is File => f != null)
                

                let notificationMap = new Map<string,any>();
                showNotifications(files).then((map:Map<string,any>) => {
                    notificationMap = map;
        
                })


                if (files.length) {
                    e.preventDefault()
                    for (const file of files) {
                        // 使用 FileReader 读取图片为 base64 并上传
                        const reader = new FileReader()
                        reader.onload = async (e) => {
                        const imageData = e.target?.result as string
                        if (imageData) {

                            editorUpload(new Array(file), (url: string, title: string,errorMessage: string)=>{
                                if(errorMessage == ''){
                                    let pos =  state.configCustomHtml.editor.getCursor()
                                    if(pos.line == 0 && pos.ch == 0){//插入最后一行

                                        let doc = state.configCustomHtml.editor.getDoc();
                                        let cursor = doc.getCursor(); // 获取光标位置的行号
                                        let line = doc.getLine(cursor.line); //获取行内容
                                        let insertPos = {
                                            line: (doc.size+5),
                                            ch: line.length - 1 //定位到行尾
                                        }
                                        doc.replaceRange(`<img src="${url}" title="${title}">`, insertPos); // 添加新行

                                        // 移动光标到新行末尾
                                        doc.setCursor(doc.lineCount(), 0);
                                        state.configCustomHtml.editor.focus();
                                    }else{
                                        //插入焦点位置
                                        state.configCustomHtml.editor.replaceSelection(`<img src="${url}" title="${title}">`);
                                        state.configCustomHtml.editor.focus();
                                    }
                                    
                                }
                                let notification = notificationMap.get(title)
                                if(notification){
                                    notification.close();
                                }
                            },uploadPath,'file','image',store_fileStorageSystem.value);
                        }
                        }
                        reader.readAsDataURL(file)
                    }
                }
            });
            state.configCustomHtml.editor = editor
        }
        
    }

    //编辑器工具栏固钉滚动时触发的事件
    const onAffixEditor = (value: { scrollTop: number, fixed: boolean }) => {
        if(document.querySelector(".el-main")){//使用element-plus是获取窗口高度
           
            let top = (document.querySelector(".el-main") as any).offsetTop;
            let parent = (document.querySelector(".el-main") as any).offsetParent;
            if (parent != null) {
                top += parent.offsetTop;
                parent = parent.offsetParent;
            }
            state.configCustomHtml.editorToolbarHeightFromTop = parseInt(top) -9;
        }
        
    }
    /**
     * 编辑器上传
     * @param type 类型  image、media、file
     */
    const onEditorUpload = (type: string) => {
        let uploadPath = "control/frontendApi/manage?method=upload";

        if(type == 'image'){
            // 触发文件选择框
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.addEventListener('input', (e) => {
                const files = Array.from(input.files ?? []).filter(
                    (item) => item.type.startsWith('image/')
                );

                let notificationMap = new Map<string,any>();
                showNotifications(files).then((map:Map<string,any>) => {
                    notificationMap = map;
        
                })

                if (files?.length) {
                    editorUpload(files, (url: string, title: string,errorMessage: string)=>{
                        if(errorMessage == ''){
                            let pos =  state.configCustomHtml.editor.getCursor()
                            if(pos.line == 0 && pos.ch == 0){//插入最后一行

                                let doc = state.configCustomHtml.editor.getDoc();
                                let cursor = doc.getCursor(); // 获取光标位置的行号
                                let line = doc.getLine(cursor.line); //获取行内容
                                let insertPos = {
                                    line: (doc.size+5),
                                    ch: line.length - 1 //定位到行尾
                                }
                                doc.replaceRange(`<img src="${url}" title="${title}">`, insertPos); // 添加新行

                                // 移动光标到新行末尾
                                doc.setCursor(doc.lineCount(), 0);
                                state.configCustomHtml.editor.focus();
                            }else{
                                //插入焦点位置
                                state.configCustomHtml.editor.replaceSelection(`<img src="${url}" title="${title}">`);
                                state.configCustomHtml.editor.focus();
                            }
                            
                        }
                        let notification = notificationMap.get(title)
                        if(notification){
                            notification.close();
                        }
                    },uploadPath,'file','image',store_fileStorageSystem.value);
                }
            });
            input.click();
        }else if(type == 'media'){
            // 触发文件选择框
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.addEventListener('input', (e) => {
                const files = Array.from(input.files ?? []);
                
                let notificationMap = new Map<string,any>();
                showNotifications(files).then((map:Map<string,any>) => {
                    notificationMap = map;
        
                })


                if (files?.length) {
                  
                    editorUpload(files, (url: string, title: string,errorMessage: string)=>{
                        if(errorMessage == ''){
                            let pos =  state.configCustomHtml.editor.getCursor()
                            if(pos.line == 0 && pos.ch == 0){//插入最后一行

                                let doc = state.configCustomHtml.editor.getDoc();
                                let cursor = doc.getCursor(); // 获取光标位置的行号
                                let line = doc.getLine(cursor.line); //获取行内容
                                let insertPos = {
                                    line: (doc.size+5),
                                    ch: line.length - 1 //定位到行尾
                                }
                                doc.replaceRange(`<video src="${url}" controls="controls"><p>${title}</p></video>`, insertPos); // 添加新行


                                // 移动光标到新行末尾
                                doc.setCursor(doc.lineCount(), 0);
                                state.configCustomHtml.editor.focus();
                            }else{
                                //插入焦点位置
                                state.configCustomHtml.editor.replaceSelection(`<video src="${url}" controls="controls"><p>${title}</p></video>`);
                                state.configCustomHtml.editor.focus();
                            }
                            
                        }
                       
                        let notification = notificationMap.get(title)
                        if(notification){
                          notification.close();
                        }
                        
                    },uploadPath,'file','media',store_fileStorageSystem.value);
                }
            });
            input.click();
        }else if(type == 'file'){
            // 触发文件选择框
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.addEventListener('input', (e) => {
                const files = Array.from(input.files ?? []);
                
                let notificationMap = new Map<string,any>();
                showNotifications(files).then((map:Map<string,any>) => {
                  notificationMap = map;
        
                })


                if (files?.length) {
                  
                    editorUpload(files, (url: string, title: string,errorMessage: string)=>{
                        if(errorMessage == ''){
                            let pos =  state.configCustomHtml.editor.getCursor()
                            if(pos.line == 0 && pos.ch == 0){//插入最后一行

                                let doc = state.configCustomHtml.editor.getDoc();
                                let cursor = doc.getCursor(); // 获取光标位置的行号
                                let line = doc.getLine(cursor.line); //获取行内容
                                let insertPos = {
                                    line: (doc.size+5),
                                    ch: line.length - 1 //定位到行尾
                                }
                                doc.replaceRange(`<a href="${url}" >${title}</a>`, insertPos); // 添加新行

                                // 移动光标到新行末尾
                                doc.setCursor(doc.lineCount(), 0);
                                state.configCustomHtml.editor.focus();
                            }else{
                                //插入焦点位置
                                state.configCustomHtml.editor.replaceSelection(`<a href="${url}" >${title}</a>`);
                                state.configCustomHtml.editor.focus();
                            }
                      
                        }
                       
                        let notification = notificationMap.get(title)
                        if(notification){
                          notification.close();
                        }
                        
                    },uploadPath,'file','file',store_fileStorageSystem.value);
                }
            });
            input.click();
        }
        
    }
    
    //其它--热门搜索词  -- 添加项
    const configHotSearchTerm_addItem = () => {
        state.configHotSearchTerm.formOptions.push({
            key: '',
            value: ''
        });
    }
    //其它--热门搜索词  -- 删除项
    const configHotSearchTerm_removeItem = (formOption:any) => {
        let index = state.configHotSearchTerm.formOptions.indexOf(formOption);
        if (index !== -1) {
            state.configHotSearchTerm.formOptions.splice(index, 1);
        }
    }
    //其它--热门搜索词  -- 上移
    const configHotSearchTerm_moveUp = (formOption:any) => {
        let index = state.configHotSearchTerm.formOptions.indexOf(formOption);
        if (index >0) {
            let upData = state.configHotSearchTerm.formOptions[index - 1];
            state.configHotSearchTerm.formOptions.splice(index - 1, 1);
            state.configHotSearchTerm.formOptions.splice(index, 0, upData);
        }
    }
    //其它--热门搜索词  -- 下移
    const configHotSearchTerm_moveDown = (formOption:any) => {
        let index = state.configHotSearchTerm.formOptions.indexOf(formOption);
        if ((index + 1) < state.configHotSearchTerm.formOptions.length) {
            let downData = state.configHotSearchTerm.formOptions[index + 1];
            state.configHotSearchTerm.formOptions.splice(index + 1, 1);
            state.configHotSearchTerm.formOptions.splice(index, 0, downData);
        }
    }


    //提交表单
    const submitForm = () => {
        state.submitForm_disabled = true;

        //清空error的属性值
        for (const [key, value] of Object.entries(error) as any){
            if(getType(value) == 'object'){//如果为Object类型

                Object.keys(value).forEach(
                    function(key){
                        if(getType(value[key]) == 'map'){
                            value[key].clear();
                        }else{
                            value[key]= '';
                        }
                    }
                );
            }else{
                Object.assign(error, {[key] : ''});
            }
        }

        let formData = new FormData();
        formData.append('frontendApiId', state.id);
        if(state.name != null){
            formData.append('frontendApi.name', state.name);
        }
        if(state.url != null){
            formData.append('frontendApi.url', state.url);
        }
        if(state.httpMethod != null){
            formData.append('frontendApi.httpMethod', state.httpMethod);
        }
        if(state.requiresLogin != null){
            formData.append('frontendApi.requiresLogin', state.requiresLogin.toString());
        }
        if(state.routeEnumMapper != null){
            formData.append('frontendApi.routeEnumMapper', state.routeEnumMapper);
        }

        if(state.routeEnumMapper != null){
            if(state.routeEnumMapper == 'CUSTOM_6010100'){
                if( state.configTopicPage.tagId){
                    formData.append('configTopicPage.tagId', state.configTopicPage.tagId);
                }
                
                formData.append('configTopicPage.tag_transferPrameter', state.configTopicPage.tag_transferPrameter.toString());
                formData.append('configTopicPage.sort', String(state.configTopicPage.sort));
                if(state.configTopicPage.maxResult){
                    formData.append('configTopicPage.maxResult', state.configTopicPage.maxResult);
                }
                if(state.configTopicPage.pageCount){
                    formData.append('configTopicPage.pageCount', state.configTopicPage.pageCount);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6010300'){//评论分页
                formData.append('configCommentPage.sort', String(state.configCommentPage.sort));
                if(state.configCommentPage.maxResult){
                    formData.append('configCommentPage.maxResult', state.configCommentPage.maxResult);
                }
                if(state.configCommentPage.pageCount){
                    formData.append('configCommentPage.pageCount', state.configCommentPage.pageCount);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6011300'){//相似话题
                if(state.configSimilarTopic.maxResult){
                    formData.append('configSimilarTopic.maxResult', state.configSimilarTopic.maxResult);
                }
                
            }else if(state.routeEnumMapper == 'CUSTOM_6011400'){//热门话题
                if(state.configHotTopic.maxResult){
                    formData.append('configHotTopic.maxResult', state.configHotTopic.maxResult);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6011500'){//话题精华分页
                formData.append('configTopicFeaturedPage.sort', String(state.configTopicFeaturedPage.sort));
                if(state.configTopicFeaturedPage.maxResult){
                    formData.append('configTopicFeaturedPage.maxResult', state.configTopicFeaturedPage.maxResult);
                }
                if(state.configTopicFeaturedPage.pageCount){
                    formData.append('configTopicFeaturedPage.pageCount', state.configTopicFeaturedPage.pageCount);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6020100'){//问题分页
                if(state.configQuestionPage.tagIdGroup != null && state.configQuestionPage.tagIdGroup.length >0){
                    for(let i=0; i<state.configQuestionPage.tagIdGroup.length; i++){
                        let tagId = state.configQuestionPage.tagIdGroup[i];
                        formData.append('configQuestionPage.tagId', tagId);
                        break;
                    }
                }
                if(state.configQuestionPage.tag_transferPrameter){
                    formData.append('configQuestionPage.tag_transferPrameter', state.configQuestionPage.tag_transferPrameter.toString());
                }
                if(state.configQuestionPage.sort){
                    formData.append('configQuestionPage.sort', String(state.configQuestionPage.sort));
                }
                if(state.configQuestionPage.filterCondition){
                    formData.append('configQuestionPage.filterCondition', String(state.configQuestionPage.filterCondition));
                }
                if(state.configQuestionPage.filterCondition_transferPrameter){
                    formData.append('configQuestionPage.filterCondition_transferPrameter', state.configQuestionPage.filterCondition_transferPrameter.toString());
                }
                if(state.configQuestionPage.sort){
                    formData.append('configQuestionPage.sort', String(state.configQuestionPage.sort));
                }
                if(state.configQuestionPage.maxResult){
                    formData.append('configQuestionPage.maxResult', state.configQuestionPage.maxResult);
                }
                if(state.configQuestionPage.pageCount){
                    formData.append('configQuestionPage.pageCount', state.configQuestionPage.pageCount);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6020300'){//答案分页
                if(state.configAnswerPage.sort){
                    formData.append('configAnswerPage.sort', String(state.configAnswerPage.sort));
                }
                if(state.configAnswerPage.maxResult){
                    formData.append('configAnswerPage.maxResult',state.configAnswerPage.maxResult);
                }
                if(state.configAnswerPage.pageCount){
                    formData.append('configAnswerPage.pageCount', state.configAnswerPage.pageCount);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6021100'){//相似问题
                if(state.configSimilarQuestion.maxResult){
                    formData.append('configSimilarQuestion.maxResult', state.configSimilarQuestion.maxResult);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6070200'){//领取红包用户分页
                if(state.configRedEnvelopeUserPage.sort){
                    formData.append('configRedEnvelopeUserPage.sort', String(state.configRedEnvelopeUserPage.sort));
                }
                if(state.configRedEnvelopeUserPage.maxResult){
                    formData.append('configRedEnvelopeUserPage.maxResult', state.configRedEnvelopeUserPage.maxResult);
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6100100'){//图片广告
                for(let i=0; i<state.configImageAd.tableList.length; i++){
                    let table = state.configImageAd.tableList[i];
                    let rowKey = table.key; 

                    let image_name = state.configImageAd.name[rowKey] || "";
                    let image_link = state.configImageAd.link[rowKey] || "";
                    let image_path = state.configImageAd.imagePath[rowKey] || "";
                    formData.append(`configImageAdList[${i}].name`, image_name);
                    formData.append(`configImageAdList[${i}].link`, image_link);
                    formData.append(`configImageAdList[${i}].imagePath`, image_path);
                    

                    for (let langKey in state.multiLanguageExtensionParameterMap) {
                        const fieldKey = rowKey + 'name-' + langKey;
                        const multiValue = state.configImageAd.multiLanguageExtensionField[fieldKey];

                        if (multiValue !== undefined && multiValue !== null && multiValue !== '') {
                            formData.append(`configImageAdList[${i}].multiLanguageExtensionField[name-${langKey}]`, (multiValue as string).trim());
                        }
                    }


                    let flag = false;
                    let fileList = state.configImageAd.uploadImgs[rowKey];
                    
                    if (fileList && fileList.length > 0) {
                        // 取第一个有效文件
                        for (let j = 0; j < fileList.length; j++) {
                            let file = fileList[j];
                            if (file.raw) {
                                flag = true;
                                formData.append('imageAdFile', file.raw);
                                break;
                            }
                        }
                    }

                    if (!flag) {
                        formData.append('imageAdFile', new File([], '', {})); //空文件占位
                    }

                }
            }else if(state.routeEnumMapper == 'CUSTOM_6110100'){//在线帮助分页
                if(state.configHelpPage.helpTypeIdGroup != null && state.configHelpPage.helpTypeIdGroup.length >0){
                    for(let i=0; i<state.configHelpPage.helpTypeIdGroup.length; i++){
                        let helpTypeId = state.configHelpPage.helpTypeIdGroup[i];
                        formData.append('configHelpPage.helpTypeId', helpTypeId);
                        break;
                    }
                }

                formData.append('configHelpPage.helpType_transferPrameter', state.configHelpPage.helpType_transferPrameter.toString());
                if(state.configHelpPage.maxResult){
                    formData.append('configHelpPage.maxResult', state.configHelpPage.maxResult);
                }
                if(state.configHelpPage.pageCount){
                    formData.append('configHelpPage.pageCount', state.configHelpPage.pageCount);
                }
                if(state.configHelpPage.sort){
                    formData.append('configHelpPage.sort', String(state.configHelpPage.sort));
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6110200'){//推荐在线帮助
                if(state.configRecommendedHelp.tableList != null && state.configRecommendedHelp.tableList.length >0){	
                    for(let i=0; i<state.configRecommendedHelp.tableList.length; i++){
                        let help:any = state.configRecommendedHelp.tableList[i];
                        formData.append('configRecommendedHelp.recommendHelpList['+i+'].id', help.id);
                    }
                }
            }else if(state.routeEnumMapper == 'CUSTOM_6150100'){//自定义HTML
                formData.append('configCustomHtml.content', state.configCustomHtml.editor.getValue());
            }else if(state.routeEnumMapper == 'CUSTOM_6150200'){//热门搜索词
                if(state.configHotSearchTerm.formOptions != null && state.configHotSearchTerm.formOptions.length >0){
                    for(let i=0; i<state.configHotSearchTerm.formOptions.length; i++){
                        let formOption = state.configHotSearchTerm.formOptions[i];
                        formData.append('configHotSearchTerm.searchTermList['+i+']', formOption.value);
                        
                    }
                }
            }

        }

        proxy?.$axios({
            url: '/control/frontendApi/manage?method=editFrontendApi',
            method: 'post',
            data: formData,
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
			    if(result){
			    	if(result.code === 200){//成功
                        ElMessage({
                            showClose: true,
                            message: '提交成功',
                            type: 'success',
                            onClose: ()=>{
                                
                            }
                        })
			    		//删除缓存
                        store.setCacheNumber();
			    		router.push({
							path : '/admin/control/frontendApi/list'
						});
			    	}else if(result.code === 500){//错误
                        if(state.routeEnumMapper == 'CUSTOM_6100100'){//图片广告错误
                            autoMapBackendErrors(result.data, state.configImageAd.tableList, error)

                            
                        }else{
			    		    //处理错误信息
                            processErrorInfo_object(result.data as Map<string,string> , error,()=>{});

                        }
			    	}
                }
                state.submitForm_disabled = false;//提交按钮disabled状态
            }
        })
        .catch((error: any) =>{
            console.log(error);
            state.submitForm_disabled = false;//提交按钮disabled状态
        });
    }


     /**
     * 自动填充后端错误
     * @param serverErrors 后端返回的 JSON
        * {
            "configImageAd[0].multiLanguageExtensionField[name-en_US]": "不能大于190个字符",
            "configImageAd[0].name": "图片名称不能为空",
            "frontendApi.name": "名称不能为空"
        }
    * @param tableList 列表数据 (用于匹配 row.key)
    * @param errorState 你的 reactive(error) 对象
    */
    const autoMapBackendErrors = (serverErrors: any, tableList: any[], errorState: any) => {
        
        Object.keys(serverErrors).forEach(serverKey => {
            const errorMsg = serverErrors[serverKey];
            
            // 将路径标准化： "configImageAd[0].name" -> ["configImageAd", "0", "name"]
            // "frontendApi.name" -> ["frontendApi", "name"]
            const paths = serverKey.replace(/\]/g, '').split(/[.\[]/).filter(Boolean);

            let current = errorState;
            let rowKey = ""; // 用于存放列表行的唯一标识

            for (let i = 0; i < paths.length; i++) {
                const p = paths[i];

                // --- 处理数字索引 (例如 "0") ---
                if (/^\d+$/.test(p)) {
                    const index = parseInt(p);
                    rowKey = tableList[index]?.key || "";
                    continue; // 索引不作为对象属性，跳过进入下一层
                }

                // --- 到达叶子节点或 Map 层 ---
                if (current[p] !== undefined) {
                    // 如果是 Map (处理列表字段或多语言字段)
                    if (current[p] instanceof Map) {
                        const nextP = paths[i + 1];
                        // 如果后面还有路径(比如 name-en_US)，则拼接到 rowKey 上
                        const finalKey = (nextP && !/^\d+$/.test(nextP)) ? (rowKey + nextP) : rowKey;
                        current[p].set(finalKey, errorMsg);
                        break; 
                    } 
                    // 如果是普通字符串 (处理 frontendApi.name)
                    else if (i === paths.length - 1 && typeof current[p] === 'string') {
                        current[p] = errorMsg;
                        break;
                    }
                    //否则继续深入
                    current = current[p];
                } else {
                    // 路径对不上，直接退出防止报错
                    break; 
                }
            }
        });
    };



    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

        if(router.currentRoute.value.query.frontendApiId != undefined && router.currentRoute.value.query.frontendApiId != ''){
			state.id = router.currentRoute.value.query.frontendApiId as string;
		}

        CodeMirror.commands.autocomplete = function(cm:any) {
			CodeMirror.simpleHint(cm, CodeMirror.javascriptHint); 
		};
		
		queryEditFrontendApi();
    }) 

    //监听URL路径值变化
    watch(() => state.url, (val, old) => {
        if(val.toLowerCase().startsWith("/user/")){
            state.disabled_requiresLogin = true;
        }else{
            state.disabled_requiresLogin = false;
        }
   
    })
    //监听动态路由枚举值变化
    watch(() => state.routeEnumMapper, (val, old) => {
        nextTick(()=>{//渲染结束再监听
            if(val == "CUSTOM_6100100"){//图片广告
                if(Object.keys(state.configImageAd.name).length === 0){
                    configImageAd_addItem();
                }
            }else if(val == "CUSTOM_6150100"){//自定义HTML
                if(Object.keys(state.configCustomHtml.editor).length === 0){
                     setTimeout(function(){
                        configCustomHtml_editor();
                    }, 30);
                }
            }

        });
        
    })
</script>
<style scoped lang="scss">
.option-group{
    margin-left: 24px;
} 
//隐藏选择器分组分割线
.el-select-group__wrap:not(:last-of-type) {
     padding-bottom: 0px;
}
.el-select-group__wrap:not(:last-of-type)::after {
    height: 0px;
}

.frontendApiModule{
    :deep(.el-form-item__content) {
        line-height: normal;
    }
    :deep(.CodeMirror-scroll) {
        cursor: text;
        min-height: 300px;
    }
    :deep(.CodeMirror) {
        border: 1px solid #dcdfe6;
        border-radius: 3px;
        line-height: 1.7; 
        font-size: 14px; 
    }

    :deep(.CodeMirror pre) {
        word-break: break-all !important;  //长单词或数字在容器边缘换行
    }
    :deep(.CodeMirror pre.CodeMirror-placeholder){
        color: #c8c9cc;
        font-size: 14px;
    }
   
    .editor-container{
        width: 100%;
        .toolbar-container{
            background: #fff;
            
            outline: 2px solid #fff;
                
            .toolbar{
                margin-left: 2px;
                display: flex;
                

                .functionIcon{
                    width: 32px;
                    height: 32px;
                    margin-top: 5px;
                    margin-right: 8px;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center; 
                    justify-content: center;
                    border-radius:3px;
                    &:hover{
                        background: #f4f4f5;
                        
                        
                    }
                    .icon{
                        font-size: 18px;
                    }
                }
            }
        }
        
    }
}
</style>