<!-- 问题查看 -->
<template>
    <div class="main blankBackground" >
        <div class="navbar">
            
            <el-button type="primary" plain @click="router.push({path: state.sourceUrlObject.path, query:state.sourceUrlObject.query})">返回</el-button>
        
        </div>
        <div class="questionViewModule" v-if="state.question != undefined && state.question != null && Object.keys(state.question).length>0">
            <div class="question-wrap">
                <div class="questionTag">
                    <span class="tag" v-for="questionTag in state.question.questionTagAssociationList">{{questionTag.questionTagName}}</span>
                </div>
                <div class="operat">
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/question/manage?method=auditQuestion*','post')" v-if="state.question.status == 10" @click="auditQuestion(state.question.id);">审核</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/questionLike/list*','get')" @click="router.push({path: '/admin/control/questionLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),itemId:state.question.id,likeModule:40,questionPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/questionFavorite/list*','get')" @click="router.push({path: '/admin/control/questionFavorite/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),questionPage:(route.query.page != undefined ? route.query.page:'')}})">收藏用户</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/question/manage?method=appendQuestion*','get')" @click="appendQuestionUI();">追加提问</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/questionReport/list*','get')" @click="router.push({path: '/admin/control/questionReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),questionPage:(route.query.page != undefined ? route.query.page:''),parameterId:state.question.id,module:40}})">举报</el-link>
                    
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" v-if="state.question.isStaff == false" @click="onRiskControlPenalty(70,state.question.id)">风控处罚</el-link>
                    
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/question/manage?method=editQuestion*','get')" @click="editQuestionUI();">修改</el-link>
                    
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/question/manage?method=deleteQuestion*','post')" @click="deleteQuestion(state.question.id)">删除</el-link>
                </div>
                <!-- 追加提问 -->
                <div class="appendQuestion-post" v-show="state.appendQuestionFormView">
                    <div class="appendQuestion">
                        <el-form label-width="120"  @submit.native.prevent>
                            <el-form-item label="追加提问" :required="true">
                                <div v-show="!state.isAppendQuestionMarkdown" style="width: 100%;">
                                    <textarea ref="appendQuestionContentRef" :editorId="'appendQuestion'" style="width:100%;height:300px;visibility:hidden;"></textarea>
                                </div>
                                <div v-if="state.isAppendQuestionMarkdown" style="width: 100%;">
                                    <Editor  :editorId="'appendQuestion'" :value="state.appendQuestionMarkdownContent" :plugins="state.appendQuestionEditorPlugin" :locale="zhHans" :sanitize="appendQuestionSanitize" placeholder="请输入内容..." @change="handleAppendQuestionMarkdownChange"/>
                                </div>
                                
                            </el-form-item>
                            <el-form-item>
                                <el-button class="submitButton" size="large" type="primary" @mousedown.native="appendQuestion" :disabled="state.appendQuestion_disabled">提交</el-button>
                                <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelAppendQuestion();">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
                
                
                <!-- 修改 -->
                <div class="editQuestion-post" v-show="state.editQuestionFormView">
                    <div class="editQuestion data-form">
                        <el-form label-width="120"  @submit.native.prevent>
                            <el-form-item label="标题" :required="true" :error="error.title">
                                <el-input v-model.trim="state.title" maxlength="150" :clearable="true" show-word-limit></el-input>
                            </el-form-item>
                            <el-form-item label="标签" :required="true" :error="error.tagId">
                                <el-select ref="question_tag_ref" size="large" class="custom-select-width" v-model="state.tagIdGroup" @remove-tag="processRemoveTag" @click="loadQuestionTag"  style="width: 100%;" multiple :placeholder="state.select_placeholder" >
                                    <el-option v-for="item in state.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="悬赏积分" :error="error.point" v-if="!state.question.isStaff">
                                <el-col :span="8"><el-input v-model.trim="state.point" maxlength="8" :clearable="true" ></el-input></el-col>
                                <div class="form-help" >最多允许使用积分{{state.maxPoint}}</div>
                            </el-form-item>
                            <el-form-item label="悬赏金额" :error="error.amount" v-if="!state.question.isStaff">
                                <el-col :span="8"><el-input v-model.trim="state.amount" maxlength="8" :clearable="true" ></el-input></el-col>
                                <div class="form-help" >最多允许使用预存款{{state.maxDeposit}}</div>
                            </el-form-item>
                            <el-form-item label="排序" :required="true" :error="error.sort">
                                <el-input-number v-model="state.sort" ref="sort_ref" controls-position="right" :min="0" :max="99999999"></el-input-number>
                                <div class="form-help" >数字越大越在前</div>
                            </el-form-item>
                            <el-form-item label="允许回答" :required="true">
                                <el-switch v-model="state.allow" ></el-switch>
                            </el-form-item>
                            <el-form-item label="状态" :required="true">
                                <el-radio-group v-model="state.status">
                                    <el-radio :label="10">待审核</el-radio>
                                    <el-radio :label="20">已发布</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            
                            <el-form-item label="内容" :required="true">
                                <div v-show="!state.isEditQuestionMarkdown" style="width: 100%;">
                                    <textarea ref="questionContentRef" :editorId="'editQuestion'" style="width:100%;height:300px;visibility:hidden;"></textarea>
                                </div>
                                <div v-if="state.isEditQuestionMarkdown" style="width: 100%;">
                                    <Editor :editorId="'editQuestion'" :value="state.editQuestionMarkdownContent" :plugins="state.editQuestionEditorPlugin" :locale="zhHans" :sanitize="editQuestionSanitize" placeholder="请输入内容..." @change="handleEditQuestionMarkdownChange"/>
                                </div>
                            </el-form-item>
                            <el-form-item label=" ">
                                <el-button class="submitButton" size="large" type="primary" @mousedown.native="editQuestion" :disabled="state.editQuestion_disabled">提交</el-button>
                                <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelEditQuestion();">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
                
                <div class="selectQuestionTagModule">
                    <el-dialog title="选择标签" v-model="state.popup_allTag" @close="closeQuestionTag">
                        <div class="questionTagNavigation">
                            <ul class="nav">
                                <li class="nav-item" v-for="questionTag in state.allTagList" >
                                    <span class="nav-link" :class="state.selectedTagClass.get(questionTag.id)"  @click="selectChildTag(questionTag.id)" >{{questionTag.name}}</span>
                                </li>
                            </ul>
                            <!-- 二级标签 -->
                            <div class="tab-content">
                                <div class="tab-pane">
                                    <span class="child-tag" :class="state.selectedChildTagClass.get(childQuestionTag.id)" @click="selectedTag(childQuestionTag)"  v-for="childQuestionTag in state.childTagList" >{{childQuestionTag.name}}</span>
                                </div>
                            </div>
                        </div>
                    </el-dialog>
                </div>
                
                
               
                <div class="head">
                    <div class="title">{{state.question.title}}</div>
                    <div class="questionInfo clearfix" >
                        <div class="avatar">
                            <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                <template #default>
                                    <p v-if="state.question.nickname != null && state.question.nickname != ''">呢称: {{state.question.nickname}}</p>
                                    <p>账号: {{state.question.account}}</p>
                                    <p v-if="state.question.userRoleNameList != null && state.question.userRoleNameList.length >0" >角色: 
                                        <span class="questionViewModule_question-wrap_head_questionInfo_userRoleName" v-for="roleName in state.question.userRoleNameList" >{{roleName}}</span>
                                    </p> 
                                    
                                    
                                </template>
                                <template #reference v-if="state.question.isStaff == false">
                                    <div class="avatar-wrapper" >
                                        <div class="avatar-badge" v-if="state.question.avatarName == null || state.question.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </div>
                                        <div class="avatar-badge" v-if="state.question.avatarName != null && state.question.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="state.question.avatarPath+'100x100/'+state.question.avatarName"></el-avatar>
                                        </div>
                                    </div>
                                </template>
                                
                                <template #reference v-if="state.question.isStaff == true">
                                    <div class="avatar-wrapper">
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="state.question.avatarName == null || state.question.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </el-badge>
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="state.question.avatarName != null && state.question.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="state.question.avatarPath+'100x100/'+state.question.avatarName"></el-avatar>
                                        </el-badge>
                                    </div>
                                </template>
                            </el-popover>
                        </div>
                        <div class="userName" title="账号">
                            {{state.question.account}}
                            <div class="nickname" title="呢称">
                                {{state.question.nickname}}
                                <span class="questionViewModule_question-wrap_head_questionInfo_userRoleName" v-if="state.question.userRoleNameList != null && state.question.userRoleNameList.length >0" v-for="roleName in state.question.userRoleNameList" title="角色">{{roleName}}</span> 
                            </div>
                        </div>
                        <div class="postTime" title="发表时间">{{state.question.postTime}}</div>
                        <div class="viewTotal-icon" title="查看总数"><el-icon><View /></el-icon></div>
                        <div class="viewTotal" title="查看总数">{{state.question.viewTotal}}次阅读</div>
                        <div class="answer-icon" title="答案总数"><el-icon><ChatDotRound /></el-icon></div>
                        <div class="answer" title="答案总数">{{state.question.answerTotal}}个答案</div>
                        
                        <div class="ipAddress" title="IP地址">
                            {{state.question.ip}}&nbsp;{{state.question.ipAddress}}
                            
                            <div class="statusTagInfo">
                                <span class="orange-tag" v-if="state.question.status ==10" title="问题状态">待审核</span>
                                <span class="green-tag" v-if="state.question.status ==20" title="问题状态">已发布</span>
                                <span class="red-tag" v-if="state.question.status ==110" title="问题状态">待审核(员工\系统)删除</span>
                                <span class="red-tag" v-if="state.question.status ==120" title="问题状态">已发布(员工\系统)删除</span>	
                            </div>
                        </div>
                    </div>
                </div>
                 
                <div  :class="[state.question.isMarkdown != null && state.question.isMarkdown == true ? 'markdown-body-custom questionMarkdownContent' : 'main', router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 40 ? 'reportMark' : '']">
                    <div class="reward" v-if="parseFloat(state.question.amount) > 0 || Long.fromString(String(state.question.point)).gt(0)">
                        <div class="rewardInfo" >
                            <i class="icon cms-deposit" ></i>
                            悬赏<span v-if="parseFloat(state.question.amount) > 0">金额<span class="symbol">¥</span><span class="amount">{{state.question.amount}}</span>元 </span>
                            
                            <span v-if="Long.fromString(state.question.point).gt(0)"><span class="point" >{{state.question.point}}</span>积分</span>
                            
                        </div>
                    </div>
                    <div v-if="state.question.lastUpdateTime != null" class="lastUpdateTime" >最后修改时间：{{state.question.lastUpdateTime}}</div>
                    <div :ref="'question_'+state.question.id">
                        <RenderTemplate :html="state.question.content"></RenderTemplate> 
                    </div>
                </div>
                <div :class="(index%2)==0 ? 'appendBox odd' : 'appendBox even'" v-for="(appendQuestionItem,index) in state.question.appendQuestionItemList">
                    
                    <div class="appendHead">
                        <span class="prompt">第{{index + 1}}条附言</span>
                        <span class="appendTime">{{appendQuestionItem.postTime}}</span>
                        
                        <span class="operating">
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/question/manage?method=editAppendQuestion*','get')" href="javascript:void(0);" @click="editAppendQuestionUI(appendQuestionItem)">修改</el-link>
                        </span>
                        <span class="operating">
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/question/manage?method=deleteAppendQuestion*','post')" href="javascript:void(0);" @click="deleteAppendQuestion(appendQuestionItem.id)">删除</el-link>
                        </span>
                        
                        
                    </div>
                    <div :class="[appendQuestionItem.isMarkdown != null && appendQuestionItem.isMarkdown == true ? 'markdown-body-custom appendMarkdownContent' : 'appendContent']"  :ref="'appendQuestion_'+appendQuestionItem.id">
                        <RenderTemplate :html="appendQuestionItem.content"></RenderTemplate>
                    </div> 
                    
                    <div class="editAppendQuestion-post" v-show="state.editAppendQuestionFormView.get(appendQuestionItem.id)">
                        <div class="editAppendQuestion-formModule">
                            <div class="editAppendQuestion-wrap">
                                <div class="head-tag"><Icon name="pencil-alt" size="50px" class="icon"/></div>
                                
                                <div v-show="!state.isEditAppendQuestionMarkdownMap.get(appendQuestionItem.id)" style="width: 100%;">
                                    <textarea :ref="(el: any) => state.editAppendQuestionElementNodes[index]=el" :editorId="'editAppendQuestion_'+appendQuestionItem.id"  :appendQuestionItemId="appendQuestionItem.id" class="editAppendQuestion-textarea" ></textarea>
                                </div>
                                <div v-if="state.isEditAppendQuestionMarkdownMap.get(appendQuestionItem.id)" style="width: 100%;">
                                    <Editor mode="split" :editorId="'editAppendQuestion_'+appendQuestionItem.id" :value="(state.editAppendQuestionMarkdownContent[appendQuestionItem.id] as string)" :plugins="state.editAppendQuestionEditorPlugin" :locale="zhHans" :sanitize="appendQuestionSanitize" placeholder="请输入内容..." @change="handleEditAppendQuestionMarkdownChange($event,appendQuestionItem.id)"/>
                                </div>
                                <div class="form-action">
                                    <div class="editAppendQuestionSubmit">
                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="editAppendQuestion(appendQuestionItem.id);" :disabled="state.editAppendQuestion_disabled.get(appendQuestionItem.id)">提交</el-button>
                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelEditAppendQuestion(appendQuestionItem.id);">取消</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>

        
        <div class="answerModule">
            <div class="answerList">
                <div :class="[answer.adoption ? 'item activeItem' : 'item',router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 50 && answer.id == router.currentRoute.value.query.answerId ? 'reportMark' : '']" v-for="(answer,index) in state.answerList" :key="answer.id" :answerId="answer.id"  :ref="'answer_'+answer.id">
                    <div class="head">
                        <div class="avatarBox">
                            <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                <template #default>
                                    <p v-if="answer.nickname != null && answer.nickname != ''">呢称: {{answer.nickname}}</p>
                                    <p>账号: {{answer.account}}</p>
                                    <p v-if="answer.userRoleNameList != null && answer.userRoleNameList.length >0" >角色: 
                                        <span class="questionViewModule_question-wrap_head_questionInfo_userRoleName" v-for="roleName in answer.userRoleNameList" >{{roleName}}</span>
                                    </p> 
                                    
                                    
                                </template>
                                <template #reference v-if="answer.isStaff == false">
                                    <div class="avatar-wrapper" >
                                        <div class="avatar-badge" v-if="answer.avatarName == null || answer.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </div>
                                        <div class="avatar-badge" v-if="answer.avatarName != null && answer.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="answer.avatarPath+'100x100/'+answer.avatarName"></el-avatar>
                                        </div>
                                    </div>
                                </template>
                                
                                <template #reference v-if="answer.isStaff == true">
                                    <div class="avatar-wrapper">
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="answer.avatarName == null || answer.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </el-badge>
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="answer.avatarName != null && answer.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="answer.avatarPath+'100x100/'+answer.avatarName"></el-avatar>
                                        </el-badge>
                                    </div>
                                </template>
                            </el-popover>
                        </div>
                    
                    
                        <span class="info" >
                            <h2 class="clearfix" >
                                
                                <div class="userName">
                                    {{answer.account}}
                                    <div class="nickname" >
                                        {{answer.nickname}}
                                        <i class="userRoleName" v-for="roleName in answer.userRoleNameList" >{{roleName}}</i>
                                        <i class="master" v-if="answer.userName == state.question.userName && answer.isStaff == state.question.isStaff">作者</i>
                                    </div>
                                </div>
                                
                            </h2>
                            
                            <div class="time clearfix">{{answer.postTime}}</div>
                        </span>
                        <span class="floor">{{index+1}}楼</span>                     
                    </div>
                    <div class="adoption" v-if="answer.adoption == true" >
                        <div class="ribbon-wrapper">
                            <div class="ribbon">最佳答案</div>
                        </div>
                    </div>
                    
                    <div class="main">
                        <p  :class="[answer.isMarkdown != null && answer.isMarkdown == true ? 'markdown-body-custom answerMarkdownContent' : 'answerContent']" :ref="'answerContent_'+answer.id">
                            <RenderTemplate :html="answer.content"></RenderTemplate>
                        </p> 
                        
                        
                        <div class="clearfix"></div>
                        <div class="replyList" v-if="answer.answerReplyList.length >0">
                            <ul class="timeline box">
                                <li class="timeline-item replyItem-container" v-for="(reply,index2) in answer.answerReplyList" :key="'replyId_'+reply.id"  :replyId="reply.id" >
                                    <div :ref="el => handleReplyNode(el, reply.id)" v-if="state.replyExpandOrShrink.get(answer.id) || (state.replyExpandOrShrink.get(answer.id) == false && index2 <state.viewNumber)">
                                    <div class="tail" v-if="state.line.get(reply.id)"></div>
                                    <div class="node node--normal" v-if="state.dot.get(reply.id)"></div>
                                    <div class="replyItem">
                                        <div :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 60 && reply.id == router.currentRoute.value.query.replyId ? 'reply-reportMark' : ''">
                                       
                                            <div class="reply-top" >
                                                <div class="avatarBox">
                                                    <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                                        <template #default>
                                                            <p v-if="reply.nickname != null && reply.nickname != ''">呢称: {{reply.nickname}}</p>
                                                            <p>账号: {{reply.account}}</p>
                                                            <p v-if="reply.userRoleNameList != null && reply.userRoleNameList.length >0" >角色: 
                                                                <span class="questionViewModule_question-wrap_head_questionInfo_userRoleName" v-for="roleName in reply.userRoleNameList" >{{roleName}}</span>
                                                            </p> 
                                                            
                                                            
                                                        </template>
                                                        <template #reference v-if="reply.isStaff == false">
                                                            <div class="avatar-wrapper" >
                                                                <div class="avatar-badge" v-if="reply.avatarName == null || reply.avatarName == ''">
                                                                    <el-avatar shape="square" :size="48" :icon="UserFilled"></el-avatar>
                                                                </div>
                                                                <div class="avatar-badge" v-if="reply.avatarName != null && reply.avatarName != ''">
                                                                    <el-avatar shape="square" :size="48" :src="reply.avatarPath+'100x100/'+reply.avatarName"></el-avatar>
                                                                </div>
                                                            </div>
                                                        </template>
                                                        
                                                        <template #reference v-if="reply.isStaff == true">
                                                            <div class="avatar-wrapper">
                                                                <el-badge value="员工" type="warning" class="avatar-badge" v-if="reply.avatarName == null || reply.avatarName == ''">
                                                                    <el-avatar shape="square" :size="48" :icon="UserFilled"></el-avatar>
                                                                </el-badge>
                                                                <el-badge value="员工" type="warning" class="avatar-badge" v-if="reply.avatarName != null && reply.avatarName != ''">
                                                                    <el-avatar shape="square" :size="48" :src="reply.avatarPath+'100x100/'+reply.avatarName"></el-avatar>
                                                                </el-badge>
                                                            </div>
                                                        </template>
                                                    </el-popover>
                                                </div>
                                                <span class="info" >
                                                    <h2 class="clearfix" >
                                                        
                                                        <div class="userName">
                                                            <div class="nickname" >
                                                                {{reply.nickname}}
                                                                <i class="userRoleName" v-for="roleName in reply.userRoleNameList" >{{roleName}}</i>
                                                                <i class="master" v-if="reply.userName == state.question.userName && reply.isStaff == state.question.isStaff">作者</i>
                                                            </div>
                                                            <div class="account" >
                                                                {{reply.account}}<span class="time">{{reply.postTime}}</span>
                                                            </div>
                                                        </div>
                                                        
                                                    </h2>
                                                </span>

                                                <span class="friendInfo" v-if="reply.friendUserName != null && reply.friendUserName != ''">
                                                    <span class="arrow">
                                                        <el-icon><CaretRight /></el-icon>
                                                    </span>
                                                    <div class="friendAvatarBox">
                                                        <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                                            <template #default>
                                                                <p v-if="reply.friendNickname != null && reply.friendNickname != ''">呢称: {{reply.friendNickname}}</p>
                                                                <p>账号: {{reply.friendAccount}}</p>
                                                            </template>
                                                            <template #reference v-if="reply.isFriendStaff == false">
                                                                <div class="avatar-wrapper" >
                                                                    <div class="avatar-badge" v-if="reply.friendAvatarName == null || reply.friendAvatarName == ''">
                                                                        <el-avatar shape="square" :size="48" :icon="UserFilled"></el-avatar>
                                                                    </div>
                                                                    <div class="avatar-badge" v-if="reply.friendAvatarName != null && reply.friendAvatarName != ''">
                                                                        <el-avatar shape="square" :size="48" :src="reply.friendAvatarPath+'100x100/'+reply.friendAvatarName"></el-avatar>
                                                                    </div>
                                                                </div>
                                                            </template>
                                                            
                                                            <template #reference v-if="reply.isFriendStaff == true">
                                                                <div class="avatar-wrapper">
                                                                    <el-badge value="员工" type="warning" class="avatar-badge" v-if="reply.friendAvatarName == null || reply.friendAvatarName == ''">
                                                                        <el-avatar shape="square" :size="48" :icon="UserFilled"></el-avatar>
                                                                    </el-badge>
                                                                    <el-badge value="员工" type="warning" class="avatar-badge" v-if="reply.friendAvatarName != null && reply.friendAvatarName != ''">
                                                                        <el-avatar shape="square" :size="48" :src="reply.friendAvatarPath+'100x100/'+reply.friendAvatarName"></el-avatar>
                                                                    </el-badge>
                                                                </div>
                                                            </template>
                                                        </el-popover>
                                                    </div>
                                                
                                                    <h2 class="nameInfo clearfix" >
                                                        <div class="userName">
                                                            {{reply.friendAccount}}
                                                            <div class="nickname" >
                                                                {{reply.friendNickname}}
                                                                <i class="master" v-if="reply.friendUserName == state.question.userName && reply.isFriendStaff == state.question.isStaff">作者</i>
                                                            </div>
                                                        </div>
                                                    </h2>
                                                </span>
                                                
                                                <div class="operatInfo">
                                                    <span class="orange-tag" v-if="reply.status ==10" title="回复状态">待审核</span>
                                                    <span class="green-tag" v-if="reply.status ==20" title="回复状态">已发布</span>
                                                    <span class="red-tag" v-if="reply.status ==110" title="回复状态">待审核用户删除</span>
                                                    <span class="red-tag" v-if="reply.status ==120" title="回复状态">已发布用户删除</span>
                                                    <span class="red-tag" v-if="reply.status ==100010" title="回复状态">待审核(员工\系统)删除</span>
                                                    <span class="red-tag" v-if="reply.status ==100020" title="回复状态">已发布(员工\系统)删除</span>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/questionLike/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/questionLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),itemId:reply.id,likeModule:60,questionPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=auditAnswerReply&*','post')" href="javascript:void(0);" v-if="reply.status ==10"  @click="auditReply(reply.id)">审核</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=addAnswerReply*','get')" href="javascript:void(0);" @click="addReplyFriendUI(reply.id)">回复</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=editAnswerReply*','get')" href="javascript:void(0);" @click="editReplyUI(reply)">修改</el-link>
                                                    
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=recoveryReply*','post')" href="javascript:void(0);" v-if="reply.status >100"  @click="recoveryReply(reply.id)">恢复</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/questionReport/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/questionReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),questionPage:(route.query.page != undefined ? route.query.page:''),parameterId:reply.id,module:60}})">举报</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" href="javascript:void(0);" v-if="reply.isStaff == false" @click="onRiskControlPenalty(110,reply.id)">风控处罚</el-link>
                        
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=deleteAnswerReply*','post')" href="javascript:void(0);" @click="deleteReply(reply.id)">删除</el-link>
                                                
                                                </div>
                                                
                                            </div>
                                        
                                            <div style="clear:both; height: 0; line-height: 0; font-size: 0;"></div>
                                            
                                            <!-- 修改回复 -->
                                            <div class="editReply-post" v-if="state.editReplyFormView.get(reply.id)">
                                                <el-form label-width="100"  @submit.native.prevent>
                                                    <el-form-item label="状态" :required="true" >
                                                        <el-radio-group :modelValue="useReplyStatusModel(reply.id).value" @update:modelValue="useReplyStatusModel(reply.id).value = $event">
                                                            <el-radio :label="10">待审核</el-radio>
                                                            <el-radio :label="20">已发布</el-radio>
                                                        </el-radio-group>
                                                    </el-form-item>
                                                    <el-form-item label="内容" :required="true">
                                                        <div style="width: 100%;">
                                                            <textarea :ref="el => handleEditReplyNode(el, reply.id)" :editorId="'editReply_'+reply.id" :replyId="reply.id" class="editReply-textarea" ></textarea>
                                                        </div>
                                                    </el-form-item>
                                                    <el-form-item label=" ">
                                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="editReply(reply.id)" :disabled="state.editReply_disabled.get(reply.id)">提交</el-button>
                                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelEditReply(reply.id);">取消</el-button>
                                                    </el-form-item>
                                                </el-form>
                                            </div>
                                            
                                            <div class="replyContent" @click="clickReplyLevel(answer.id,reply.id)">
                                                <RenderTemplate :html="reply.content"></RenderTemplate>
                                            </div>
                                            <!-- 回复对方 -->
                                            <div class="addReplyFriend-post" v-if="state.addReplyFriendFormView.get(reply.id)">
                                                <el-form @submit.native.prevent>
                                                    <el-form-item >
                                                        <div style="width: 100%;">
                                                            <textarea :ref="el => handleAddReplyFriendNode(el, reply.id)" :editorId="'addReplyFriend_'+reply.id" :replyId="reply.id" class="addReplyFriend-textarea" ></textarea>
                                                        </div>
                                                    </el-form-item>
                                                    <el-form-item>
                                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="addReplyFriend(answer.id,reply.id)" :disabled="state.addReplyFriend_disabled.get(reply.id)">提交</el-button>
                                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelAddReplyFriend(reply.id);">取消</el-button>
                                                    </el-form-item>
                                                </el-form>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </li>
                            </ul>
                            <div class="link" :class="!state.replyExpandOrShrink.get(answer.id) ? 'noLink':''" v-if="answer.answerReplyList.length >state.viewNumber">
                                <span @click="telescopicReply(answer.id);" v-if="state.replyExpandOrShrink.get(answer.id)">点击收缩</span>
                                <span @click="telescopicReply(answer.id);" v-else>剩余{{answer.answerReplyList.length-state.viewNumber}}条</span>
                                
                            </div>
                        </div> 
                                      
                    </div>
                    
                    <!-- 回复评论 -->
                    <div class="addReply-post" v-if="state.addReplyFormView.get(answer.id)">
                        <div class="addReply-wrap">
                            <el-form @submit.native.prevent>
                                <el-form-item >
                                    <div style="width: 100%;">
                                        <textarea :ref="el => handleAddReplyNode(el, answer.id)"  :editorId="'addReply_'+answer.id" :answerId="answer.id" class="addReply-textarea" ></textarea>
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-button class="submitButton" size="large" type="primary" @mousedown.native="addReply(answer.id)" :disabled="state.addReply_disabled.get(answer.id)">提交</el-button>
                                    <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelAddReply(answer.id);">取消</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="editAnswer-post" v-if="state.editAnswerFormView.get(answer.id)">
                        <div class="editAnswer-formModule">
                            <div class="editAnswer-wrap">
                                <div class="head-tag"><Icon name="pencil-alt" size="50px" class="icon"/></div>
                                
                                <el-form label-position="top" label-width="120"  @submit.native.prevent>
                                    <el-form-item label="状态" >
                                        <el-radio-group :modelValue="useAnswerStatusModel(answer.id).value" @update:modelValue="useAnswerStatusModel(answer.id).value = $event">
                                            <el-radio :label="10">待审核</el-radio>
                                            <el-radio :label="20">已发布</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-form>
                                
                                <div v-if="!state.isEditAnswerMarkdownMap.get(answer.id)" style="width: 100%;">
                                    <textarea :ref="el => handleEditAnswerNode(el, answer.id)" :editorId="'editAnswer_'+answer.id" :answerId="answer.id" class="editAnswer-textarea" ></textarea>
                                </div>
                                <div v-if="state.isEditAnswerMarkdownMap.get(answer.id)" style="width: 100%;">
                                    <Editor mode="split" :editorId="'editAnswer_'+answer.id" :value="(state.editAnswerMarkdownContent[answer.id] as string)" :plugins="state.editAnswerEditorPlugin" :locale="zhHans" :sanitize="answerSanitize" placeholder="请输入内容..." @change="handleEditAnswerMarkdownChange($event,answer.id)"/>
                                </div>
                                
                                    
                                <div class="form-action">
                                    <div class="editAnswerSubmit">
                                        <el-button class="submitButton" type="primary" size="large" @mousedown.native="editAnswer(answer.id);" :disabled="state.editAnswer_disabled.get(answer.id)">提交</el-button>
                                        <el-button class="submitButton" type="primary" size="large" plain @mousedown.native="cancelEditAnswer(answer.id);">取消</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bottomInfo">
                        <div class="toolbar">
                        
                            <span class="orange-tag" v-if="answer.status ==10" title="答案状态">待审核</span>
                            <span class="green-tag" v-if="answer.status ==20" title="答案状态">已发布</span>
                            <span class="red-tag" v-if="answer.status ==110" title="答案状态">待审核用户删除</span>
                            <span class="red-tag" v-if="answer.status ==120" title="答案状态">已发布用户删除</span>
                            <span class="red-tag" v-if="answer.status ==100010" title="答案状态">待审核(员工\系统)删除</span>
                            <span class="red-tag" v-if="answer.status ==100020" title="答案状态">已发布(员工\系统)删除</span>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/questionLike/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/questionLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),itemId:answer.id,likeModule:50,questionPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=auditAnswer&*','post')" href="javascript:void(0);" v-if="answer.status ==10" @click="auditAnswer(answer.id)">审核</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=cancelAdoptionAnswer*','post')" href="javascript:void(0);" v-if="answer.adoption == true" @click="cancelAdoptionAnswer(answer.id)">取消采纳</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=adoptionAnswer*','post')" href="javascript:void(0);" v-if="answer.adoption == false" @click="adoptionAnswer(answer.id)">采纳</el-link>
                            
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=addAnswerReply*','get')" href="javascript:void(0);" @click="addReplyUI(answer.id)">回复</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=edit&*','get')" href="javascript:void(0);" @click="editAnswerUI(answer)">修改</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/questionReport/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/questionReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),questionView_beforeUrl:(route.query.questionView_beforeUrl != undefined ? route.query.questionView_beforeUrl:''),questionId :state.question.id, answerId:(route.query.answerId != undefined ? route.query.answerId:''),questionPage:(route.query.page != undefined ? route.query.page:''),parameterId:answer.id,module:50}})">举报</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" href="javascript:void(0);" v-if="answer.isStaff == false" @click="onRiskControlPenalty(90,answer.id)">风控处罚</el-link>
                    
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/answer/manage?method=delete&*','post')" href="javascript:void(0);" @click="deleteAnswer(answer.id)">删除</el-link>
                            
                        
                        </div>
                    </div>
                </div>
                
                
                <div class="pagination-wrapper" v-if="state.isShowPage">
                    <el-pagination background  @current-change="page" :current-page="state.currentpage"  :page-size="state.maxresult" layout="total, prev, pager, next,jumper" :total="state.totalrecord"></el-pagination>
                </div>
                
                <div class="addAnswer" >
                    <el-form @submit.native.prevent>
                        <el-form-item :error="error.content">
                            
                            <div v-show="!state.isAddAnswerMarkdown" style="width: 100%;">
                                <textarea :editorId="'addAnswer'" ref="answerContentRef" style="width:100%;height:300px;visibility:hidden;"></textarea>
                            </div>
                            <div v-if="state.isAddAnswerMarkdown" style="width: 100%;">
                                <Editor mode="split" :editorId="'addAnswer'" :value="state.addAnswerMarkdownContent" :plugins="state.addAnswerEditorPlugin" :locale="zhHans" :sanitize="answerSanitize" placeholder="请输入内容..." @change="handleAddAnswerMarkdownChange"/>
                            </div>
                        </el-form-item>
                        <el-form-item>
                            <el-button class="submitButton" type="primary" size="large" @mousedown.native="addAnswerForm" :disabled="state.addAnswerForm_disabled || !verifyPermissionMenu('/control/answer/manage?method=add&*','post')">提交</el-button>
                            
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            
        </div>
       
        <!-- 选择提及用户 -->
        <div class="selectMentionUserModule">
            <el-dialog title="选择用户" :z-index="900000" v-model="state.popup_mentionUser" @close="closeMentionUser" :draggable="true" top="40vh" width="500">
                <div class="search">
                    <el-form :inline="true" label-width="auto" @keyup.enter.native="searchMentionUser">
                        <el-form-item :error="error.keyword">
                            <el-input v-model.trim="state.keyword" maxlength="30" :clearable="true" placeholder="用户账号或呢称"></el-input>
                        </el-form-item>
                        
                        <el-form-item >
                            <el-button type="primary" size="large" @click="searchMentionUser" >搜索</el-button>
                        </el-form-item>
                        
                    </el-form>
                </div>
                <div class="mentionUserItem" v-for="mentionUser in state.mentionUserList" @click="selectMentionUser(mentionUser)">
                    <div class="left-layout">
                        <div class="avatarBox">
                        
                            <img v-if="mentionUser.avatarName != null" :src="mentionUser.avatarPath+'100x100/'+mentionUser.avatarName" class="img">
                            <img v-if="mentionUser.avatarName == null" :src="mentionUser.avatar" width="48" height="48" class="img"/>
                            
                        </div>
                    </div>
                    <div class="right-layout">
                        <span class="userInfo">{{mentionUser.nickname != null && mentionUser.nickname != '' ?mentionUser.nickname : mentionUser.account}}</span>
                    </div>
                </div>
            </el-dialog>
        </div>

        <div class="data-table">
            <el-dialog title="风控处罚" v-model="state.popup_riskControlPenalty" :draggable="true" :close-on-click-modal="false" top="10vh" width="800">
                <el-table :data="state.penaltyTableData" tooltip-effect="dark" stripe :style="{ width: '100%' }" empty-text="没有记录">
                    <el-table-column label="风控名称" align="center">
                        <template #default="scope">
                        
                            <el-link href="javascript:void(0);" class="link"  @click="toEditRiskControlModel(scope.row.riskControlModelId)">{{scope.row.riskControlModelName}}</el-link>
                            
                        </template>
                    </el-table-column>
                    <el-table-column label="触发敏感词" align="center" width="200">
                        <template #default="scope">
                            <div v-if="scope.row.sensitiveWordList != null && scope.row.sensitiveWordList.length >0">
                                <el-tag effect="dark" v-for="word in scope.row.sensitiveWordList" type="danger" class="tag-wrapper tag-spacing" >{{word}}</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="处罚贴子" align="center" width="200">
                        <template #default="scope">
                            <div v-if="scope.row.penalty != undefined && scope.row.penalty != null && Object.keys(scope.row.penalty).length>0 && scope.row.penalty.riskControlPostFeaturesList != null && scope.row.penalty.riskControlPostFeaturesList.length >0">
                                <el-tag effect="dark" v-for="riskControlPostFeatures in scope.row.penalty.riskControlPostFeaturesList" type="danger" class="tag-wrapper tag-spacing" >{{riskControlPostFeatures.name}}</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="封禁时间" align="center" width="170"></el-table-column>
                </el-table>
                <div class="pagination-wrapper" v-if="state.isShowPenaltyPage">
                    <el-pagination background  @current-change="penaltyPage" :current-page="state.penaltyCurrentpage" :page-size="state.penaltyMaxresult" layout="total, prev, pager, next,jumper" :total="state.penaltyTotalrecord"></el-pagination>
                </div>
            </el-dialog>
        </div>
        
    </div>
</template>

<script lang="ts">
export default {
    name: 'questionView',
    beforeRouteEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        //上级路由编码
        if(to.query.questionView_beforeUrl == undefined || to.query.questionView_beforeUrl==''){//前一个URL
			let parameterObj:any = new Object;
			parameterObj.path = from.path;
			let query = from.query;
			for(let q in query){
				query[q] = encodeURIComponent(query[q] as string);
			}
			
			parameterObj.query = query;
			//将请求参数转为base62
			let wordArray = enc.Utf8.parse(JSON.stringify(parameterObj));
            let encrypt = enc.Base64url.stringify(wordArray);
			
			
			let newFullPath = updateURLParameter(to.fullPath,'questionView_beforeUrl',encrypt);
			
			to.fullPath = newFullPath;
			
			let paramGroup = to.query;
			paramGroup.questionView_beforeUrl = encrypt;
			to.query = paramGroup;
		}
        next()
    }
}
</script>


<script lang="ts" setup>
    import { type ComponentInternalInstance, getCurrentInstance, nextTick, onActivated, onDeactivated, onMounted, reactive, ref } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { type AxiosResponse } from 'axios';
    import { type NavigationGuardNext, type RouteLocationNormalized, useRoute, useRouter } from 'vue-router';
    import { dayjs, ElMessage, ElMessageBox} from 'element-plus';
    import { processErrorInfo,getLanguageClassName, updateURLParameter, getElementTop,verifyPermissionMenu, useDynamicMapVModel, resolvePath } from '@/utils/tool';
    import { createEditor } from '@/utils/editor';
    import type { SourceUrl,Question, Answer, QuestionTag, AppendQuestionItem, AnswerReply, User, VoteTheme } from '@/types';
    import { enc} from 'crypto-js';
    import { UserFilled } from '@element-plus/icons-vue'
    import { escapeHtml, escapeVueHtml , unescapeHtml} from '@/utils/escape';
    import Prism from "prismjs";
    import Long from "long";
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'   
    import zhHans from 'bytemd/locales/zh_Hans.json'
    import { markdownPlugins,sanitize } from '@/utils/markdownEditor';
  
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { Editor } from '@bytemd/vue-next'
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import config from '@/utils/markdownPlugin/plugin-config';
    import { letterAvatar } from '@/utils/letterAvatar';
    import { mention } from '@/utils/markdownPlugin/plugin-mention';
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    import { Top, Bottom,Delete,Plus} from '@element-plus/icons-vue'

    const store = useStore(pinia);
    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const route = useRoute();
    const {fileStorageSystem:store_fileStorageSystem} = storeToRefs(store)

    const questionContentRef = ref()
    const question_tag_ref = ref()
    const appendQuestionContentRef = ref()
    const answerContentRef = ref()

    const emit = defineEmits([ "onJumpPage" ]);
    
    //Select 选择器选项
    interface OptionsItem {
        value: string;
        label: string;
    }

    interface VoteOptionItem {
        id: string;
        text: string;
    }

    const state = reactive({
        questionId :'',//问题Id
        answerId :'',//答案Id
        visible :'true',//是否显示 true:未删除问题 false:已删除问题
        question :{} as Question,//问题
        availableTag:'',//富文本编辑器允许使用的标签
        userName:'',//用户名称
        answerList:[] as Array<Answer>,
        totalrecord : 0, //总记录数
        currentpage : 1, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数
        isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误

        viewNumber:10,//回复(展开/收缩) 展示数量
        replyExpandOrShrink :new Map(), //回复展开/收缩 map格式 key:答案Id value:是否展开

        voteTheme:{} as VoteTheme,//处罚用户信息
        voterCount :'0',//总票数
        votePercentage : new Map<string,number>(),//投票比例 key:选项Id value:比例

        isVote:false,//是否发起投票
        voteTitle :'',
        voteMaxChoice :1,
        voteEndDate_format:'',
        voteEndDate :'',//截止时间
        voteOptions: [] as Array<VoteOptionItem>,//投票选项列表
            
        popup_mentionUser :false,//是否弹出选择提及用户表单
        keyword :'',//关键词
        mentionUserList:[] as Array<User>,//提及用户集合
        mentionUserEditorId:'',//提及用户编辑器Id
        currentMarkdownEditor:{} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        editQuestionAvailableTag:[] as Array<string>,//修改问题富文本编辑器允许使用的标签
        appendQuestionAvailableTag:[] as Array<string>,//追加问题富文本编辑器允许使用的标签

        editQuestionMarkdownContent:'',//markdown修改问题内容
        isEditQuestionMarkdown:false,//是否使用markdown问题编辑器

        supportEditor:10,//支持编辑器
        addAnswerMarkdownContent:'',//markdown答案内容
        isAddAnswerMarkdown:false,//是否使用markdown答案编辑器
        
        
        addAnswerEditor :{} as any,//添加答案编辑器
        addAnswerEditorCreateParameObject :{} as any,//添加答案编辑器的创建参数
        
        
        editAnswerFormView : new Map(),//修改答案表单  key:答案Id value:是否显示
        editAnswerEditorMap:new Map(),//修改答案富文本编辑器集合 key:答案Id value:富文本编辑器
        editAnswerEditorCreateParameMap:new Map(),//修改答案编辑器的创建参数 key:答案Id value:编辑器参数对象

        isEditAnswerMarkdownMap: new Map(),//修改答案是否使用markdown编辑器  key:答案Id value:是否为markdown编辑器
        editAnswerMarkdownContent : {} as any,//修改答案markdown编辑内容 key:答案Id value:答案内容
        
        editAnswerData : new Map(),//修改答案数据 map格式 key:答案Id value:修改html数据
        answerStatusField :new Map<string, number>(), //答案状态项绑定  key:答案Id value:状态
        
        addReplyFormView : new Map(),//添加回复表单  key:评论Id value:是否显示
        addReplyEditorMap:new Map(),//添加回复富文本编辑器集合 key:评论Id value:富文本编辑器
        addReplyEditorCreateParameMap:new Map(),//添加回复编辑器的创建参数 key:评论Id value:编辑器参数对象
       
        addReplyFriendFormView : new Map(),//添加回复对方表单  key:回复Id value:是否显示
        addReplyFriendEditorMap:new Map(),//添加回复对方富文本编辑器集合 key:回复Id value:富文本编辑器
        addReplyFriendEditorCreateParameMap:new Map(),//添加回复对方编辑器的创建参数 key:回复Id value:编辑器参数对象

        editReplyFormView : new Map(),//修改回复表单  key:修改Id value:是否显示
        editReplyEditorMap:new Map(),//修改回复富文本编辑器集合 key:修改Id value:富文本编辑器
        editReplyEditorCreateParameMap:new Map(),//修改回复编辑器的创建参数 key:修改Id value:编辑器参数对象
        replyStatusField :new Map<string, number>(), //回复状态项绑定  key:回复Id value:状态

        title :'',
        sort : 0,
        allow : true,
        status :0,
        point :'',//积分
        amount :'',//金额
        maxDeposit : 0,//允许使用的预存款
        maxPoint : 0,//允许使用的积分
        
        selectedTagClass:new Map<string,string>(),//选中‘标签‘样式
        selectedChildTagClass:new Map<string,string>(),//选中‘子标签‘样式
        tagIdGroup : [] as any, //标签Id组
        options: [] as Array<OptionsItem>,//Select 选择器标签数据
        editQuestionFormView:false,//修改问题表单是否显示
        editQuestionEditor :{} as any,//修改问题编辑器
        editQuestionEditorCreateParameObject :{} as any,//修改问题编辑器的创建参数
        
        
        popup_allTag :false,//是否弹出问题标签表单
        allTagList: [] as Array<QuestionTag>,//全部标签
        selectedFirstTagId: '',//选中的一级标签Id
        childTagList: [] as Array<QuestionTag>,//选中一级标签的子标签集合
        select_placeholder: '请选择',

        
        appendQuestionFormView:false,//追加提问表单是否显示
        appendQuestionEditor :{} as any,//追加提问编辑器
        appendQuestionEditorCreateParameObject :{} as any,//追加提问编辑器的创建参数

        appendQuestionMarkdownContent:'',//追加问题markdown内容
        isAppendQuestionMarkdown:false,//追加问题是否使用markdown编辑器
        
        
        editAppendQuestionFormView : new Map(),//修改追加问题表单  key:追加问题Id value:是否显示
        editAppendQuestionEditorMap:new Map(),//修改追加问题富文本编辑器集合 key:追加问题Id value:富文本编辑器
        editAppendQuestionEditorCreateParameMap:new Map(),//修改追加问题编辑器的创建参数 key:追加问题Id value:编辑器参数对象
        editAppendQuestionData : new Map(),//修改追加问题数据 map格式 key:追加问题Id value:修改html数据
        editAppendQuestionElementNodes:[] as any,//处理修改追加问题Element节点集合
        
        isEditAppendQuestionMarkdownMap: new Map(),//修改追加问题是否使用markdown编辑器  key:追加问题Id value:是否为markdown编辑器
        editAppendQuestionMarkdownContent : {} as any,//修改追加问题markdown编辑内容 key:追加问题Id value:追加问题内容


        playerIdList: [] as Array<string>,//视频播放Id列表
        playerObjectList: [] as Array<any>,//视频播放对象集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
        playerNodeList: [] as Array<any>,//视频节点对象集合


        
        editAnswerElementNodes:new Map<string,HTMLTextAreaElement | null>(),//修改答案项Element节点集合  key:answerId value:el
        replyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//回复列表项Element节点集合  key:replyId value:el
        addReplyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//添加回复Element节点集合  key:answerId value:el
        addReplyFriendElementNodes:new Map<string,HTMLTextAreaElement | null>(),//添加回复对方Element节点集合  key:replyId value:el
        editReplyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//修改回复Element节点集合  key:replyId value:el

        addAnswerForm_disabled:false,//提交答案按钮是否禁用
        editAnswer_disabled : new Map(),//提交修改答案按钮是否禁用 map格式 key:答案Id value:是否禁用
        editQuestion_disabled:false,//提交修改问题按钮是否禁用
        addReplyFriend_disabled: new Map(),//提交添加回复按钮是否禁用 map格式 key:一语论Id value:是否禁用
        addReply_disabled: new Map(),//提交添加回复按钮是否禁用 map格式 key:一语论Id value:是否禁用
        editReply_disabled: new Map(),//提交修改回复按钮是否禁用 map格式 key:回复Id value:是否禁用
        appendQuestion_disabled:false,//追加提问按钮是否禁用
        editAppendQuestion_disabled : new Map(),//提交修改追加问题按钮是否禁用 map格式 key:追加问题Id value:是否禁用
        
        line : new Map(),//楼中楼的线  key:回复Id value:是否显示
        dot : new Map(),//楼中楼的点  key:回复Id value:是否显示

        editQuestionEditorPlugin:[] as BytemdPlugin[],//修改问题Markdown编辑器插件
        addAnswerEditorPlugin:[] as BytemdPlugin[],//添加答案Markdown编辑器插件
        editAnswerEditorPlugin:[] as BytemdPlugin[],//修改答案Markdown编辑器插件
        appendQuestionEditorPlugin:[] as BytemdPlugin[],//追加问题Markdown编辑器插件
        editAppendQuestionEditorPlugin:[] as BytemdPlugin[],//修改追加问题Markdown编辑器插件

        popup_riskControlPenalty:false,//风控处罚弹出层
        penaltyTableData: [],//风控处罚表格内容
        penaltyTotalrecord : 0, //总记录数
        penaltyCurrentpage : 1, //当前页码
        penaltyTotalpage : 1, //总页数
        penaltyMaxresult: 12, //每页显示记录数
        isShowPenaltyPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误
        penaltyModule:0,//风控处罚处罚贴子
        penaltyParameterId:'',//风控处罚参数Id

        sourceUrlObject:{} as SourceUrl,//来源URL对象
    });
    const error = reactive({
        title :'',
        tagId :'',
        sort :'',
        content :'',
        point :'',//积分
        amount :'',//金额

        keyword :'',
        voteOption :'',
        voteTitle :'',
        voteMaxChoice :'',
        voteEndDate :'',
    });


    /**
     * 绑定答案状态 
     * @param answerId 答案Id
     */
    function useAnswerStatusModel(answerId: string) {
        return useDynamicMapVModel<number>(state.answerStatusField, answerId);
    }
    /**
     * 绑定回复状态 
     * @param replyId 回复Id
     */
    function useReplyStatusModel(replyId: string) {
        return useDynamicMapVModel<number>(state.replyStatusField, replyId);
    }

     //修改答案ref节点处理
     const handleEditAnswerNode = (el: any,answerId: string) => {
        if(el != null){
            state.editAnswerElementNodes.set(answerId, el);
        }
    }
    //回复ref节点处理
    const handleReplyNode = (el: any, replyId: string) => {
        if(el != null){
            state.replyElementNodes.set(replyId, el);
        }
	}

     //添加回复ref节点处理
     const handleAddReplyNode = (el: any,answerId: string) => {
        if(el != null){
            state.addReplyElementNodes.set(answerId, el);
        }
    }
    //添加回复对方ref节点处理
    const handleAddReplyFriendNode = (el: any, replyId: string) => {
        if(el != null){
            state.addReplyFriendElementNodes.set(replyId, el);
        }
    }
    //修改回复ref节点处理
    const handleEditReplyNode = (el: any,replyId: string) => {
        if(el != null){
            state.editReplyElementNodes.set(replyId, el);
        }
    }
    
    //修改问题处理Markdown
    const handleEditQuestionMarkdownChange = (value: string) => {
        state.editQuestionMarkdownContent = value;
    }
    //修改问题白名单
    const editQuestionSanitize = (schema: any) => {
        schema = sanitize(schema);
        
        if(state.editQuestionAvailableTag?.indexOf('embedVideo') != -1){//嵌入视频
            schema.tagNames.push('iframe');
        }

        return schema;
    }
    //修改问题处理切换到富文本编辑器
    const handleEditQuestionToggleRichtextEditor = (editorId: string) => {
        state.isEditQuestionMarkdown= false;
        nextTick(()=>{
            if (Object.keys(state.editQuestionEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.editQuestionEditor = createEditor(
                    state.editQuestionEditorCreateParameObject.ref, 
                    state.editQuestionEditorCreateParameObject.availableTag, 
                    state.editQuestionEditorCreateParameObject.uploadPath, 
                    state.editQuestionEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditQuestionToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.editQuestionEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditQuestionMarkdown,state.editQuestionEditor,undefined)
                    }
                );
                state.editQuestionEditor.html(state.editQuestionEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    } 
    //修改问题处理切换到Markdown编辑器
    const handleEditQuestionToggleMarkdownEditor = (editorId: string) => {
        
        if (Object.keys(state.editQuestionEditor).length != 0) {//不等于空
            state.editQuestionEditorCreateParameObject.html = state.editQuestionEditor.html();//切换时保存富文本内容
			state.editQuestionEditor.remove();
            state.editQuestionEditor = {};
		}
        state.isEditQuestionMarkdown = true;
    }   
    
    
    //追加问题处理Markdown
    const handleAppendQuestionMarkdownChange = (value: string) => {
        state.appendQuestionMarkdownContent = value;
    }
    //追加问题白名单
    const appendQuestionSanitize = (schema: any) => {
        schema = sanitize(schema);
        
        if(state.appendQuestionAvailableTag?.indexOf('embedVideo') != -1){//嵌入视频
            schema.tagNames.push('iframe');
        }

        return schema;
    }
    //追加问题处理切换到富文本编辑器
    const handleAppendQuestionToggleRichtextEditor = (editorId: string) => {
        state.isAppendQuestionMarkdown= false;
        nextTick(()=>{
            if (Object.keys(state.appendQuestionEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.appendQuestionEditor = createEditor(
                    state.appendQuestionEditorCreateParameObject.ref, 
                    state.appendQuestionEditorCreateParameObject.availableTag, 
                    state.appendQuestionEditorCreateParameObject.uploadPath, 
                    state.appendQuestionEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAppendQuestionToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.appendQuestionEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAppendQuestionMarkdown,state.appendQuestionEditor,undefined)
                    }
                );
                state.appendQuestionEditor.html(state.appendQuestionEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    } 
    //追加问题处理切换到Markdown编辑器
    const handleAppendQuestionToggleMarkdownEditor = (editorId: string) => {
        
        if (Object.keys(state.appendQuestionEditor).length != 0) {//不等于空
            state.appendQuestionEditorCreateParameObject.html = state.appendQuestionEditor.html();//切换时保存富文本内容
			state.appendQuestionEditor.remove();
            state.appendQuestionEditor = {};
		}
        state.isAppendQuestionMarkdown = true;
    }


    //处理修改追加问题Markdown
    const handleEditAppendQuestionMarkdownChange = (value: string, appendQuestionId: string) => {
       Object.assign(state.editAppendQuestionMarkdownContent, {[appendQuestionId] : value});
    }

    //处理修改追加问题切换到富文本编辑器
    const handleEditAppendQuestionToggleRichtextEditor = (editorId: string) => {
        let appendQuestionId = editorId.split("_")[1];
        state.isEditAppendQuestionMarkdownMap.set(appendQuestionId,false);

        nextTick(()=>{
            
            let editAppendQuestionEditorCreateParameObject = state.editAppendQuestionEditorCreateParameMap.get(appendQuestionId);

            if (editAppendQuestionEditorCreateParameObject !=undefined && Object.keys(editAppendQuestionEditorCreateParameObject).length != 0) {//不等于空
                
                //创建富文本编辑器
                let editAppendQuestionEditor = createEditor(
                    editAppendQuestionEditorCreateParameObject.ref, 
                    editAppendQuestionEditorCreateParameObject.availableTag, 
                    editAppendQuestionEditorCreateParameObject.uploadPath, 
                    editAppendQuestionEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditAppendQuestionToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,editAppendQuestionEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditAppendQuestionMarkdownMap.get(appendQuestionId),editAppendQuestionEditor,undefined)
                    }
                );
                editAppendQuestionEditor.html(editAppendQuestionEditorCreateParameObject.html);//切换时设置富文本内容
                state.editAppendQuestionEditorMap.set(appendQuestionId, editAppendQuestionEditor);
            }
        })
    }

    //处理修改追加问题切换到Markdown编辑器
    const handleEditAppendQuestionToggleMarkdownEditor = (editorId: string) => {
        let appendQuestionId = editorId.split("_")[1];

        let editEditor = state.editAppendQuestionEditorMap.get(appendQuestionId);
        if (editEditor !=undefined && Object.keys(editEditor).length != 0) {//不等于空
            let editAppendQuestionEditorCreateParameObject = state.editAppendQuestionEditorCreateParameMap.get(appendQuestionId);
            editAppendQuestionEditorCreateParameObject.html = editEditor.html();//切换时保存富文本内容
            editEditor.remove();
            editEditor = {};
        }

        state.isEditAppendQuestionMarkdownMap.set(appendQuestionId,true);                
    }


    //处理添加答案Markdown
    const handleAddAnswerMarkdownChange = (value: string) => {
        state.addAnswerMarkdownContent = value;
    }
    //添加答案白名单
    const answerSanitize = (schema: any) => {
        schema = sanitize(schema);
        return schema;
    }
    //处理添加答案切换到富文本编辑器
    const handleAddAnswerToggleRichtextEditor = (editorId: string) => {
        state.isAddAnswerMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.addAnswerEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.addAnswerEditor = createEditor(
                    state.addAnswerEditorCreateParameObject.ref, 
                    state.addAnswerEditorCreateParameObject.availableTag, 
                    state.addAnswerEditorCreateParameObject.uploadPath, 
                    state.addAnswerEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAddAnswerToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addAnswerEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAddAnswerMarkdown,state.addAnswerEditor,undefined)
                    }
                );
                state.addAnswerEditor.html(state.addAnswerEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    }
    //处理添加答案切换到Markdown编辑器
    const handleAddAnswerToggleMarkdownEditor = (editorId: string) => {
        if (Object.keys(state.addAnswerEditor).length != 0) {//不等于空
            state.addAnswerEditorCreateParameObject.html = state.addAnswerEditor.html();//切换时保存富文本内容
            state.addAnswerEditor.remove();
            state.addAnswerEditor = {};
        }
        state.isAddAnswerMarkdown = true;
    }


    //处理修改答案Markdown
    const handleEditAnswerMarkdownChange = (value: string, answerId: string) => {
       Object.assign(state.editAnswerMarkdownContent, {[answerId] : value});
    }

    //处理修改答案切换到富文本编辑器
    const handleEditAnswerToggleRichtextEditor = (editorId: string) => {
        let answerId = editorId.split("_")[1];
        state.isEditAnswerMarkdownMap.set(answerId,false);

        nextTick(()=>{
            
            let editEditorCreateParameObject = state.editAnswerEditorCreateParameMap.get(answerId);

            if (editEditorCreateParameObject !=undefined && Object.keys(editEditorCreateParameObject).length != 0) {//不等于空
                
                //创建富文本编辑器
                let editAnswerEditor = createEditor(
                    editEditorCreateParameObject.ref, 
                    editEditorCreateParameObject.availableTag, 
                    editEditorCreateParameObject.uploadPath, 
                    editEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditAnswerToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,editEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditAnswerMarkdownMap.get(answerId),editAnswerEditor,undefined)
                    }
                );
                editAnswerEditor.html(editEditorCreateParameObject.html);//切换时设置富文本内容
                state.editAnswerEditorMap.set(answerId, editAnswerEditor);
            }
        })
    }

    //处理修改答案切换到Markdown编辑器
    const handleEditAnswerToggleMarkdownEditor = (editorId: string) => {
        let answerId = editorId.split("_")[1];

        let editEditor = state.editAnswerEditorMap.get(answerId);
        if (editEditor !=undefined && Object.keys(editEditor).length != 0) {//不等于空
            let editEditorCreateParameObject = state.editAnswerEditorCreateParameMap.get(answerId);
            editEditorCreateParameObject.html = editEditor.html();//切换时保存富文本内容
            editEditor.remove();
            editEditor = {};
        }

        state.isEditAnswerMarkdownMap.set(answerId,true);                
    }
    
    //显示、隐藏提及弹窗
    const mentionPopUp = (editorId: string,ctx:BytemdEditorContext| undefined) => {
       // console.log("显示、隐藏提及弹窗",editorId);
      
        state.popup_mentionUser = true;
        state.mentionUserEditorId = editorId;
        state.keyword = "";
        state.mentionUserList.length = 0;
        state.currentMarkdownEditor = ctx;
        error.keyword = "";
    }

    //关闭提及用户弹出框
    const closeMentionUser = () => {
        state.popup_mentionUser = false;
        state.currentMarkdownEditor = undefined;
    }

    //选择提及用户
    const selectMentionUser = (mentionUser:User) => {
        let url = "user/control/home?userName="+mentionUser.userName;
        let title = mentionUser.nickname != null && mentionUser.nickname != '' ? '@'+mentionUser.nickname : '@'+mentionUser.account;


        let forum = state.mentionUserEditorId.split("_")[0];//版块
       

        if(forum == 'editQuestion'){//修改问题
            if(state.isEditQuestionMarkdown){//是否使用markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.editQuestionEditor.insertMention(url,title);
            }
        }else if(forum == 'appendQuestion'){//追加问题
            if(state.isAppendQuestionMarkdown){//是否使用markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.appendQuestionEditor.insertMention(url,title);
            }
        }if(forum == 'editAppendQuestion'){//修改追加问题
            let appendQuestionItemId:string = state.mentionUserEditorId.split("_")[1];//Id

            if(state.isEditAppendQuestionMarkdownMap.get(appendQuestionItemId)!= undefined && state.isEditAppendQuestionMarkdownMap.get(appendQuestionItemId) == true){//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                let editor = state.editAppendQuestionEditorMap.get(appendQuestionItemId);
                editor.insertMention(url,title);
            }
        }else if(forum == 'addAnswer'){//添加答案
            if(state.isAddAnswerMarkdown){//是否使用markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.addAnswerEditor.insertMention(url,title);
            }
        }else if(forum == 'editAnswer'){//修改答案
            let answerId:string = state.mentionUserEditorId.split("_")[1];//Id

            if(state.isEditAnswerMarkdownMap.get(answerId)!= undefined && state.isEditAnswerMarkdownMap.get(answerId) == true){//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                let editor = state.editAnswerEditorMap.get(answerId);
                editor.insertMention(url,title);
            }
        }else if(forum == 'addReply'){//添加回复
            let answerId:string = state.mentionUserEditorId.split("_")[1];//Id


            let editor = state.addReplyEditorMap.get(answerId);
            editor.insertMention(url,title);
            
        }else if(forum == 'addReplyFriend'){//添加回复对方
            let replyId:string = state.mentionUserEditorId.split("_")[1];//Id


            let editor = state.addReplyFriendEditorMap.get(replyId);
            editor.insertMention(url,title);
            
        }else if(forum == 'editReply'){//修改回复
            let replyId:string = state.mentionUserEditorId.split("_")[1];//Id

            let editor = state.editReplyEditorMap.get(replyId);
            editor.insertMention(url,title);
            
        }
        closeMentionUser();
    }


    //搜索提及用户
    const searchMentionUser = () => {
        state.mentionUserList.length = 0
        error.keyword = "";
        if(state.keyword == null || state.keyword.trim() == ''){
            error.keyword = "请输入用户账号或呢称";
            return;
        }
        proxy?.$axios({
            url: '/control/user/queryUser',//暂时使用查询提及用户API
            method: 'get',
            params:  {keyword:state.keyword},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let mentionUser = result.data;
		    			if(mentionUser != null){
                            let userList = new Array();
                            if(mentionUser.nickname != null && mentionUser.nickname !=''){
                                mentionUser.avatar = letterAvatar(mentionUser.nickname, 48);
                            }else{
                                mentionUser.avatar = letterAvatar(mentionUser.account, 48);
                            }
                            userList.push(mentionUser);
                            
                            state.mentionUserList = userList;
                        }else{
                            error.keyword = "当前用户不存在";
                        }
						
						
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});	
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //展示/隐藏回复
    const telescopicReply = (answerId:string) => {
        let status = state.replyExpandOrShrink.get(answerId);
        if(status){
            state.replyExpandOrShrink.set(answerId, false); //收缩

            if (state.answerList != null && state.answerList.length > 0) {
                for(var i=0;i<state.answerList.length; i++){
                    var answer = state.answerList[i];
                    if(answer.id == answerId){
                        if(answer.answerReplyList != null && answer.answerReplyList.length >=state.viewNumber){
                            //展开前最后一条回复
                            let reply = answer.answerReplyList[state.viewNumber-1];

                            //跳转到展开前回复栏
                            nextTick(()=> {
                                let replyElement = state.replyElementNodes.get(reply.id);
                                if(replyElement){
                                     document.querySelector(".el-main")!.scrollTo({
                                        top: getElementTop(replyElement) - (document.querySelector(".el-main") as any).offsetTop +90,
                                        behavior: 'smooth'
                                    })
                                }
                            });
                        }
                        break;
                    }
                }
            }
            
        }else{
            state.replyExpandOrShrink.set(answerId, true); //伸展
        }

        closeReplyLevel()
    }

    //处理投票按钮状态
    const handleVote = (val: boolean | string | number) => {
        if(val == true && state.voteOptions.length ==0){
            addItem();
        }
    }
    //投票 添加项
    const addItem = () => {
        state.voteOptions.push({
            id: '',
            text: ''
        });
    }
    //投票 删除项
    const removeItem = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if (index !== -1) {
            state.voteOptions.splice(index, 1);
        }
    }
    //投票 上移
    const moveUp = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if (index >0) {
            let upData = state.voteOptions[index - 1];
            state.voteOptions.splice(index - 1, 1);
            state.voteOptions.splice(index, 0, upData);
        }
    }
    //投票 下移
    const moveDown = (voteOption:any) => {
        let index = state.voteOptions.indexOf(voteOption);
        if ((index + 1) < state.voteOptions.length) {
            let downData = state.voteOptions[index + 1];
            state.voteOptions.splice(index + 1, 1);
            state.voteOptions.splice(index, 0, downData);
        }
    }

    //查询问题
    const queryQuestion = () => {
        let params = {};
        if(router.currentRoute.value.query.page != undefined && router.currentRoute.value.query.page != ''){
            params = {
                method : 'view',
                questionId :state.questionId,
                answerId :state.answerId,
                page :state.currentpage,
            }
        }else{
            params = {
                method : 'view',
                questionId :state.questionId,
                answerId :state.answerId,
                
            }
        }

        proxy?.$axios({
            url: '/control/question/manage',
            method: 'get',
            params: params,
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
			    		let mapData = result.data;
			    		for(let key in mapData){
			    			if(key == "question"){//问题
			    				let question = mapData[key];
			    				
								//处理自定义标签
								let contentNode = document.createElement("div");
								contentNode.innerHTML = question.content;
								
								bindNode(contentNode);
								question.content = escapeVueHtml(contentNode.innerHTML);
								
								
								if(question.appendQuestionItemList != null && question.appendQuestionItemList.length >0){
									for(let i=0; i<question.appendQuestionItemList.length; i++){
										let appendQuestionItem = question.appendQuestionItemList[i];
										
										//处理图片放大标签
										let contentNode2 = document.createElement("div");
										contentNode2.innerHTML = appendQuestionItem.content;
										bindNode(contentNode2);
										appendQuestionItem.content = escapeVueHtml(contentNode2.innerHTML);
										
										
									}
									
								}
								
								state.question = question;
								
								nextTick(()=>{
                                    //渲染代码
                                    let questionRefValue = proxy?.$refs['question_'+state.questionId];
                                    if(questionRefValue != undefined){
                                        renderBindNode(questionRefValue); 
                                    }

                                    if(question.appendQuestionItemList != null && question.appendQuestionItemList.length >0){
                                        for(let i=0; i<question.appendQuestionItemList.length; i++){
                                            let appendQuestionItem = question.appendQuestionItemList[i];
                                            
                                            let appendQuestionRefValue = (proxy?.$refs['appendQuestion_'+appendQuestionItem.id] as any);
                                            if(appendQuestionRefValue != undefined){
                                                renderBindNode(appendQuestionRefValue[0]); 
                                            }
                                        }
                                        
                                    }
                                    
                                });
			    			}else if(key == "availableTag"){//答案富文本框支持标签
			    				state.availableTag = mapData[key];
				    			
			    			}else if(key == "userName"){//用户名称
								let userName = mapData[key];
			    				state.userName = userName;
			    			}else if(key == "supportEditor"){
			    				state.supportEditor = mapData[key];
				    			
			    			}else if(key == "voteTheme"){
                                state.voteTheme = mapData[key];
                                let count = Long.fromString("0");
                                if(state.voteTheme.voteOptionList != null && state.voteTheme.voteOptionList.length >0){
                                    
                                    for(let i =0; i< state.voteTheme.voteOptionList.length; i++){
                                        let voteOption = state.voteTheme.voteOptionList[i];

                                        let longValue = Long.fromString(voteOption.totalVotes)
                                        count = count.add(longValue);
                                    }
                                }
                                state.voterCount = count.toString();

                                if(state.voteTheme.voteOptionList != null && state.voteTheme.voteOptionList.length >0){
                                    
                                    for(let i =0; i< state.voteTheme.voteOptionList.length; i++){
                                        let voteOption = state.voteTheme.voteOptionList[i];
                                        if(parseInt(voteOption.totalVotes) ===0){
                                            state.votePercentage.set(voteOption.id,0);
                                        }else{
                                            state.votePercentage.set(voteOption.id,Math.round(parseInt(voteOption.totalVotes)/parseInt(state.voterCount) *100));
                                        }
                                        
                                    }
                                }
                            }else if(key == "pageView"){//答案分页列表
			    				let pageView = mapData[key];
			    				
			    				let answerList = pageView.records;
			    				
			    				//清空
			    				//state.answerStatusField.clear();

			    				state.replyElementNodes.clear();

			    				state.answerList.length = 0;
                                
			    				if(answerList != null && answerList.length > 0){
				    				for (let i = 0; i <answerList.length; i++) {
										let answer = answerList[i];

										

										if(!state.replyExpandOrShrink.get(answer.id)){//如果之前没有设置或不存在
                                            state.replyExpandOrShrink.set(answer.id, false); //是否展开
                                        }
                                        
                                        //回复
                                        if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                                            for (let j = 0; j <answer.answerReplyList.length; j++) {
                                                let reply = answer.answerReplyList[j];

                                                if(!state.editReplyFormView.get(reply.id)){//如果之前没有设置或不存在
                                                    state.editReplyFormView.set(reply.id,false);
                                                }
                                                
                                                if(!state.addReplyFriendFormView.get(reply.id)){//如果之前没有设置或不存在
                                                    state.addReplyFriendFormView.set(reply.id,false);
                                                }

                                                state.replyStatusField.set(reply.id,reply.status);
                                                
                                                //处理自定义标签
                                                let contentNode = document.createElement("div");
                                                contentNode.innerHTML = reply.content;
                                                
                                                bindNode(contentNode);
                                                reply.content = escapeVueHtml(contentNode.innerHTML);
                                            }
                                        }
                                       
										
										
										//处理图片放大标签
										let contentNode = document.createElement("div");
										contentNode.innerHTML = answer.content;
										bindNode(contentNode);
										answer.content = escapeVueHtml(contentNode.innerHTML);
				    				
				    					state.answerStatusField.set(answer.id,answer.status);
				    					
			    					}
			    					state.answerList = answerList;
			    				
				    				state.totalrecord = parseInt(pageView.totalrecord);//服务器返回的long类型已转为String类型
					    			state.currentpage = pageView.currentpage;
									state.totalpage = parseInt(pageView.totalpage);//服务器返回的long类型已转为String类型
									state.maxresult = pageView.maxresult;
									state.isShowPage = true;//显示分页栏
									
									
									nextTick(()=> {
										if(answerList != null && answerList.length > 0){
                                            for (let i = 0; i <answerList.length; i++) {
                                                let answer = answerList[i];
                                                let answerRefValue =  (proxy?.$refs['answerContent_'+answer.id] as any);
                                                if(answerRefValue != undefined && answerRefValue[0]){
                                                    renderBindNode(answerRefValue[0]); 
                                                }
                                                
                                            }
                                        }
                                        nextTick(()=> {
                                            setTimeout(function () {
                                                //跳转到锚点
                                                if(state.answerId != null && state.answerId != ""){
                                                    let answerRef = (proxy?.$refs['answer_'+state.answerId] as any);
                                                    if(answerRef !=undefined){
                                                        let answerRefValue = answerRef[0];

                                                        //锚点距离浏览器顶部的高度 - <el-main>标签距离浏览器顶部的高度
                                                        //document.querySelector(".el-main")!.scrollTop = answerRefValue.offsetTop - (document.querySelector(".el-main") as any).offsetTop;
                                                        document.querySelector(".el-main")!.scrollTo({
                                                            top: answerRefValue.offsetTop - (document.querySelector(".el-main") as any).offsetTop,
                                                            behavior: 'smooth'
                                                        })
                                                    }
                                                
                                                }
                                                if(router.currentRoute.value.query.replyId != undefined && router.currentRoute.value.query.replyId != ''){
                                                    if (state.answerList != null && state.answerList.length > 0) {
                                                        for(var i=0;i<state.answerList.length; i++){
                                                            var answer = state.answerList[i];
                                                            if(answer.answerReplyList != null && answer.answerReplyList.length > 0){
                                                                for(var j=0;j<answer.answerReplyList.length; j++){
                                                                    var reply = answer.answerReplyList[j];
                                                                    if(reply.id==router.currentRoute.value.query.replyId && j >=state.viewNumber){//如果在收缩层
                                                                        telescopicReply(answer.id);//展开
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    nextTick(()=> {
                                                        let replyElement = state.replyElementNodes.get(router.currentRoute.value.query.replyId as string);
                                                        if(replyElement){
                                                            //锚点距离浏览器顶部的高度 - <el-main>标签距离浏览器顶部的高度
                                                            //document.querySelector(".el-main")!.scrollTop = getElementTop(replyElement) - (document.querySelector(".el-main") as any).offsetTop -5;
                                                            document.querySelector(".el-main")!.scrollTo({
                                                                top: getElementTop(replyElement) - (document.querySelector(".el-main") as any).offsetTop -5,
                                                                behavior: 'smooth'
                                                            })
                                                        }
                                                    });
                                                }
                                            }, 0);
                                        });
										
										
									});
									
			    				}
			    			}
			    		}



                         //编辑器图标
                         let editorIconList = new Array();
                        if(state.availableTag != null && state.availableTag != ''){
                            let availableTagObject = JSON.parse(state.availableTag);//JSON转为对象

                            if(availableTagObject != null && availableTagObject.length >0){
                                for(var i=0; i< availableTagObject.length; i++){
                                    let availableTag = availableTagObject[i];
                                    editorIconList.push(availableTag);
                                    if(availableTag == "image"){//增加批量插入图片按钮
                                        editorIconList.splice(i+1, 0, 'multiimage');//在指定索引处插入元素
                                    }
                                }
                            }
                            editorIconList.push("toggleEditor");

                            editorIconList = editorIconList.filter(function(value:string, index:number, arr:any){
                                if(value == "mention"){//删除@提及按钮
                                    return false;
                                }
                                return true;
                            });
                        }

                        let uploadPath = "control/answer/manage?method=uploadImage&userName="+state.userName+"&isStaff=true&questionId="+state.questionId;
					   		
                        if(state.supportEditor == 20 || state.supportEditor == 40){
                            state.isAddAnswerMarkdown = true;
                        }

                        
                        
			    		if (Object.keys(state.addAnswerEditorCreateParameObject).length === 0) {//等于空

                            if(!state.isAddAnswerMarkdown){
                               //创建富文本编辑器
                                state.addAnswerEditor = createEditor(answerContentRef.value, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleAddAnswerToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isAddAnswerMarkdown,state.addAnswerEditor,undefined)
                                });
                            }
			    			
                            state.addAnswerEditorCreateParameObject = {
			    				ref:answerContentRef.value,
			    				availableTag:editorIconList,
			    				uploadPath:uploadPath,
			    				userGradeList:null,
                                editorId:answerContentRef.value.getAttribute('editorId')
			    			}
			    		
			    		}
			    	}else if(result.code === 500){//错误
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //递归绑定节点参数
    const bindNode = (node:any) => {
        
        
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");
                    
                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次
                
                    let html = '';
                    let style = '';
                    if(childNode.getAttribute("width") != null){//如果是表情，表情图不放大
                        style = 'style="width: '+childNode.getAttribute("width")+'; height: '+childNode.getAttribute("height")+'"';
                        html = '<el-image src="'+resolvePath(src)+'" '+style+' loading="lazy" ></el-image>';
                    }else{
                    
                        html = '<el-image src="'+src+'" '+style+' :preview-src-list=["'+src+'"] lazy hide-on-click-modal ><template #placeholder><div class="image-slot"><Loading class="rotate-loading-icon"></Loading></div></template></el-image>';
                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';
                    
                
                
                //	let html = '<el-image src="backstage/images/null.gif" lazy></el-image>';
                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点	 
                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }


                
                //处理视频标签
                if(childNode.nodeName.toLowerCase() == "player" ){
                    
                    let id = "player_"+random+"_"+i;
                    childNode.setAttribute("id",id);//设置Id
                    state.playerIdList.push(id);	
                }
                //处理下载
                if(childNode.nodeName.toLowerCase() == "a" ){
                    let href = childNode.getAttribute("href")
                    let title = childNode.innerText;
                    let linkType = childNode.getAttribute("linkType")
                    //let startUrl = store.apiUrl+"filedownload?jump=";
                    if(linkType == "download"  && href != ""){
                        childNode.setAttribute("class","download");
                        let downloadHtml ='<Download class="link-icon"></Download>'+escapeHtml(title);
                        childNode.innerHTML =downloadHtml;
                    }
                }

                 //处理@提及
                 if(childNode.nodeName.toLowerCase() == "a" ){
                    let href = childNode.getAttribute("href")
                    let title = childNode.innerText;
                    let linkType = childNode.getAttribute("linkType")
                    let userId = childNode.getAttribute("userId")
                    if(linkType == "mention"  && userId != ""){
                        

                        let html = "<router-link :to=\"{path: '/admin/control/user/manage/show', query:{ id : "+userId+"}}\">"+title+"</router-link>";

                        let newLink = document.createElement('div');
                        newLink.innerHTML = html;
                        let node = newLink.childNodes[0];
                        childNode.parentNode.replaceChild(node,childNode);//替换节点
                    }
                }
                
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){

                    
                    let firstChildNode = null;//第一个子节点

                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                    
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null && firstChildNode.getAttribute("class").indexOf("language-") != -1){//Markdown代码
                        
                        let class_val = firstChildNode.className;
                        let lan_class = "";
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('language-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        if(firstChildNode.getAttribute("class").indexOf("language-mermaid") == -1){
                            childNode.className = "line-numbers "+lan_class;
                            childNode.setAttribute("data-prismjs-copy","复制");
                            childNode.setAttribute("data-prismjs-copy-error","按Ctrl+C复制");
                            childNode.setAttribute("data-prismjs-copy-success","复制成功");


                            let nodeHtml = "";

                            //删除code节点
                            let preChildNodeList = childNode.childNodes;
                            for(let p = 0;p < preChildNodeList.length;p++){
                                let preChildNode = preChildNodeList[p];
                                if(preChildNode.nodeName.toLowerCase() == "code" ){
                                    nodeHtml += preChildNode.innerHTML;
                                    preChildNode.parentNode.removeChild(preChildNode);
                                }
                                
                            }
                            
                            let dom = document.createElement('code');
                            dom.className = "line-numbers "+lan_class;
                            dom.innerHTML=nodeHtml;
                            
                        
                            childNode.appendChild(dom);
                        }
                    }


                    if(childNode.className != null && childNode.className.indexOf("lang-") != -1){//富文本编辑器代码
                       
                        let pre_html = childNode.innerHTML;
                        let class_val = childNode.className;
                        let lan_class = "";
                        
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('lang-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        
                        childNode.className = "line-numbers "+getLanguageClassName(lan_class);
                        childNode.setAttribute("data-prismjs-copy","复制");
                        childNode.setAttribute("data-prismjs-copy-error","按Ctrl+C复制");
                        childNode.setAttribute("data-prismjs-copy-success","复制成功");


                        let nodeHtml = "";

                        //删除code节点
                        let preChildNodeList = childNode.childNodes;
                        for(let p = 0;p < preChildNodeList.length;p++){
                            let preChildNode = preChildNodeList[p];
                            if(preChildNode.nodeName.toLowerCase() == "code" ){
                                nodeHtml += preChildNode.innerHTML;
                                preChildNode.parentNode.removeChild(preChildNode);
                            }
                            
                        }
                        
                        let dom = document.createElement('code');
                        dom.className = "line-numbers "+getLanguageClassName(lan_class);
                        dom.innerHTML=nodeHtml;
                        
                    
                        childNode.appendChild(dom);
                    }

                    
                    
                   
                }
                
                bindNode(childNode);

                
            }
        }
    }


    //递归渲染绑定节点
    const renderBindNode = (node:any) => {	
         //先找到子节点
         let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let firstChildNode:any = null;//第一个子节点
                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                   
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null){
                        if(firstChildNode.getAttribute("class") != null && firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){
                           
                            if(firstChildNode.innerHTML){
                                  //  const { svg } = await mermaid.render('mermaid_'+random, unescapeHtml(firstChildNode.innerHTML));

                              //  childNode.innerHTML = svg;
                              const mermaid_container = document.createElement('div')
                                mermaid_container.style.lineHeight = 'initial' //重置行高

                                childNode.replaceWith(mermaid_container);
                                mermaid.render(
                                    'mermaid_'+random,
                                    unescapeHtml(firstChildNode.innerHTML),
                                    // @ts-ignore
                                    mermaid_container
                                ).then((svgCode) => {
                                    // @ts-ignore
                                    mermaid_container.innerHTML = svgCode.svg
                                
                                })
                                .catch((err) => {
                                // console.error(err);
                                })
                            }
                        }else if(firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){
                            
                        }else{
                            Prism.highlightAllUnder(childNode);
                        }
                    }
                   
                    
                   
                }else if(childNode.nodeName.toLowerCase() == "span"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-inline") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:false,//内联模式
                            output: "html",//仅以 HTML 形式输出 KaTeX。默认会以HTML和MathML形式输出 KaTeX，会破坏布局，导致右边出现滚动条
                        });
                        childNode.innerHTML = tex;
                    }
                }else if(childNode.nodeName.toLowerCase() == "div"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-display") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:true,//块模式
                            output: "html",//仅以 HTML 形式输出 KaTeX。默认会以HTML和MathML形式输出 KaTeX，会破坏布局，导致右边出现滚动条
                        });
                        childNode.innerHTML = tex;

                    }
                }
                renderBindNode(childNode);
            }
        }
    }

    //加载问题标签
    const loadQuestionTag = () => {
        state.popup_allTag = true;
        question_tag_ref.value.blur();//使Select选择器失去焦点，并隐藏下拉框
        if(state.tagIdGroup.length ==0){
            state.options.length = 0;//清空	
        }
        
        queryAllTag();
    }


    //关闭问题标签弹出框
    const closeQuestionTag = () => {
        state.popup_allTag = false;

    }
    //处理删除标签
    const processRemoveTag = (val:any) => {
        if(state.tagIdGroup.length ==0){
            
            state.select_placeholder = "请选择";
        }
    }
    //查询所有标签
    const queryAllTag = () => {
        proxy?.$axios({
            url: '/control/questionTag/manage',
            method: 'get',
            params: {
                method : 'allTag'
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let tagList = result.data;
                        if (tagList != null && tagList.length > 0) {
                            state.allTagList = tagList;
                            
                            for (var i= 0; i < tagList.length; i++) {
                                var questionTag = tagList[i];
                                //第一次选中第一个标签
                                if(state.selectedFirstTagId == ''){
                                    state.childTagList = questionTag.childTag;
                                    state.selectedFirstTagId = questionTag.id;
                                    break;
                                }else{
                                    if(state.selectedFirstTagId == questionTag.id){
                                        state.childTagList = questionTag.childTag;
                                        break;
                                    }
                                }
                            }
                        }
                        nextTick(()=> {
                            setTagClass();
                        });
                    }else if(result.code === 500){//错误
                        
                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
	}

    //选择子标签
    const selectChildTag = (questionTagId:string) => {
        state.selectedFirstTagId = questionTagId;
        setTagClass();
        if(state.allTagList != null && state.allTagList.length >0){
            for (var i= 0; i < state.allTagList.length; i++) {
                var questionTag = state.allTagList[i];
                
                if(questionTagId == questionTag.id){
                    state.childTagList = questionTag.childTag;
                    
                    //如果只有一个节点，则允许选择本标签
                    if(questionTag.childNodeNumber == 0){
                        selectedTag(questionTag);
                    }

                    break;
                }
                
            }
            
        }
    }

    //选中标签
    const selectedTag = (childQuestionTag:QuestionTag) => {
        //判断是否重复选择,如果重复则取消选择
        if(state.options != null && state.options.length >0){
            for(var i=0; i<state.options.length; i++){
                var selectedTag = state.options[i];
                if(selectedTag.value == childQuestionTag.id){
                    //删除标签
                    deleteTag(selectedTag.value);
                    setTagClass();
                    return;
                }
            }
            
        }

        var o:any = new Object();
        o.value = childQuestionTag.id;
        o.label = childQuestionTag.name;

        state.options.push(o);
        
        
        state.tagIdGroup.push(childQuestionTag.id);
        
        state.select_placeholder = "";
        setTagClass();
    }
    //删除标签
    const deleteTag = (questionTagId:string) => {
        if(state.options != null && state.options.length >0){
            for(let i=0; i<state.options.length; i++){
                let selectedTag = state.options[i];
                if(selectedTag.value == questionTagId){
                    state.options.splice(i, 1);
                    
                    for(let j=0; j<state.tagIdGroup.length; j++){
                        if(state.tagIdGroup[j] == questionTagId){
                            state.tagIdGroup.splice(j, 1);
                            break;
                        }
                        
                    }
                    
                    if(state.tagIdGroup.length ==0){
                        state.select_placeholder = "请选择";
                    }
                    return;
                }
            }
            
        }
    }

    //设置一级标签样式
    const setTagClass = () => {
        state.selectedTagClass.clear();
        if(state.selectedFirstTagId != ''){
            state.selectedTagClass.set(state.selectedFirstTagId,"active");
            if(state.tagIdGroup != null && state.tagIdGroup.length >0){
                for(let i = 0; i <state.tagIdGroup.length; i++){
                    let tagId = state.tagIdGroup[i];
                    state.selectedTagClass.set(tagId,"selected");
                    if(state.selectedFirstTagId == tagId){
                        state.selectedTagClass.set(tagId,"active selected");
                    }
                }
            }
        }
        setChildTagClass();
    } 
    

    //设置子标签样式
    const setChildTagClass = () => {
        state.selectedChildTagClass.clear();
        if(state.tagIdGroup != null && state.tagIdGroup.length >0){
            for(let i = 0; i <state.tagIdGroup.length; i++){
                let tagId = state.tagIdGroup[i];
                state.selectedChildTagClass.set(tagId,"selected");
            }
        }
    }


   

    //审核问题
    const auditQuestion = (questionId:string) => {
        ElMessageBox.confirm('此操作将该问题状态改为已发布, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('questionId',  questionId); 
            proxy?.$axios({
                url: '/control/question/manage?method=auditQuestion',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '审核成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })

                            //删除缓存
                            store.setCacheNumber();
                            queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }

    //修改问题表单
    const editQuestionUI = () => {
        if(state.editQuestionFormView){//如果已打开
            return;
        }
        
        state.editQuestionFormView = true;
        proxy?.$axios({
            url: '/control/question/manage',
            method: 'get',
            params: {
                method : 'editQuestion',
                questionId :state.questionId,
            }
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		
			    		let maxDeposit = null;
			    		let maxPoint = null;
			    		let question = null;
			    		
						for(let key in mapData){
			    			if(key == "maxDeposit"){//所有设置的等级
			    				maxDeposit = mapData[key];
			    			}else if(key == "maxPoint"){
			    				maxPoint = mapData[key];
			    			}else if(key == "question"){
			    				question = mapData[key];
			    			}else if(key == "voteTheme"){
			    				let voteTheme = mapData[key];
                                
                                state.voteTitle = voteTheme.title;
                                state.voteMaxChoice = voteTheme.maxChoice;
                                state.voteEndDate_format = voteTheme.endDate;//截止时间
                                if(state.voteEndDate_format != null && state.voteEndDate_format != ''){
                                    state.voteEndDate = dayjs(state.voteEndDate_format).format('YYYY-MM-DD HH:mm:ss');
                                }

                                for (let i =0; i<voteTheme.voteOptionList.length; i++) {  
			    					let voteOption = voteTheme.voteOptionList[i];
			    					let item = {
								    	id: voteOption.id,
										text: voteOption.text,
						            }
			    				
			    					state.voteOptions.push(item);
					    	    }
                            }
			    		}
						if(maxDeposit != null){
							state.maxDeposit = maxDeposit;
						}
						if(maxPoint != null){
							state.maxPoint = maxPoint;
						}
						
						if(question != null){
							
							state.title = state.question.title;
								
							state.sort = state.question.sort;
							state.allow = state.question.allow;
							state.status = state.question.status;
							state.point = state.question.point;
							state.amount = state.question.amount;

                            if(question.isMarkdown != null && question.isMarkdown == true){
                                state.isEditQuestionMarkdown = true;
                                state.editQuestionMarkdownContent = question.markdownContent;
                            }else{
                                state.isEditQuestionMarkdown = false;
                                questionContentRef.value.value = question.content;
                            }
                            
		    				if(question.voteThemeId != null && question.voteThemeId != ''){
                                state.isVote = true;//是否发起投票
                            }
		    				
		    				if(question.questionTagAssociationList != null && question.questionTagAssociationList.length >0){
		    					for(let i = 0; i <question.questionTagAssociationList.length; i++){
		    						let questionTagAssociation = question.questionTagAssociationList[i];
		    						state.tagIdGroup.push(questionTagAssociation.questionTagId);
		    						let obj:any =new Object();
									obj.value = questionTagAssociation.questionTagId;
									obj.label = questionTagAssociation.questionTagName;
									state.options.push(obj);
		    					}
		    					state.select_placeholder = "";
		    				}
		    				
							
		    				
		    				
		    				
	    					let uploadPath = "control/question/manage?method=upload&userName="+state.question.userName+"&isStaff="+state.question.isStaff;
				   		
					   		let availableTag = ['source', '|', 'preview', 'code',
					   		 		        '|', 'justifyleft', 'justifycenter', 'justifyright',
					   				        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
					   				        'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 
					   				        'formatblock', 'fontname', 'fontsize','fullscreen', '/', 'forecolor', 'hilitecolor', 'bold',
					   				        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
					   				         'media','embedVideo','uploadVideo', 'insertfile','emoticons', 'table', 'hr',   'pagebreak',
					   				         'link', 'unlink'];
                            state.editQuestionAvailableTag = availableTag;//修改话题富文本编辑器允许使用的标签




                            if(!state.isEditQuestionMarkdown){
                                //创建富文本编辑器
                                state.editQuestionEditor = createEditor(questionContentRef.value, availableTag, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleEditQuestionToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isEditQuestionMarkdown,state.editQuestionEditor,undefined)
                                });
                            }

					   		
                            state.editQuestionEditorCreateParameObject = {
			    				ref:questionContentRef.value,
			    				availableTag:availableTag,
			    				uploadPath:uploadPath,
			    				userGradeList:null,
                                editorId:questionContentRef.value.getAttribute('editorId')
			    			}
						
						}
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //取消修改问题
    const cancelEditQuestion = () => {
        if (Object.keys(state.editQuestionEditor).length != 0) {//不等于空
            state.editQuestionEditor.remove();
            state.editQuestionEditor = {};
		}
		state.editQuestionEditorCreateParameObject ={};
			
        state.editQuestionMarkdownContent = "";

		state.title ='';
		state.sort= 0;
		state.allow = true;
		state.status =0;
		state.tagIdGroup =[];//标签Id组
		state.options= [];//Select 选择器标签数据
		state.point='';//积分
		state.amount='';//金额
		state.maxDeposit = 0;//允许使用的预存款
		state.maxPoint = 0;//允许使用的积分

        state.isVote = false;//是否发起投票
        state.voteTitle ='';
        state.voteMaxChoice =1;
        state.voteEndDate_format ='';
        state.voteEndDate ='';//截止时间
        state.voteOptions.length = 0;//投票选项列表
			
			
		state.editQuestionFormView = false;
        state.isEditQuestionMarkdown= false;
    }

    //修改问题
    const editQuestion = () => {
        state.editQuestion_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        formData.append('questionId', state.questionId);
        if(state.title != null && state.title != ''){
            formData.append('title', state.title);
            
        }
        
        if(state.tagIdGroup != null && state.tagIdGroup.length >0){
            for(let i = 0; i <state.tagIdGroup.length; i++){
                let tagId = state.tagIdGroup[i];
                formData.append('tagId', tagId); 
            }
        }
        if(state.sort != null){
            formData.append('sort', String(state.sort));
        }
        
        if(state.point != null){
            formData.append('point', state.point);
        }
        if(state.amount != null){
            formData.append('amount', state.amount);
        }
        
        formData.append('allow', state.allow.toString());
        formData.append('status', String(state.status));
        
        
        if(state.isEditQuestionMarkdown){
            formData.append('isMarkdown', state.isEditQuestionMarkdown.toString());
            formData.append('markdownContent', state.editQuestionMarkdownContent);
        }else{
            if(questionContentRef.value.value != null && questionContentRef.value.value !=''){
                formData.append('content', questionContentRef.value.value);
            }
        }

        formData.append('isVote', state.isVote.toString());
        if(state.voteTitle != null && state.voteTitle != ''){
            formData.append('voteTitle', state.voteTitle);
        }
        formData.append('voteMaxChoice', String(state.voteMaxChoice));
        if(state.voteEndDate_format != null && state.voteEndDate_format != ''){
            state.voteEndDate = dayjs(state.voteEndDate_format).format('YYYY-MM-DD HH:mm:ss');
        }else{
            state.voteEndDate = '';
        }
        formData.append('voteEndDate', state.voteEndDate);

        if(state.voteOptions != null && state.voteOptions.length >0){
            for(let i=0; i<state.voteOptions.length; i++){
                let voteOption = state.voteOptions[i];
                formData.append('voteOptionIdList', voteOption.id);
                formData.append('voteOptionTextList', voteOption.text);
                
            }
        }

        proxy?.$axios({
            url: '/control/question/manage?method=editQuestion',
            method: 'post',
            data: formData
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
			    		 

			    		//取消修改问题
						cancelEditQuestion();

			    		
			    		queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.editQuestion_disabled = false;
        })
        .catch((error: any) =>{
            console.log(error);
            state.editQuestion_disabled = false;
        });
    }
    //删除问题
    const deleteQuestion = (questionId:string) => {
        ElMessageBox.confirm('此操作将删除该问题, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('questionId', questionId);

            proxy?.$axios({
                url: '/control/question/manage?method=deleteQuestion',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '操作成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
                            
				    		
				    		router.push({
				    			path: state.sourceUrlObject.path, 
				    			query:state.sourceUrlObject.query
							});
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });

    }

    //追加提问表单
    const appendQuestionUI = () => {
        if(state.appendQuestionFormView){//如果已打开
			return;
		}
			
		state.appendQuestionFormView = true;

        proxy?.$axios({
            url: '/control/question/manage',
            method: 'get',
            params: {
                method : 'appendQuestion',
                questionId :state.questionId,
            }
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		
			    		let question = null;
			    		
						for(let key in mapData){
			    			if(key == "question"){
			    				question = mapData[key];
			    			}
			    		}
						if(question != null){
							
							appendQuestionContentRef.value.value = "";
		    				
		    				
	
	    					let uploadPath = "control/question/manage?method=upload&userName="+state.question.userName+"&isStaff="+state.question.isStaff;
				   		
					   		let availableTag = ['source', '|', 'preview', 'code',
					   		 		        '|', 'justifyleft', 'justifycenter', 'justifyright',
					   				        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
					   				        'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 
					   				        'formatblock', 'fontname', 'fontsize','fullscreen', '/', 'forecolor', 'hilitecolor', 'bold',
					   				        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
					   				         'media','embedVideo','uploadVideo', 'insertfile','emoticons','table', 'hr',   'pagebreak',
					   				         'link', 'unlink'];
					   		
                            state.appendQuestionAvailableTag = availableTag;//追加话题富文本编辑器允许使用的标签

                            if(state.supportEditor == 20 || state.supportEditor == 40){//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                state.isAppendQuestionMarkdown = true;
                            }
                            


                            

                            if(!state.isAppendQuestionMarkdown){
                                
                               //创建富文本编辑器
                                state.appendQuestionEditor = createEditor(appendQuestionContentRef.value, availableTag, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleAppendQuestionToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isAppendQuestionMarkdown,state.appendQuestionEditor,undefined)
                                });
                            }

					   		
                            state.appendQuestionEditorCreateParameObject = {
			    				ref:appendQuestionContentRef.value,
			    				availableTag:availableTag,
			    				uploadPath:uploadPath,
			    				userGradeList:null,
                                editorId:appendQuestionContentRef.value.getAttribute('editorId')
			    			}
						
						}
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //追加提问
    const appendQuestion = () => {
        state.appendQuestion_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        formData.append('questionId', state.questionId);
        
        if(state.isAppendQuestionMarkdown){
            formData.append('isMarkdown', state.isAppendQuestionMarkdown.toString());
            formData.append('markdownContent', state.appendQuestionMarkdownContent);
        }else{
            if(appendQuestionContentRef.value.value != null && appendQuestionContentRef.value.value !=''){
                formData.append('content', appendQuestionContentRef.value.value);
            }
        }
        
        
        

        proxy?.$axios({
            url: '/control/question/manage?method=appendQuestion',
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
			    		 
			    		//取消追加提问
						cancelAppendQuestion();

			    		
			    		queryQuestion();
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

			    		
			    	}
                }
                state.appendQuestion_disabled = false;
            }
        })
        .catch((error: any) =>{
            console.log(error);
            state.appendQuestion_disabled = false;//提交按钮disabled状态
        });

    }

    //取消追加提问
    const cancelAppendQuestion = () => {
        if (Object.keys(state.appendQuestionEditor).length != 0) {//不等于空
            state.appendQuestionEditor.remove();
            state.appendQuestionEditor = {};
        }
        state.appendQuestionEditorCreateParameObject ={};

        state.appendQuestionMarkdownContent = "";

        nextTick(()=>{//需要延迟才能让state.appendQuestionFormView的设置生效
            state.appendQuestionFormView = false;
        })
		state.isAppendQuestionMarkdown = false;
    }

    //修改追加问题表单
    const editAppendQuestionUI = (appendQuestionItem:AppendQuestionItem) => {
		if(state.editAppendQuestionFormView.get(appendQuestionItem.id) == true){//如果已打开
            return;
        }
        proxy?.$axios({
            url: '/control/question/manage',
            method: 'get',
            params: {
                method : 'editAppendQuestion',
			    questionId: state.questionId,
			    appendQuestionItemId: appendQuestionItem.id,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		let question = {} as Question;
		    			let appendQuestionItem = {} as AppendQuestionItem;
			    		for(let key in mapData){
			    			
			    			if(key == "question"){
			    				question = mapData[key];
			    			}else if(key == "appendQuestionItem"){
			    				appendQuestionItem = mapData[key];
			    			}
			    		}
			    	
			    		if(question != undefined && question != null && Object.keys(question).length>0 && appendQuestionItem != undefined && appendQuestionItem != null && Object.keys(appendQuestionItem).length>0 ){
			    			
			    			state.editAppendQuestionFormView.set(appendQuestionItem.id,true);
							nextTick(() =>{
								for(let i = 0; i<state.editAppendQuestionElementNodes.length; i++){
									let editAppendQuestionElement = state.editAppendQuestionElementNodes[i];
									
                                    if(appendQuestionItem.isMarkdown != null && appendQuestionItem.isMarkdown == true){
                                        Object.assign(state.editAppendQuestionMarkdownContent, {[appendQuestionItem.id] : appendQuestionItem.markdownContent});
                                    }else{
                                        editAppendQuestionElement.value = appendQuestionItem.content;
                                    }


									
									
									let _appendQuestionItem = editAppendQuestionElement.getAttribute("appendQuestionItemId");
								
									if(_appendQuestionItem == appendQuestionItem.id){
										
										let uploadPath = "control/question/manage?method=upload&userName="+question.userName+"&isStaff="+question.isStaff;
										
										let availableTag = ['source', '|', 'preview', 'code',
									   		 		        '|', 'justifyleft', 'justifycenter', 'justifyright',
									   				        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
									   				        'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 
									   				        'formatblock', 'fontname', 'fontsize','fullscreen', '/', 'forecolor', 'hilitecolor', 'bold',
									   				        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
									   				         'media','embedVideo','uploadVideo', 'insertfile','emoticons','table', 'hr',   'pagebreak',
									   				         'link', 'unlink','mention','ai','toggleEditor'];
										
                                        
                                        if(appendQuestionItem.isMarkdown != null && appendQuestionItem.isMarkdown == true){
                                            state.isEditAppendQuestionMarkdownMap.set(appendQuestionItem.id,true);
                                        }else{
                                            state.isEditAppendQuestionMarkdownMap.set(appendQuestionItem.id,false);
                                        }
                                        
                                        

                                        if(!state.isEditAppendQuestionMarkdownMap.get(appendQuestionItem.id)){
                                            //创建富文本编辑器
										    let editor = createEditor(editAppendQuestionElement, availableTag, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                                handleEditAppendQuestionToggleMarkdownEditor(editorId);
                                            },
                                            (editorId: string)=>{
                                                //提及弹窗
                                                mentionPopUp(editorId,undefined)
                                            },
                                            (editorId: string)=>{
                                                //AI弹窗
                                                aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isEditAppendQuestionMarkdownMap.get(appendQuestionItem.id),editor,undefined)
                                            });
                                            
                                            state.editAppendQuestionEditorMap.set(appendQuestionItem.id,editor);
                                        }
						    			state.editAppendQuestionEditorCreateParameMap.set(appendQuestionItem.id,{
						    				ref:editAppendQuestionElement,
						    				availableTag:availableTag,
						    				uploadPath:uploadPath,
						    				userGradeList:null,
                                            editorId:editAppendQuestionElement.getAttribute('editorId'),
						    			});
						    			break;
									}
								}
							});
			    		}
                    }else if(result.code === 500){//错误
                         //处理错误信息
                         processErrorInfo(result.data as Map<string,string> , error,()=>{});
			    	
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //取消修改追加问题
    const cancelEditAppendQuestion = (appendQuestionItemId:string) => {
        
        let editAppendQuestionEditor = state.editAppendQuestionEditorMap.get(appendQuestionItemId);
        if(editAppendQuestionEditor != null){
            editAppendQuestionEditor.remove();
            editAppendQuestionEditor = {};
            state.editAppendQuestionEditorMap.delete(appendQuestionItemId);
            state.editAppendQuestionEditorCreateParameMap.delete(appendQuestionItemId);
        }

        state.editAppendQuestionFormView.set(appendQuestionItemId,false);
        state.isEditAppendQuestionMarkdownMap.set(appendQuestionItemId,false);
    }
    //修改追加问题
    const editAppendQuestion = (appendQuestionItemId:string) => {
        state.editAppendQuestion_disabled.set(appendQuestionItemId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        formData.append('questionId',  state.questionId); 
        formData.append('appendQuestionItemId',  appendQuestionItemId); 

        
        if(state.isEditAppendQuestionMarkdownMap.get(appendQuestionItemId)!= undefined && state.isEditAppendQuestionMarkdownMap.get(appendQuestionItemId) == true){
            
            formData.append('isMarkdown', state.isEditAppendQuestionMarkdownMap.get(appendQuestionItemId).toString());
          
            if(state.editAppendQuestionMarkdownContent[appendQuestionItemId] != undefined){
                formData.append('markdownContent', state.editAppendQuestionMarkdownContent[appendQuestionItemId]);
            }
        }else{
            for(let i = 0; i<state.editAppendQuestionElementNodes.length; i++){
                let editAppendQuestionElement = state.editAppendQuestionElementNodes[i];
                let _appendQuestionItemId = editAppendQuestionElement.getAttribute("appendQuestionItemId");
                
                if(_appendQuestionItemId == appendQuestionItemId){
                    formData.append('content', editAppendQuestionElement.value);
                    break;
                }
            }
        }

        

        proxy?.$axios({
            url: '/control/question/manage?method=editAppendQuestion',
            method: 'post',
            data: formData
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
                        let editAppendQuestionEditor = state.editAppendQuestionEditorMap.get(appendQuestionItemId);
						if(editAppendQuestionEditor != null && Object.keys(editAppendQuestionEditor).length != 0){
							editAppendQuestionEditor.html("");//清空字段
							editAppendQuestionEditor.remove();
                            editAppendQuestionEditor = {};
							state.editAppendQuestionEditorMap.delete(appendQuestionItemId);
						}
                        state.editAppendQuestionEditorCreateParameMap.delete(appendQuestionItemId);

                        Object.assign(state.editAppendQuestionMarkdownContent, {[appendQuestionItemId] : ""});

                        nextTick(()=>{//需要延迟才能让state.editAppendQuestionFormView的设置生效
                            state.editAppendQuestionFormView.set(appendQuestionItemId,false);
                        })
						


                        queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.editAppendQuestion_disabled.set(appendQuestionItemId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.editAppendQuestion_disabled.set(appendQuestionItemId,false);
        });
    }

    //删除追加问题
    const deleteAppendQuestion = (appendQuestionItemId:string) => {
        ElMessageBox.confirm('此操作将删除该追加问题, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('questionId', state.questionId);
		    formData.append('appendQuestionItemId', appendQuestionItemId);

            proxy?.$axios({
                url: '/control/question/manage?method=deleteAppendQuestion',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '操作成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
                            //清除追加问题列表
                            clearAppendQuestionList();
				    		queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }



    //分页
    const page = (page:number) => {
		
        //删除缓存
        store.setCacheNumber();
        router.push({
            path: '/admin/control/question/manage/view', 
            query:{ 
                visible : router.currentRoute.value.query.visible,
                questionView_beforeUrl:(router.currentRoute.value.query.questionView_beforeUrl != undefined ? router.currentRoute.value.query.questionView_beforeUrl:''),
                questionId : state.questionId,
                answerId : state.answerId,
                page : page
            }
        });
    }


    //审核答案
    const auditAnswer = (answerId:string) => {
		ElMessageBox.confirm('此操作将该答案状态改为已发布, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerId',  answerId); 

            proxy?.$axios({
                url: '/control/answer/manage?method=auditAnswer',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
				    		//删除缓存
                            store.setCacheNumber();
                            ElMessage({
                                showClose: true,
                                message: '审核成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
				    		
				    		queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });

    }

    //采纳答案
    const adoptionAnswer = (answerId:string) => {
        ElMessageBox.confirm('此操作将采纳该答案, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerId',  answerId); 

            proxy?.$axios({
                url: '/control/answer/manage?method=adoptionAnswer',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
				    		//删除缓存
                            store.setCacheNumber();
                            ElMessage({
                                showClose: true,
                                message: '采纳成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
				    		
				    		queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }
    //取消采纳答案
    const cancelAdoptionAnswer = (answerId:string) => {
        ElMessageBox.confirm('此操作将取消采纳该答案, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerId',  answerId); 

            proxy?.$axios({
                url: '/control/answer/manage?method=cancelAdoptionAnswer',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
				    		//删除缓存
                            store.setCacheNumber();
                            ElMessage({
                                showClose: true,
                                message: '取消采纳成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
				    		
				    		queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }

    //添加答案
    const addAnswerForm = () => {
        state.addAnswerForm_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        if(state.questionId != null && state.questionId != ''){
            formData.append('questionId', state.questionId); 
        }

        if(state.isAddAnswerMarkdown){
            formData.append('isMarkdown', state.isAddAnswerMarkdown.toString());
            formData.append('markdownContent', state.addAnswerMarkdownContent);
        }else{
            if(answerContentRef.value.value != null && answerContentRef.value.value !=''){
                formData.append('content', answerContentRef.value.value);
            }
        }

        

        proxy?.$axios({
            url: '/control/answer/manage?method=add&a=a',//a=a参数的作用是仅增加连接符&
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
                        state.addAnswerMarkdownContent = "";
                        if (Object.keys(state.addAnswerEditor).length != 0) {//不等于空
                            //清空字段
                            state.addAnswerEditor.html("");
                            state.addAnswerEditor.remove();
                            state.addAnswerEditor = {};
                        }
			    		
                        state.addAnswerEditorCreateParameObject = {};
			    		 
			    		queryQuestion();
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

			    		
			    	}
                }
                state.addAnswerForm_disabled = false;
            }
        })
        .catch((error: any) =>{
            console.log(error);
            state.addAnswerForm_disabled = false;//提交按钮disabled状态
        });
    }


    //修改答案表单
    const editAnswerUI = (answer:Answer) => {
        if(state.editAnswerFormView.get(answer.id) == true){//如果已打开
            return;
        }

        proxy?.$axios({
            url: '/control/answer/manage',
            method: 'get',
            params: {
                method : 'edit',
			    answerId: answer.id
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		for(let key in mapData){
			    			if(key == "answer"){//答案
			    				let _answer = mapData[key];
			    				
			    				state.editAnswerFormView.set(answer.id,true);
								nextTick(()=> {
                                    let editAnswerElement = state.editAnswerElementNodes.get(answer.id);
                                    if(editAnswerElement){
                                        if(_answer.isMarkdown != null && _answer.isMarkdown == true){
                                            Object.assign(state.editAnswerMarkdownContent, {[_answer.id] : _answer.markdownContent});
                                        }else{
                                            editAnswerElement.value = _answer.content;
                                        }
                                        //编辑器图标
                                            let editorIconList = new Array();
                                            if(state.availableTag != null && state.availableTag != ''){
                                                let availableTagObject = JSON.parse(state.availableTag);//JSON转为对象

                                            let flag = false;
                                            if(availableTagObject != null && availableTagObject.length >0){
                                                for(let i=0; i< availableTagObject.length; i++){
                                                    let availableTag = availableTagObject[i];
                                                    editorIconList.push(availableTag);
                                                    if(availableTag == "image"){//增加批量插入图片按钮
                                                        editorIconList.splice(i+1, 0, 'multiimage');//在指定索引处插入元素
                                                    }
                                                }
                                            }
                                            editorIconList.push("toggleEditor");
                                        }

                                        
                                        let uploadPath = "control/answer/manage?method=uploadImage&userName="+answer.userName+"&isStaff="+answer.isStaff+"&questionId="+state.questionId;
                                        
                                        if(_answer.isMarkdown != null && _answer.isMarkdown == true){
                                            state.isEditAnswerMarkdownMap.set(answer.id,true);
                                        }else{
                                            state.isEditAnswerMarkdownMap.set(answer.id,false);
                                        }

                                        
                                        

                                        if(!state.isEditAnswerMarkdownMap.get(answer.id)){
                                            //创建富文本编辑器
                                            let editor = createEditor(editAnswerElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                                handleEditAnswerToggleMarkdownEditor(editorId);
                                            },
                                            (editorId: string)=>{
                                                //提及弹窗
                                                mentionPopUp(editorId,undefined)
                                            },
                                            (editorId: string)=>{
                                                //AI弹窗
                                                aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isEditAnswerMarkdownMap.get(answer.id),editor,undefined)
                                            });
                                            
                                            state.editAnswerEditorMap.set(answer.id,editor);
                                        }
                                        
                                        
                            
                                        state.editAnswerEditorCreateParameMap.set(answer.id,{
                                            ref:editAnswerElement,
                                            availableTag:editorIconList,
                                            uploadPath:uploadPath,
                                            userGradeList:null,
                                            editorId:editAnswerElement.getAttribute('editorId'),
                                        });
                                    }
									
								});
			    				
			    			}
			    		}
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //取消修改答案
    const cancelEditAnswer = (answerId:string) => {
        
        let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
        if(editAnswerEditor != null){
            editAnswerEditor.remove();
            state.editAnswerEditorMap.delete(answerId);
            state.editAnswerEditorCreateParameMap.delete(answerId);
            state.editAnswerElementNodes.delete(answerId);
        }
        state.editAnswerFormView.set(answerId,false);
        state.isEditAnswerMarkdownMap.set(answerId,false);
    }
    //修改答案
    const editAnswer = (answerId:string) => {
        state.editAnswer_disabled.set(answerId,true);
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })
        let formData = new FormData();
        formData.append('answerId',  answerId); 

        let answerStatus = state.answerStatusField.get(answerId);
        if(answerStatus){
            formData.append('status',  String(answerStatus)); 
        }
        
        if(state.isEditAnswerMarkdownMap.get(answerId)!= undefined && state.isEditAnswerMarkdownMap.get(answerId) == true){
            
            formData.append('isMarkdown', state.isEditAnswerMarkdownMap.get(answerId).toString());
          
            if(state.editAnswerMarkdownContent[answerId] != undefined){
                formData.append('markdownContent', state.editAnswerMarkdownContent[answerId]);
            }
        }else{
            let editAnswerElement = state.editAnswerElementNodes.get(answerId);
            if(editAnswerElement){
                formData.append('content', editAnswerElement.value);
            }
        }

        

        proxy?.$axios({
            url: '/control/answer/manage?method=edit&a=a',//a=a参数的作用是仅增加连接符&
            method: 'post',
            data: formData
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
			    		
			    		nextTick(()=>{//需要延迟才能让state.editAnswerFormView的设置生效
                            cancelEditAnswer(answerId)
                        })
			    		
			    		
			    		queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.editAnswer_disabled.set(answerId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.editAnswer_disabled.set(answerId,false);
        });
    }

    //删除答案
    const deleteAnswer = (answerId:string) => {
        ElMessageBox.confirm('此操作将删除该答案, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerId', answerId);

            proxy?.$axios({
                url: '/control/answer/manage?method=delete&a=a',//a=a参数的作用是仅增加连接符&
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
				    		//删除缓存
                            store.setCacheNumber();
                            ElMessage({
                                showClose: true,
                                message: '操作成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
				    		queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }


    
    //审核回复
    const auditReply = (replyId:string) => {
        ElMessageBox.confirm('此操作将该回复状态改为已发布, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerReplyId',  replyId); 
            proxy?.$axios({
                url: '/control/answer/manage?method=auditAnswerReply&a=a',//a=a参数的作用是仅增加连接符&
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '审核成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })

                            //删除缓存
                            store.setCacheNumber();
                            queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }


    //添加回复对方表单
    const addReplyFriendUI = (replyId:string) => {
        if(state.addReplyFriendFormView.get(replyId) == true){//如果已打开
            return;
        }
        proxy?.$axios({
            url: '/control/answer/manage',
            method: 'get',
            params: {
                method : 'addAnswerReply',
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		state.addReplyFriendFormView.set(replyId,true);
                        nextTick(()=> {
                            let addReplyFriendElement = state.addReplyFriendElementNodes.get(replyId);
                            if(addReplyFriendElement){
                                addReplyFriendElement.value = "";
                                //编辑器图标
                                let editorIconList = new Array();
                                if(mapData.availableTag != null && mapData.availableTag != ''){
                                    let availableTagObject = JSON.parse(mapData.availableTag);//JSON转为对象

                                    if(availableTagObject != null && availableTagObject.length >0){
                                        for(let i=0; i< availableTagObject.length; i++){
                                            let availableTag = availableTagObject[i];
                                            if(availableTag == "emoticons"){
                                                editorIconList.push(availableTag);
                                            }else if(availableTag == "mention"){
                                                // editorIconList.push(availableTag);
                                            }
                                        }
                                    }
                                }


                                let uploadPath = "control/answer/manage?method=uploadImage&userName="+mapData.userName+"&isStaff=true&questionId="+state.questionId;
                
                                
                                //创建富文本编辑器
                                let editor = createEditor(addReplyFriendElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                                });
                                
                                state.addReplyFriendEditorMap.set(replyId,editor);
                                
                                
                                
                    
                                state.addReplyFriendEditorCreateParameMap.set(replyId,{
                                    ref:addReplyFriendElement,
                                    availableTag:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null,
                                    editorId:addReplyFriendElement.getAttribute('editorId'),
                                });
                            }
                        });
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
        
 
    }
    //取消添加回复对方
    const cancelAddReplyFriend = (replyId:string) => {
        
        let addReplyFriendEditor = state.addReplyFriendEditorMap.get(replyId);
        if(addReplyFriendEditor != null){
            addReplyFriendEditor.remove();
            state.addReplyFriendEditorMap.delete(replyId);
            state.addReplyFriendEditorCreateParameMap.delete(replyId);
            state.addReplyFriendElementNodes.delete(replyId);
        }
        state.addReplyFriendFormView.set(replyId,false);
        
    }

     //添加回复对方
     const addReplyFriend = (answerId:string,replyId:string) => {
        state.addReplyFriend_disabled.set(replyId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
			
        formData.append('answerId',  answerId); 

        formData.append('friendReplyId',  replyId); 
        
        let addReplyFriendElement = state.addReplyFriendElementNodes.get(replyId);
        if(addReplyFriendElement){
            formData.append('content', addReplyFriendElement.value);
        }

        proxy?.$axios({
            url: '/control/answer/manage?method=addAnswerReply',
            method: 'post',
            data: formData
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

                        nextTick(()=>{//需要延迟才能让state.addReplyFriendFormView的设置生效
                            cancelAddReplyFriend(replyId);
                        })


			    		queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.addReplyFriend_disabled.set(replyId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.addReplyFriend_disabled.set(replyId,false);
        });
    }


    //添加回复表单
    const addReplyUI = (answerId:string) => {
        if(state.addReplyFormView.get(answerId) == true){//如果已打开
            return;
        }
        
        proxy?.$axios({
            url: '/control/answer/manage',
            method: 'get',
            params: {
                method : 'addAnswerReply',
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
                        state.addReplyFormView.set(answerId,true);
                        nextTick(()=> {
                            let addReplyElement = state.addReplyElementNodes.get(answerId);
                            if(addReplyElement){
                                addReplyElement.value = "";

                                //编辑器图标
                                let editorIconList = new Array();
                                if(mapData.availableTag != null && mapData.availableTag != ''){
                                    let availableTagObject = JSON.parse(mapData.availableTag);//JSON转为对象

                                    if(availableTagObject != null && availableTagObject.length >0){
                                        for(let i=0; i< availableTagObject.length; i++){
                                            let availableTag = availableTagObject[i];
                                            if(availableTag == "emoticons"){
                                                editorIconList.push(availableTag);
                                            }else if(availableTag == "mention"){
                                                //   editorIconList.push(availableTag);
                                            }
                                        }
                                    }
                                }

                                
                                let uploadPath = "control/answer/manage?method=uploadImage&userName="+mapData.userName+"&isStaff=true&questionId="+state.questionId;
                
                                
                                //创建富文本编辑器
                                let editor = createEditor(addReplyElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                                });
                                
                                state.addReplyEditorMap.set(answerId,editor);
                                
                                
                                
                    
                                state.addReplyEditorCreateParameMap.set(answerId,{
                                    ref:addReplyElement,
                                    availableTag:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null,
                                    editorId:addReplyElement.getAttribute('editorId'),
                                });
                            }
                        });
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }
    //取消添加回复
    const cancelAddReply = (answerId:string) => {
        let addReplyEditor = state.addReplyEditorMap.get(answerId);
        if(addReplyEditor != null){
            addReplyEditor.remove();
            state.addReplyEditorMap.delete(answerId);
            state.addReplyEditorCreateParameMap.delete(answerId);
            state.addReplyElementNodes.delete(answerId);
        }
        state.addReplyFormView.set(answerId,false);
        
    }
    //添加回复
    const addReply = (answerId:string) => {
        state.addReply_disabled.set(answerId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
			
        formData.append('answerId',  answerId); 
			
        let addReplyElement = state.addReplyElementNodes.get(answerId);
        if(addReplyElement){
            formData.append('content', addReplyElement.value);
        }

        proxy?.$axios({
            url: '/control/answer/manage?method=addAnswerReply',
            method: 'post',
            data: formData
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


                        nextTick(()=>{//需要延迟才能让state.addReplyFormView的设置生效
                            cancelAddReply(answerId)
                        })

			    		queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.addReply_disabled.set(answerId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.addReply_disabled.set(answerId,false);
        });
    }


    //修改回复表单
    const editReplyUI = (reply:AnswerReply) => {
        if(state.editReplyFormView.get(reply.id) == true){//如果已打开
            return;
        }
        
        proxy?.$axios({
            url: '/control/answer/manage',
            method: 'get',
            params: {
                method : 'editAnswerReply',
                answerReplyId : reply.id,
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
                        for(let key in mapData){
			    			if(key == "answerReply"){//回复
			    				let _reply = mapData[key];
                                
                                state.editReplyFormView.set(reply.id,true);
                                nextTick(()=> {
                                    let editReplyElement = state.editReplyElementNodes.get(reply.id);
                                    if(editReplyElement){
                                        editReplyElement.value = _reply.content;
                                        //编辑器图标
                                        let editorIconList = new Array();
                                        if(mapData.availableTag != null && mapData.availableTag != ''){
                                            let availableTagObject = JSON.parse(mapData.availableTag);//JSON转为对象

                                            if(availableTagObject != null && availableTagObject.length >0){
                                                for(let i=0; i< availableTagObject.length; i++){
                                                    let availableTag = availableTagObject[i];
                                                    if(availableTag == "emoticons"){
                                                        editorIconList.push(availableTag);
                                                    }else if(availableTag == "mention"){
                                                        editorIconList.push(availableTag);
                                                    }
                                                }
                                            }
                                        }


                                        let uploadPath = "control/answer/manage?method=uploadImage&userName="+_reply.userName+"&isStaff="+_reply.isStaff+"&topicId="+state.questionId;
                                        
                                        //创建富文本编辑器
                                        let editor = createEditor(editReplyElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                            
                                        },
                                        (editorId: string)=>{
                                            //提及弹窗
                                            mentionPopUp(editorId,undefined)
                                        },
                                        (editorId: string)=>{
                                            //AI弹窗
                                            aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                                        });
                                        
                                        state.editReplyEditorMap.set(reply.id,editor);
                                        
                                        
                                        
                            
                                        state.editReplyEditorCreateParameMap.set(reply.id,{
                                            ref:editReplyElement,
                                            availableTag:editorIconList,
                                            uploadPath:uploadPath,
                                            userGradeList:null,
                                            editorId:editReplyElement.getAttribute('editorId'),
                                        });
                                    }
                                });
                            }
                        }

                        
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
	}
    //取消修改回复
    const cancelEditReply = (replyId:string) => {
        let editReplyEditor = state.editReplyEditorMap.get(replyId);
        if(editReplyEditor != null){
            editReplyEditor.remove();
            state.editReplyEditorMap.delete(replyId);
            state.editReplyEditorCreateParameMap.delete(replyId);
            state.editReplyElementNodes.delete(replyId);
        }
		state.editReplyFormView.set(replyId,false);
    }
    //修改回复
    const editReply = (replyId:string) => {
        state.editReply_disabled.set(replyId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
		formData.append('answerReplyId',  replyId); 
			

        let replyStatus = state.replyStatusField.get(replyId);
        if(replyStatus){
            formData.append('status', String(replyStatus));
        }

        let editReplyElement = state.editReplyElementNodes.get(replyId);
        if(editReplyElement){
            formData.append('content', editReplyElement.value);
        }


        proxy?.$axios({
            url: '/control/answer/manage?method=editAnswerReply',
            method: 'post',
            data: formData
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
			    		
                        nextTick(()=>{//需要延迟才能让state.editReplyFormView的设置生效
                            cancelEditReply(replyId);
                        })
						
			    		
			    		queryQuestion();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.editReply_disabled.set(replyId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.editReply_disabled.set(replyId,false);
        });
    }

    //恢复回复
    const recoveryReply = (replyId:string) => {
        ElMessageBox.confirm('此操作将恢复该回复, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('replyId', replyId);
            proxy?.$axios({
                url: '/control/answer/manage?method=recoveryReply',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '操作成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })
                            queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }
    //删除回复
    const deleteReply = (replyId:string) => {
        ElMessageBox.confirm('此操作将删除该回复, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('answerReplyId', replyId);
            proxy?.$axios({
                url: '/control/answer/manage?method=deleteAnswerReply',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(result){
				    	if(result.code === 200){//成功
                            ElMessage({
                                showClose: true,
                                message: '操作成功',
                                type: 'success',
                                onClose: ()=>{
                                    
                                }
                            })

                            queryQuestion();
				    	}else if(result.code === 500){//错误
				    		
                            //处理错误信息
                            processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

				    		
				    	}
				    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        })
        .catch((error) => {
            console.log(error);
        });
    }


    //清除追加问题列表
    const clearAppendQuestionList = () => {
        state.question.appendQuestionItemList.length = 0;
        for (const [key, value] of Object.entries(state.editAppendQuestionEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.editAppendQuestionEditorMap.clear();
        state.editAppendQuestionEditorCreateParameMap.clear();
        state.isEditAppendQuestionMarkdownMap.clear();
        state.editAppendQuestionMarkdownContent = {} as any;//修改评论markdown编辑内容 key:评论Id value:评论内容

        state.editAppendQuestionFormView.clear();
        state.editAppendQuestionEditorPlugin.length = 0;//插件

    }

	//清除答案列表
    const clearAnswerList = () => {
        state.answerList.length =0;

        for (const [key, value] of Object.entries(state.editAnswerEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.editAnswerEditorMap.clear();
        state.editAnswerEditorCreateParameMap.clear();

        state.isEditAnswerMarkdownMap.clear();
        state.editAnswerMarkdownContent = {} as any;//修改答案markdown编辑内容 key:答案Id value:答案内容
        state.editAnswerElementNodes.clear();
        state.editAnswerFormView.clear();

        state.editAnswerEditorPlugin.length = 0;//插件

        for (const [key, value] of Object.entries(state.addReplyEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.addReplyEditorMap.clear();
        state.addReplyFormView.clear() //添加回复表单
        state.addReplyEditorCreateParameMap.clear()//添加回复编辑器的创建参数
        state.addReplyElementNodes.clear();

        for (const [key, value] of Object.entries(state.addReplyFriendEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.addReplyFriendEditorMap.clear();
        state.addReplyFriendFormView.clear() //添加回复对方表单
        state.addReplyFriendEditorCreateParameMap.clear()//添加回复对方编辑器的创建参数
        state.addReplyFriendElementNodes.clear();

        for (const [key, value] of Object.entries(state.editReplyEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.editReplyEditorMap.clear();
        state.editReplyFormView.clear() //修改回复表单
        state.editReplyEditorCreateParameMap.clear()//修改回复编辑器的创建参数
        state.editReplyElementNodes.clear();
    }

    //点击回复层级
    const clickReplyLevel = (answerId:string,replyId:string) => {
       
       //是否点击已选中的项
       let isSelectedItem = false;


       if(state.dot.size >0){
           let lastFriendReplyId = [...state.dot][state.dot.size-1];//最后一个元素
           if(lastFriendReplyId[0] == replyId){
               isSelectedItem = true;
           }
       }

       state.dot.clear();
       state.line.clear();
       if(!isSelectedItem){
           showReplyLevel(answerId,replyId);
       }
       
   }

   //关闭回复层级
   const closeReplyLevel = () => {
        state.dot.clear();
        state.line.clear();
    }

   //展示回复层级
   const showReplyLevel = (answerId:string,replyId:string) => {

       let dotArray = new Array();
       let replyList = [] as Array<AnswerReply>;
       if(state.answerList != null && state.answerList.length > 0){
           A:for (let i = 0; i <state.answerList.length; i++) {
               let answer = state.answerList[i];
               
                if(answer.id == answerId){
                   //回复
                   if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                       replyList = answer.answerReplyList;
                       for (let j = 0; j <answer.answerReplyList.length; j++) {
                           let reply = answer.answerReplyList[j];
                           if(reply.id == replyId && reply.friendUserName != null && reply.friendUserName != ''){
                               let friendReplyIdArray = reply.friendReplyIdGroup.split(",");
                               for (let k = 0; k <friendReplyIdArray.length; k++) {
                                   let friendReplyId = friendReplyIdArray[k];
                                   if(friendReplyId != '' && friendReplyId != '0'){
                                       dotArray.push(friendReplyId);
                                   }
                               }
                               break A;
                           }
                       }
                   }
                }                       
               
           }
       }

       //第一个有效层级
       let firstLevel = '';

       A:for (let i = 0; i <dotArray.length; i++) {
           let friendReplyId = dotArray[i];
           for (let j = 0; j <replyList.length; j++) {
               let reply = replyList[j];
               if(reply.id == friendReplyId){
                   firstLevel = friendReplyId;
                   break A;
               }
           }
       }

       //过滤无效的点
       A:for (let i = dotArray.length - 1; i >= 0; i--) {
           let friendReplyId = dotArray[i];
           for (let j = 0; j <replyList.length; j++) {
               let reply = replyList[j];
               if(reply.id == friendReplyId){
                   continue A;
               }
           }
           dotArray.splice(i, 1);
       }

       if(dotArray.length >0){
           for (let i = 0; i <dotArray.length; i++) {
               let friendReplyId = dotArray[i];
               state.dot.set(friendReplyId,true);//楼中楼的点
           }
           for (let i = 0; i <replyList.length; i++) {
               let reply = replyList[i];
               if(reply.id == firstLevel){
                   state.line.set(reply.id,true);//楼中楼的线
                   continue;
               }
               if(reply.id == replyId){
                   break;
               }
               if(state.line.size >0){
                   state.line.set(reply.id,true);//楼中楼的线
               }
           }

           state.dot.set(replyId,true);//楼中楼点击的层
       }
    }

    /**
     * 风控处罚
     * @param module 模块  10.话题、30.评论、50.评论回复、70.问题、90.答案、110.答案回复
     * @param parameterId 参数Id
     */
    const onRiskControlPenalty = (module:number,parameterId:string) => {
        state.popup_riskControlPenalty = true;//风控处罚弹出层
        state.penaltyModule = module;
        state.penaltyParameterId = parameterId;

        state.penaltyTotalrecord =0; //总记录数
        state.penaltyCurrentpage = 1; //当前页码
        state.penaltyTotalpage = 1; //总页数
        state.penaltyMaxresult= 12; //每页显示记录数
        state.isShowPenaltyPage=false;//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误


        queryRiskControlPenaltyList(1);
    }

    //风控处罚分页
    const penaltyPage = (page:number) => {
        queryRiskControlPenaltyList(page);
    }

    //跳转‘修改风控模型‘页
    const toEditRiskControlModel = (riskControlModelId:number) => {

        emit('onJumpPage','4-400700-1',()=>{router.push({path : '/admin/control/riskControlModel/manage/edit',query:{ riskControlModelId : riskControlModelId}})});
        
    }
    

    //查询贴子的风控处罚记录
    const queryRiskControlPenaltyList = (page:number) => {
        //清空内容
        state.penaltyTableData = []; 
        
        proxy?.$axios({
            url: '/control/penaltyPostInfo/riskControlPenaltyList',
            method: 'get',
            params: {
                module: state.penaltyModule,
                parameterId: state.penaltyParameterId,
                page :  page
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
			    			state.penaltyTableData = list;
			 
			    			state.penaltyTotalrecord = parseInt(pageView.totalrecord);//服务器返回的long类型已转为String类型
			    			state.penaltyCurrentpage = pageView.currentpage;
							state.penaltyTotalpage = parseInt(pageView.totalpage);//服务器返回的long类型已转为String类型
							state.penaltyMaxresult = pageView.maxresult;
							state.isShowPenaltyPage = true;//显示分页栏
			    		}
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});
				    	
			    	}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    

    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

		
        if(router.currentRoute.value.query.visible != undefined && router.currentRoute.value.query.visible != ''){
			state.visible = router.currentRoute.value.query.visible as string;
		}
		if(router.currentRoute.value.query.questionId != undefined && router.currentRoute.value.query.questionId != ''){
			state.questionId = router.currentRoute.value.query.questionId as string;
		}
		if(router.currentRoute.value.query.answerId != undefined && router.currentRoute.value.query.answerId != ''){
			state.answerId = router.currentRoute.value.query.answerId as string;
		}
		if(router.currentRoute.value.query.page != undefined && router.currentRoute.value.query.page != ''){
			state.currentpage = parseInt(router.currentRoute.value.query.page as string);
		}
		
		//上级路由解码
		if(router.currentRoute.value.query.questionView_beforeUrl != undefined && router.currentRoute.value.query.questionView_beforeUrl != ''){
            let parsedWordArray = enc.Base64url.parse(router.currentRoute.value.query.questionView_beforeUrl as string);
            let decrypt = parsedWordArray.toString(enc.Utf8);
			
			let decryptObject = JSON.parse(decrypt);
			
			let query = decryptObject.query;
			for(let q in query){
				query[q] = decodeURIComponent(query[q]);
			}
			state.sourceUrlObject = {
				path : decryptObject.path,
				query :query
			}
		}
		
		
		queryQuestion();
        
    }) 


    //keep-alive 进入时
    onActivated (()=>{
        if (Object.keys(state.addAnswerEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isAddAnswerMarkdown){
                //创建富文本编辑器
                state.addAnswerEditor = createEditor(
                    state.addAnswerEditorCreateParameObject.ref, 
                    state.addAnswerEditorCreateParameObject.availableTag, 
                    state.addAnswerEditorCreateParameObject.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAddAnswerToggleMarkdownEditor(state.addAnswerEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(state.addAnswerEditorCreateParameObject.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,state.addAnswerEditorCreateParameObject.editorId,state.addAnswerEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAddAnswerMarkdown,state.addAnswerEditor,undefined)
                    }
                );
            }
		}
		
		
	
		//创建富文本编辑器
		state.editAnswerEditorCreateParameMap.forEach(function(value,key){
            if(!state.isEditAnswerMarkdownMap.get(key)){
                let editor = createEditor(
                    value.ref, 
                    value.availableTag, 
                    value.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditAnswerToggleMarkdownEditor(value.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(value.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,state.isEditAnswerMarkdownMap.get(key),editor,undefined)
                    }
                );
            
                state.editAnswerEditorMap.set(key,editor);
            }
			
	    });
	
		if (Object.keys(state.editQuestionEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isEditQuestionMarkdown){
                //创建富文本编辑器
                state.editQuestionEditor = createEditor(
                    state.editQuestionEditorCreateParameObject.ref, 
                    state.editQuestionEditorCreateParameObject.availableTag, 
                    state.editQuestionEditorCreateParameObject.uploadPath, 
                    state.editQuestionEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditQuestionToggleMarkdownEditor(state.editQuestionEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(state.editQuestionEditorCreateParameObject.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,state.editQuestionEditorCreateParameObject.editorId,state.editQuestionEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditQuestionMarkdown,state.editQuestionEditor,undefined)
                    }
                );
            }
			
		}
		
		if (Object.keys(state.appendQuestionEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isAppendQuestionMarkdown){
                //创建富文本编辑器
                state.appendQuestionEditor = createEditor(
                    state.appendQuestionEditorCreateParameObject.ref, 
                    state.appendQuestionEditorCreateParameObject.availableTag, 
                    state.appendQuestionEditorCreateParameObject.uploadPath, 
                    state.appendQuestionEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAppendQuestionToggleMarkdownEditor(state.appendQuestionEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(state.appendQuestionEditorCreateParameObject.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,state.appendQuestionEditorCreateParameObject.editorId,state.appendQuestionEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAppendQuestionMarkdown,state.appendQuestionEditor,undefined)
                    }
                );
            }
			
		}
		
		//创建富文本编辑器
		state.editAppendQuestionEditorCreateParameMap.forEach(function(value,key){           
            if(!state.isEditAppendQuestionMarkdownMap.get(key)){
                let editor = createEditor(
                    value.ref, 
                    value.availableTag, 
                    value.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditAppendQuestionToggleMarkdownEditor(value.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(value.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,state.isEditAppendQuestionMarkdownMap.get(key),editor,undefined)
                    }
                );
            
                state.editAppendQuestionEditorMap.set(key,editor);
            }
	    });
        //创建添加回复富文本编辑器
        state.addReplyEditorCreateParameMap.forEach(function(value,key){
            let editor = createEditor(
                value.ref, 
                value.availableTag, 
                value.uploadPath, 
                null,
                store_fileStorageSystem.value,
                ()=>{
                },
                ()=>{
                    //提及弹窗
                    mentionPopUp(value.editorId,undefined)
                },
                ()=>{
                    //AI弹窗
                    aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                }
            );
        
            state.addReplyEditorMap.set(key,editor);
	    });
        //创建添加回复对方富文本编辑器
		state.addReplyFriendEditorCreateParameMap.forEach(function(value,key){
            let editor = createEditor(
                value.ref, 
                value.availableTag, 
                value.uploadPath, 
                null,
                store_fileStorageSystem.value,
                ()=>{
                },
                ()=>{
                    //提及弹窗
                    mentionPopUp(value.editorId,undefined)
                },
                ()=>{
                    //AI弹窗
                    aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                }
            );
        
            state.addReplyFriendEditorMap.set(key,editor);
	    });
        //创建修改回复富文本编辑器
		state.editReplyEditorCreateParameMap.forEach(function(value,key){
            let editor = createEditor(
                value.ref, 
                value.availableTag, 
                value.uploadPath, 
                null,
                store_fileStorageSystem.value,
                ()=>{
                },
                ()=>{
                    //提及弹窗
                    mentionPopUp(value.editorId,undefined)
                },
                ()=>{
                    //AI弹窗
                    aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,false,editor,undefined)
                }
            );
        
            state.editReplyEditorMap.set(key,editor);
	    });

    })


    // keep-alive 离开时
    onDeactivated (()=>{

        if(Object.keys(state.addAnswerEditor).length != 0){
			state.addAnswerEditor.remove();
            state.addAnswerEditor = {};
		}
		
		state.editAnswerEditorMap.forEach(function(value,key){
			value.remove();
	    });
		state.editAnswerEditorMap.clear();
		
		if(Object.keys(state.editQuestionEditor).length != 0){
			state.editQuestionEditor.remove();
            state.editQuestionEditor = {};
		}
		
		if(Object.keys(state.appendQuestionEditor).length != 0){
			state.appendQuestionEditor.remove();
            state.appendQuestionEditor = {};
		}
		state.editAppendQuestionEditorMap.forEach(function(value,key){
			value.remove();
	    });

        state.addReplyEditorMap.forEach(function(value,key){
			value.remove();
	    });
		state.addReplyEditorMap.clear();

        state.addReplyFriendEditorMap.forEach(function(value,key){
			value.remove();
	    });
		state.addReplyFriendEditorMap.clear();

        state.editReplyEditorMap.forEach(function(value,key){
			value.remove();
	    });
		state.editReplyEditorMap.clear();

    })

</script>
<style scoped lang="scss">
.questionViewModule{
	.question-wrap{
        background: #fff;
        position: relative;
        .questionTag{
            padding-top:15px;
            margin-left:10px;
            margin-right: 300px;
            .tag{
                display: inline-block;
                font-size: 14px;
                line-height: 14px;
                padding: 6px 8px 6px 8px;
                margin-right: 5px;
                border-radius: 3px;
                color: #555;
                background-color: #f5f5f6;
                position:relative;
                margin-bottom:10px;
            }
        }
        .operat{
            position: absolute;
            top: 18px;
            right: 10px;
            .item{
                margin-left: 10px;
                line-height: 24px;
            }
        }
        .head{
            height: auto;
            padding:15px 10px 5px 10px;
            .title{
                color:#303133;
                font-size:24px;
                border:none;
                line-height:34px; 
                margin:9px 0 18px 0;
            }
            .questionInfo{
                color: #909399;font-size: 14px;
                .avatar{
                    float: left;
                    .avatar-wrapper{
                        .avatar-badge{
                            .el-avatar--icon{
                                margin-bottom: 5px;
                            }
                        }
                    }
                }
                .userName{
                    float: left;margin-left: 10px;position: relative;top: 50px;
                    .nickname{
                        position: absolute;left: 0px;top: -26px;white-space: nowrap;
                    }
                }
                .postTime{
                    float: left;margin-left: 20px;position: relative;top: 50px;
                }
                .viewTotal-icon{
                    float: left;margin-left: 20px; position: relative;top: 51px;
                }
                .viewTotal{
                    float: left;margin-left: 3px;  position: relative;top: 48px;
                }
                .answer-icon{
                    float: left;margin-left: 20px;position: relative;top: 51px;
                }
                .answer{
                    float: left;margin-left: 3px;  position: relative;top: 48px;
                }
                .ipAddress{
                    float: right;position: relative;top: 48px;
                    .statusTagInfo{
                        position: absolute;right:0px; top: -30px;white-space: nowrap;
                    }
                }
                .green-tag{
                    display: inline-block;
                    font-size: 14px;
                    line-height: 14px;
                    padding: 6px 8px 6px 8px;
                    border-radius: 3px;
                    color:#67C23A;
                    background-color:#e1f3d8;
                    margin-left: 6px;
                }
                .orange-tag{
                    display: inline-block;
                    font-size: 14px;
                    line-height: 14px;
                    padding: 6px 8px 6px 8px;
                    border-radius: 3px;
                    color:#E6A23C;
                    background-color:#faecd8;
                    margin-left: 6px;
                }
                .red-tag{
                    display: inline-block;
                    font-size: 14px;
                    line-height: 14px;
                    padding: 6px 8px 6px 8px;
                    border-radius: 3px;
                    color:#F56C6C;
                    background-color:#fde2e2;
                    margin-left: 6px;
                }
            }
            .el-badge__content.is-fixed{
                top: 1px;
            }
        }
        :deep(.questionMarkdownContent) {
            margin: 0px 10px 10px 10px;
            padding-top:10px;
            padding-bottom:15px;
            min-height: 80px;
            font-size: 15px;
            line-height: 1.8;
            color: #222;
            border-top: 1px solid #f1f1f1;
            word-wrap : break-word;word-break : break-all;
            .reward{
                background: #fcf3e6;
                border-radius:3px;
                margin: 6px 6px;
                text-align: center;
                .rewardInfo{
                    padding: 10px 10px 8px 10px;color: #e2b46d;font-size: 15px;
                    .icon{
                        font-size: 16px; position: relative;top: 1px;
                    }
                    .symbol{
                        font-family:Arial;font-weight:normal;display:inline-block;margin-left: 5px;color: #cca558;
                    }
                    .amount{
                        margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 16px;
                    }
                    .point{
                        color: #cca558; margin-right: 5px;font-weight: 700;font-size: 16px;
                    }
                }
            }
            .lastUpdateTime{
                text-align: center;line-height: 40px;padding-bottom: 30px;color: #939499;
            }
            a{
                color: #26a2ff;
            }
            i {
                font-style:normal;
            }
            //自动换行
            pre{
                white-space:pre-wrap;
            }
            
            ol{
                list-style: decimal;
            }
            ol li{
                list-style-type:decimal;
                list-style-position:inside;
            }
            ul{
                list-style: disc;
            }
            // ul li{
                //   list-style-type:disc;
            //  }
            .task-list-item {
                list-style-type:none;
            }
            .download{
                color: #1890ff;
                margin: 0 5px 0 5px;
                cursor: pointer;
                .link-icon {
                    position: relative;
                    top: 4px;
                    margin-right: 2px;
                    color:#1890ff;
                    width: 20px; height: 20px;
                }
            }
            p{
                font-size:16px;
                word-wrap : break-word;word-break : break-all;
            }
            code[class*="language-"]{
                padding: 0 0;
            }
            pre code{/*连续字母数字换行*/
                word-break: break-all;
            }
            img{
                max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                cursor: -webkit-zoom-in;
                cursor: zoom-in;
                vertical-align: sub;
            }
            .el-image[style*="width: 32px; height: 32px;"]{
                top: 3px;
            }
            iframe{
                width:100%; height: 550px;padding:10px 0px; 
            }
            video{
                width:100%; height: 550px;padding:10px 0px; outline:none;
            }
            table {
                width: 100%;
                th {
                    font-weight: 600
                }
                td,
                th {
                    border: 1px solid #E5E6EB;
                    padding: 6px 13px
                }
                tr {
                    background-color: #fff;
                    border-top: 1px solid #E5E6EB;
                    &:nth-child(2n) {
                        background-color: #F7F8FA;
                    }
                }
            }
            ol{
                li{ 
                    list-style-type:decimal;
                    list-style-position:inside;
                }
            }
            ul{
                li{ 
                    margin-left:20px;
                    list-style-type:disc;
                }
            }
        }
        :deep(.main) {
            margin: 0px 10px 10px 10px;
            padding-top:10px;
            padding-bottom:15px;
            min-height: 80px;
            font-size: 15px;
            line-height: 1.8;
            color: #222;
            border-top: 1px solid #f1f1f1;
            word-wrap : break-word;word-break : break-all;
            .reward{
                background: #fcf3e6;
                border-radius:3px;
                margin: 6px 6px;
                text-align: center;
                .rewardInfo{
                    padding: 10px 10px 8px 10px;color: #e2b46d;font-size: 15px;
                    .icon{
                        font-size: 16px; position: relative;top: 1px;
                    }
                    .symbol{
                        font-family:Arial;font-weight:normal;display:inline-block;margin-left: 5px;color: #cca558;
                    }
                    .amount{
                        margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 16px;
                    }
                    .point{
                        color: #cca558; margin-right: 5px;font-weight: 700;font-size: 16px;
                    }
                }
            }
            .lastUpdateTime{
                text-align: center;line-height: 40px;padding-bottom: 30px;color: #939499;
            }
            a{
                font-size: 15px;
                line-height: 1.8;
                color: #26a2ff;
            }
            i {
                font-style:normal;
            }
            p{word-wrap : break-word;word-break : break-all;}
            /* 自动换行 */
            pre{
                white-space:pre-wrap;
                code{/*连续字母数字换行*/
                    word-break: break-all;
                }
            }
            img{
                max-width:100%;height:auto;border:none;background:none;padding:0;vertical-align: sub;
            }
            .el-image[style*="width: 32px; height: 32px;"]{
                top: 3px;
            }
            .download{
                color: #1890ff;
                margin: 0 5px 0 5px;
                cursor: pointer;
                .link-icon {
                    position: relative;
                    top: 4px;
                    margin-right: 2px;
                    color:#1890ff;
                    width: 20px; height: 20px;
                }
            }
            table {
                width: 100%;
                th {
                    font-weight: 600
                }
                td,
                th {
                    border: 1px solid #E5E6EB;
                    padding: 6px 13px
                }
                tr {
                    background-color: #fff;
                    border-top: 1px solid #E5E6EB;
                    &:nth-child(2n) {
                        background-color: #F7F8FA;
                    }
                }
            }
            ol{
                li{ 
                    list-style-type:decimal;
                    list-style-position:inside;
                }
            }
            ul{
                li{ 
                    margin-left:20px;
                    list-style-type:disc;
                }
            }
            iframe{
                width:100%; height: 550px;padding:10px 0px; 
            }
            video{
                width:100%; height: 550px;padding:10px 0px; outline:none;
            }
        }
        //举报标记
        .reportMark{
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -8px;
                bottom:0px;
                border-left: 5px solid #f89898;
            }
        }
        .odd{
            .appendHead{
                color: #f9ce00;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -8px;
                bottom:0px;
                border-left: 5px solid #f9ce00;
            }
        }
        .even{
            .appendHead{
                color: #85eb4e;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -8px;
                bottom:0px;
                border-left: 5px solid #85eb4e;
            }
        }
        .appendBox{
            margin: 25px 10px 10px 10px;
            position:relative;
            .appendHead {
                height: 24px;
                .prompt{
                    font-size: 14px;
                    line-height: 34px;
                }
                .appendTime{
                    margin-left:5px;
                    font-size: 14px;
                    line-height: 34px;
                }
                .operating{
                    font-size: 14px;
                    margin-left:12px;
                    position: relative;
                    top: -2px;
                }
            }
            :deep(.appendMarkdownContent) {
                padding:20px 0px;
                color:#333;
                font-size:16px;
                line-height:28px; 
                word-wrap : break-word;word-break : break-all;
                min-height: 80px;
                a{
                    color: #26a2ff;
                }
                //自动换行
                pre{
                    white-space:pre-wrap;
                }
                
                ol{
                    list-style: decimal;
                }
                ol li{
                    list-style-type:decimal;
                    list-style-position:inside;
                }
                ul{
                    list-style: disc;
                }
                .task-list-item {
                    list-style-type:none;
                }
                p{
                    font-size:16px;
                    word-wrap : break-word;word-break : break-all;
                }
                code[class*="language-"]{
                    padding: 0 0;
                }
                img{
                    max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                    cursor: -webkit-zoom-in;
                    cursor: zoom-in;
                    vertical-align: sub;
                }
                .el-image[style*="width: 32px; height: 32px;"]{
                    top: 3px;
                }
                table {
                    width: 100%;
                    th {
                        font-weight: 600
                    }
                    td,
                    th {
                        border: 1px solid #E5E6EB;
                        padding: 6px 13px
                    }
                    tr {
                        background-color: #fff;
                        border-top: 1px solid #E5E6EB;
                        &:nth-child(2n) {
                            background-color: #F7F8FA;
                        }
                    }
                }
                ol{
                    li{ 
                        list-style-type:decimal;
                        list-style-position:inside;
                    }
                }
                ul{
                    li{ 
                        margin-left:20px;
                        list-style-type:disc;
                    }
                }
                iframe{
                    width:100%; height: 550px;padding:10px 0px; 
                }
                
            }
            :deep(.appendContent) {
                padding:20px 0px;
                color:#333;
                font-size:16px;
                line-height:28px; 
                word-wrap : break-word;word-break : break-all;
                min-height: 80px;
                a{
                    color: #26a2ff;
                }
                i {
                    font-style:normal;
                }
                p{font-size:16px;word-wrap : break-word;word-break : break-all;}
                pre{
                    white-space:pre-wrap;
                    code{/*连续字母数字换行*/
                        word-break: break-all;
                    }
                }
                img{
                    max-width:100%;height:auto;border:none;background:none;padding:0;vertical-align: sub;
                }
                .el-image[style*="width: 32px; height: 32px;"]{
                    top: 3px;
                }
                iframe{
                    width:100%; height: 550px;padding:10px 0px; 
                }
                video{
                    width:100%; height: 550px;padding:10px 0px; outline:none;
                }
                table {
                    width: 100%;
                    th {
                        font-weight: 600
                    }
                    td,
                    th {
                        border: 1px solid #E5E6EB;
                        padding: 6px 13px
                    }
                    tr {
                        background-color: #fff;
                        border-top: 1px solid #E5E6EB;
                        &:nth-child(2n) {
                            background-color: #F7F8FA;
                        }
                    }
                }
                ol{
                    li{ 
                        list-style-type:decimal;
                        list-style-position:inside;
                    }
                }
                ul{
                    li{ 
                        margin-left:20px;
                        list-style-type:disc;
                    }
                }
            }
        }
    }
    /* 追加问题 */
    .appendQuestion{
        margin-left: 10px;
        margin-right: 10px; 
        margin-top: 40px; 
        margin-bottom: 10px;
        :deep(.bytemd){
            height: calc(100vh - 100px);
            
        }
        :deep(.CodeMirror-scroll){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
        :deep(.bytemd-preview){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
    }
    /* 修改追加问题  */
    .editAppendQuestion-post{
        .editAppendQuestion-formModule {
            margin-top:50px;
            margin-left: 75px;
            .editAppendQuestion-wrap{
                position: relative;
                padding:6px 20px 50px 20px;
                background: #f9f9f9;
                :deep(.bytemd-split){
                    height: calc(100vh - 100px);
                }
                :deep(.bytemd-split .CodeMirror-scroll){//让外层滚动条不滚动
                    overscroll-behavior:  contain;
                }
                :deep(.bytemd-split .bytemd-preview){//让外层滚动条不滚动
                    overscroll-behavior:  contain;
                }
                :deep(.bytemd-editor){
                    min-height: 250px; 
                }
                :deep(.CodeMirror-sizer){
                    min-height: 245px !important; 
                }
                :deep(.bytemd-preview){
                    min-height: 250px; 
                }
                //编辑器边框
                :deep(.bytemd-editor){
                    border-top: 1px solid #e5e6eb;
                    border-left: 1px solid transparent;
                    border-right: 1px solid transparent;
                    
                    border-radius:0px;
                }
                :deep(.bytemd-status){
                    border: 1px solid transparent;
                    border-top: 1px solid #e5e6eb;
                    border-radius:0px;
                }
                :deep(.bytemd-preview){
                    border-top: 1px solid #e5e6eb;
                    border-left: 1px solid transparent;
                    border-right: 1px solid transparent;
                    border-radius:0px;
                }
                :deep(.bytemd-split .bytemd-editor){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-sidebar){
                    border-top-left-radius:0px;
                    border-left: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(~ .bytemd-sidebar)){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(+ .bytemd-preview:not([style*='display:none']))){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(~ .bytemd-hidden)){
                    border-right: 1px solid transparent;
                }
                :deep(.bytemd-preview:has(+ .bytemd-sidebar)){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-preview:has(~ .bytemd-hidden)){
                    border-right: 1px solid transparent;
                }

                /* 富文本编辑框颜色 */
                :deep(.ke-edit) {
                    border: 1px solid transparent;
                }


                .head-tag{
                    .icon{
                        position: absolute;font-size: 50px;top: -38px;left: -43px;color: #f9f9f9;
                    }
                }
                .el-form-item__label{
                    line-height: 20px;
                }
                .el-form--label-top{
                    .el-form-item__label{
                        padding :10px 0px 0px 0px;
                    }
                }
                .el-form-item__content{
                    line-height: 30px;
                }
                .el-form-item {
                    margin-bottom: 10px;
                }
                .editAppendQuestion-textarea{
                    width:100%;visibility:hidden;height: 200px;
                }
                .promptInfo{
                    position: absolute;
                    right:15px;
                    bottom:32px;
                    h2{
                        font-size: 16px;
                        color: #ccc;
                    }
                }
                .form-action {
                    padding-left: 0px; padding-right: 0px; padding-top: 8px;margin-bottom: 12px;
                }
                .editAppendQuestionSubmit {
                    height: 38px;
                    float: left;
                    margin-right: 10px;
                    position: relative;
                    z-index: 2
                }
            }
        }
    }
    .el-link--default{
        color: #909399 !important;
        &:hover {
            color: #409EFF !important;
        }
    }
    .el-link--default.is-disabled{
        color: #dedfe0 !important;
    }


    /* 修改问题 */
    .editQuestion{
        margin-left: 10px;margin-right: 10px; margin-top: 40px; margin-bottom: 10px;
        :deep(.bytemd){
            height: calc(100vh - 100px);
            
        }
        :deep(.CodeMirror-scroll){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
        :deep(.bytemd-preview){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
    }

}



.questionViewModule_question-wrap_head_questionInfo_userRoleName{
	margin-left:3px;
	white-space:nowrap;
	color:#e2b46e;
	background-color:#f8e7c4;
	border-radius:4px;
	padding:1px 5px;
	font-size: 12px;
	font-style: normal;
	font-weight: normal;
}

/* 投票 */
.voteModule{
    background: #fff;
    margin-top: 15px;
	padding: 15px 10px;
	position: relative;
    .voteTitle{
        font-size: 15px;
        line-height: 32px;
    }
    .voteOption{
        
        .voteItem{
            margin-top: 20px;
            line-height: 32px;
            font-size: 14px;
        }
        .progressItem{
            display: flex;
            justify-content:space-between;
            width: 100%; 
            align-items:center;
            .left-container{
                flex: 1; 
                .progress{
                    margin-top: 4px;
                    :deep(.el-progress-bar__outer){
                        background-color:#f2f3f5;
                    }
                    .percentage-label{
                        color: #4e5969;
                    }
                    .percentage-value{
                        color: #4e5969;
                        margin-left: 8px;
                    }
                }
                .active{
                    :deep(.el-progress-bar__outer){
                        background-color:#e3f1ff;
                        cursor:auto;
                    }


                    .percentage-label{
                        color: #337ecc;
                    }
                    .percentage-value{
                        color: #337ecc;
                    }
                }
            }
            .right-container{
                margin-left: 12px;
                line-height: 26px;
                position: relative;
                top: 2px;
            }
        }
        
    }
    .voteInfo{
        margin-top: 20px;
        color: #a9aeb8;
        display: flex;
        align-items: center;
        .status{
            margin-left: 12px;
        }
        .quantity{
            margin-left: 12px;
        }
        .record{
            flex: 1;
            text-align: right;
            line-height: 26px;
        }
    }
}


.answerModule {
	.answerList {
        width: 100%;
        background: #fff;
        margin-top: 15px;
        padding-bottom: 20px;
        .item {
            margin-left: 10px; 
            margin-right: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 2px;
            padding-top: 2px;
            .head {
                min-height: 64px;
                padding: 10px 0px 0;
                margin: 0;
                position: relative;
                .avatarBox{
                    position:absolute;display:inline-block;
                    left: 0px;top:8px;
                    
                }
                .el-badge__content.is-fixed{
                    transform: scale(0.9);right: -24px;top: -9px;
                }
                .info {
                    display: block;
                    float: left;
                    margin-left: 74px;
                    h2 {
                        color:#909399;
                        font-size:14px;
                        float: left;
                        .userName{
                            margin-right: 5px;
                            position: relative;top: 44px;
                            .nickname{
                                position: absolute;top: -25px;left: 0px;white-space: nowrap;
                            }
                        }
                    }
                    .master{
                        white-space:nowrap;
                        color:#fff;
                        background-color:#4cc8ff;
                        border-radius:4px;
                        padding:1px 5px;
                        font-size: 12px;
                        font-style: normal;
                        font-weight: normal;
                        position: relative;top: -1px;margin-right: 5px;
                    }
                    .userRoleName{
                        white-space:nowrap;
                        color:#e2b46e;
                        background-color:#f8e7c4;
                        border-radius:4px;
                        padding:1px 5px;
                        font-size: 12px;
                        font-style: normal;
                        font-weight: normal;
                        position: relative;top: -1px;margin-right: 5px;
                    }
                }
                .time {
                    color:#909399;float: left;position: relative;top: 44px;margin-left: 5px;
                }
                .floor {
                    float: right;
                    margin-right:5px;
                    color:#909399;
                    position: relative;
                    top: -1px;
                }
            }
            .adoption{
                display: none;
                position: absolute;
            }
            .main {
                padding: 20px 0px 0 74px;
                font-size: 16px;
                line-height: 26px;
                margin: 0 0 10px;
                :deep(.answerMarkdownContent) {
                    margin-bottom: 10px;
                    color:#222;font-size: 15px;word-wrap : break-word;word-break : break-all;
                    a{
                        color: #26a2ff;
                    }
                    p{
                        font-size:16px;
                        word-wrap : break-word;word-break : break-all;
                    }
                    i {
                        font-style:normal;
                    }
                    //自动换行
                    pre{
                        white-space:pre-wrap;
                    }
                    
                    ol{
                        list-style: decimal;
                    }
                    ol li{
                        list-style-type:decimal;
                        list-style-position:inside;
                    }
                    ul{
                        list-style: disc;
                    }
                    // ul li{
                        //   list-style-type:disc;
                    //  }
                    .task-list-item {
                        list-style-type:none;
                    }
                   
                    code[class*="language-"]{
                        padding: 0 0;
                    }
                    pre code{/*连续字母数字换行*/
                        word-break: break-all;
                    }
                    img{
                        max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                        cursor: -webkit-zoom-in;
                        cursor: zoom-in;
                        vertical-align: sub;
                    }
                    .el-image[style*="width: 32px; height: 32px;"]{
                        top: 3px;
                    }
                    iframe{
                        width:100%; height: 550px;padding:10px 0px; 
                    }
                    video{
                        width:100%; height: 550px;padding:10px 0px; outline:none;
                    }

                    table {
                        width: 100%;
                        th {
                            font-weight: 600
                        }
                        td,
                        th {
                            border: 1px solid #E5E6EB;
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid #E5E6EB;
                            &:nth-child(2n) {
                                background-color: #F7F8FA;
                            }
                        }
                    }
                    ol{
                        li{ 
                            list-style-type:decimal;
                            list-style-position:inside;
                        }
                    }
                    ul{
                        li{ 
                            margin-left:20px;
                            list-style-type:disc;
                        }
                    }
                }
                :deep(.answerContent) {
                    margin-bottom: 10px;
                    color:#222;font-size: 15px;word-wrap : break-word;word-break : break-all;
                    a{
                        font-size: 15px;
                        color: #26a2ff;
                    }
                    p{font-size:16px;word-wrap : break-word;word-break : break-all;}
                    pre{
                        white-space:pre-wrap;
                        code{/*连续字母数字换行*/
                            word-break: break-all;
                        }
                    }
                    img {
                        max-width:100%;height:auto;border:none;background:none;margin:0;padding:0;vertical-align: sub;
                    }
                    .el-image[style*="width: 32px; height: 32px;"]{
                        top: 3px;
                    }
                    table {
                        width: 100%;
                        th {
                            font-weight: 600
                        }
                        td,
                        th {
                            border: 1px solid #E5E6EB;
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid #E5E6EB;
                            &:nth-child(2n) {
                                background-color: #F7F8FA;
                            }
                        }
                    }
                    ol{
                        li{ 
                            list-style-type:decimal;
                            list-style-position:inside;
                        }
                    }
                    ul{
                        li{ 
                            margin-left:20px;
                            list-style-type:disc;
                        }
                    }
                }
            }
            .bottomInfo {
                height: 24px;
                overflow: hidden;
                text-align: right;
                margin-top: 25px;
                .toolbar {
                    height: 100%;
                    margin-right:4px;
                    .operat-btn{
                        color:#909399;
                        font-size: 14px;
                        margin-left: 14px;
                        cursor:pointer;
                        line-height:24px;
                        position: relative;
                        top: -1px;
                    }
                    .green-tag{
                        display: inline-block;
                        font-size: 14px;
                        line-height: 14px;
                        padding: 4px 6px 4px 6px;
                        border-radius: 3px;
                        color:#67C23A;
                        background-color:#e1f3d8;
                        margin-left: 6px;
                    }
                    .orange-tag{
                        display: inline-block;
                        font-size: 14px;
                        line-height: 14px;
                        padding: 4px 6px 4px 6px;
                        border-radius: 3px;
                        color:#E6A23C;
                        background-color:#faecd8;
                        margin-left: 6px;
                    }
                    .red-tag{
                        display: inline-block;
                        font-size: 14px;
                        line-height: 14px;
                        padding: 4px 6px 4px 6px;
                        border-radius: 3px;
                        color:#F56C6C;
                        background-color:#fde2e2;
                        margin-left: 6px;
                    }
                }
            }
        }
        .activeItem{
            position:relative;
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -10px;
                bottom:0px;
                border-left: 5px solid #fe9d2d;
            }
            .adoption{
                display: inline;
                position: absolute;
                right: 0px;
                top: 0px;
            }
        }
        //举报标记
        .reportMark{
            position:relative;
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -18px;
                bottom:0px;
                border-left: 5px solid #f89898;
            }
        }

        .replyList {
            padding: 10px 0 0px;
            margin-left: 36px;
            margin-right:10px;
            position: relative;
            font-size: 15px;
            line-height: 22px;
            margin-top: 20px;
            background: #fbfbfb;
            &:before {
                position: absolute;
                display: block;
                width: 16px;
                height: 16px;
                border-top: 1px solid #fbfbfb;
                border-left: 1px solid #fbfbfb;
                -webkit-transform: rotate(45deg);
                -moz-transform: rotate(45deg);
                -o-transform: rotate(45deg);
                transform: rotate(45deg);
                content: "";
                background-color: #fbfbfb;
                top: -4px;
                left: 60px
            }
            .link{
                height: 32px;
                text-align: right;
                position:sticky;
                bottom: 10px;
                span{
                    color: #1890ff;
                    font-size: 14px;
                    cursor: pointer;
                    background: #fbfbfb;
                    mask-image: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%),
                                linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%);//四周渐变透明
                    mask-composite: intersect;

                    padding: 10px 14px;
                    border-radius:4px;
                    &:hover {
                        color: #1890ff;
                    }
                }
            }
            .noLink{
                position:static;
            }
            .box{
                .replyItem-container{
                    position: relative;
                    left: -30px;

                    &:last-child{
                        //border-bottom: 1px solid #fff;
                        .replyItem{
                            border-bottom: 1px solid #fff;
                        }
                    }
                    &:before,
                    &:after {
                        content: "";
                        display: table;
                        font: 0/0 a
                    }
                    &:after {
                        clear: both;
                    }
                    .replyItem {
                        margin-bottom: 10px;
                        border-bottom: 1px solid #f1f1f1;
                        padding-bottom: 5px;
                        margin-left: 40px;
                        margin-right:-20px;
                        
                        //举报标记
                        .reply-reportMark{
                            position: relative;
                            &:before{
                                content: " ";
                                position: absolute;
                                top: -10px;
                                left: -18px;
                                bottom:-5px;
                                border-left: 5px solid #f89898;
                            }
                        }
                        .reply-top{
                            position:relative;
                            .avatarBox{
                                position:absolute;display:inline-block;
                                left: 0px;top:6px;
                                
                            }
                            .el-badge__content.is-fixed{
                                transform: scale(0.9);right: -24px;top: -9px;
                            }
                            .info {
                                display: block;
                                float: left;
                                margin-left: 58px;
                                .userName{
                                        margin-right: 5px;
                                        position: relative;top: 14px;font-size:14px;
                                        color: #909399;

                                        .nickname{
                                            min-height: 22px;
                                            white-space: nowrap;font-size:14px;
                                        }
                                        .account{

                                            .time {
                                                font-weight:normal;
                                                color:#909399;margin-left: 10px;font-size:14px;
                                            }
                                        }
                                    }
                                .master{
                                    white-space:nowrap;
                                    color:#fff;
                                    background-color:#4cc8ff;
                                    border-radius:4px;
                                    padding:1px 5px;
                                    font-size: 12px;
                                    font-style: normal;
                                    font-weight: normal;
                                    position: relative;top: -1px;margin-right: 5px;
                                }
                                .userRoleName{
                                    white-space:nowrap;
                                    color:#e2b46e;
                                    background-color:#f8e7c4;
                                    border-radius:4px;
                                    padding:1px 5px;
                                    font-size: 12px;
                                    font-style: normal;
                                    font-weight: normal;
                                    position: relative;top: -1px;margin-right: 5px;
                                }
                            }
                            .friendInfo {
                                display: block;
                                float: left;
                                margin-left: 70px;
                                position:relative;
                                .arrow{
                                    float: left;
                                    color: #b1b3b8;
                                    position: relative;
                                    top: 21px;
                                    left: -45px;
                                }
                                .friendAvatarBox{
                                    position:absolute;display:inline-block;
                                    left: 0px;top:6px;
                                }

                                .nameInfo {
                                    color:#909399;
                                    font-size:14px;
                                    float: left;
                                    margin-left: 42px;
                                    .userName{
                                        margin-right: 5px;
                                        position: relative;top: 36px;font-size:14px;
                                        .nickname{
                                            position: absolute;top: -22px;left: 0px;white-space: nowrap;font-size:14px;
                                        }
                                    }
                                }
                                .master{
                                    white-space:nowrap;
                                    color:#fff;
                                    background-color:#4cc8ff;
                                    border-radius:4px;
                                    padding:1px 5px;
                                    font-size: 12px;
                                    font-style: normal;
                                    font-weight: normal;
                                    position: relative;top: -1px;margin-right: 5px;
                                }
                            }
                            .operatInfo {
                                float: right;
                                .operat-btn{
                                    margin-left: 10px;
                                    line-height:24px;
                                    position: relative;
                                    top: -1px;
                                }
                                .green-tag{
                                    display: inline-block;
                                    font-size: 14px;
                                    line-height: 14px;
                                    padding: 4px 6px 4px 6px;
                                    border-radius: 3px;
                                    color:#67C23A;
                                    background-color:#e1f3d8;
                                    margin-left: 6px;
                                }
                                .orange-tag{
                                    display: inline-block;
                                    font-size: 14px;
                                    line-height: 14px;
                                    padding: 4px 6px 4px 6px;
                                    border-radius: 3px;
                                    color:#E6A23C;
                                    background-color:#faecd8;
                                    margin-left: 6px;
                                }
                                .red-tag{
                                    display: inline-block;
                                    font-size: 14px;
                                    line-height: 14px;
                                    padding: 4px 6px 4px 6px;
                                    border-radius: 3px;
                                    color:#F56C6C;
                                    background-color:#fde2e2;
                                    margin-left: 6px;
                                }
                            }
                        }
                        :deep(.replyContent){
                            line-height:26px;
                            margin-top: 40px;
                            padding-top: 8px;
                            padding-bottom: 8px;
                            color:#666;font-size: 15px;word-wrap : break-word;word-break : break-all;
                            a{
                                font-size: 15px;
                                color: #26a2ff;
                            }
                            p{font-size:16px;word-wrap : break-word;word-break : break-all;}
                           
                            .el-image[style*="width: 32px; height: 32px;"]{
                                top: 3px;
                            }
                        }
                        /* 添加回复对方  */
                        .addReplyFriend-post{
                            margin-top:50px;
                            margin-left: 15px;
                            margin-right: 15px;
                            padding-bottom: 15px;
                            /* 富文本编辑框颜色 */
                            :deep(.ke-edit) {
                                border: 1px solid transparent;
                            }
                            .el-form-item__label{
                                line-height: 20px;
                            }
                            .el-form--label-top{
                                .el-form-item__label{
                                    padding :10px 0px 0px 0px;
                                }
                            }
                            .el-form-item__content{
                                line-height: 30px;
                            }
                            .el-form-item {
                                margin-bottom: 10px;
                            }
                            .addReplyFriend-textarea{
                                width:100%;visibility:hidden;height: 200px;
                            }
                        }
                    }
                }

                /*修改回复*/
                .editReply-post{
                    margin-top:50px;
                    margin-left: 15px;
                    margin-right: 15px;
                    padding-bottom: 15px;
                    /* 富文本编辑框颜色 */
                    :deep(.ke-edit) {
                        border: 1px solid transparent;
                    }
                    .el-form-item__label{
                        line-height: 20px;
                    }
                    .el-form--label-top{
                        .el-form-item__label{
                            padding :10px 0px 0px 0px;
                        }
                    }
                    .el-form-item__content{
                        line-height: 30px;
                    }
                    .el-form-item {
                        margin-bottom: 10px;
                    }
                    .editReply-textarea{
                        width:100%;visibility:hidden;height: 200px;
                    }
                }
            }
        }
        /* 添加回复  */
        .addReply-post{
            margin-top:50px;
            margin-left: 75px;
            .addReply-wrap{
                position: relative;
                padding:20px 20px 50px 20px;
                background: #f9f9f9;
                /* 富文本编辑框颜色 */
                :deep(.ke-edit) {
                    border: 1px solid transparent;
                }
                .head-tag{
                    .icon{
                        position: absolute;font-size: 50px;top: -36px;left: -40px;color: #f9f9f9;
                    }
                }
                .addReply-textarea{
                    width:100%;visibility:hidden;height: 200px;
                }
                .promptInfo{
                    position: absolute;
                    right:15px;
                    bottom:32px;
                    h2{
                        font-size: 16px;
                        color: #ccc;
                    }
                }
                .form-action {
                    padding-left: 0px; padding-right: 0px; padding-top: 8px;margin-bottom: 12px;
                }
            }
        }
        /* 修改评论  */
        .editAnswer-formModule {
            margin-top:50px;
            margin-left: 75px;
            .editAnswer-wrap{
                position: relative;
                padding:6px 20px 50px 20px;
                background: #f9f9f9;
                :deep(.bytemd-split){
                    height: calc(100vh - 100px);
                }
                :deep(.bytemd-split .CodeMirror-scroll){//让外层滚动条不滚动
                    overscroll-behavior:  contain;
                }
                :deep(.bytemd-split .bytemd-preview){//让外层滚动条不滚动
                    overscroll-behavior:  contain;
                }
                :deep(.bytemd-editor){
                    min-height: 250px; 
                }
                :deep(.CodeMirror-sizer){
                    min-height: 245px !important; 
                }
                :deep(.bytemd-preview){
                    min-height: 250px; 
                }
                //编辑器边框
                :deep(.bytemd-editor){
                    border-top: 1px solid #e5e6eb;
                    border-left: 1px solid transparent;
                    border-right: 1px solid transparent;
                    
                    border-radius:0px;
                }
                :deep(.bytemd-status){
                    border: 1px solid transparent;
                    border-top: 1px solid #e5e6eb;
                    border-radius:0px;
                }
                :deep(.bytemd-preview){
                    border-top: 1px solid #e5e6eb;
                    border-left: 1px solid transparent;
                    border-right: 1px solid transparent;
                    border-radius:0px;
                }
                :deep(.bytemd-split .bytemd-editor){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-sidebar){
                    border-top-left-radius:0px;
                    border-left: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(~ .bytemd-sidebar)){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(+ .bytemd-preview:not([style*='display:none']))){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-editor:has(~ .bytemd-hidden)){
                    border-right: 1px solid transparent;
                }
                :deep(.bytemd-preview:has(+ .bytemd-sidebar)){
                    border-right: 1px solid #e5e6eb;
                }
                :deep(.bytemd-preview:has(~ .bytemd-hidden)){
                    border-right: 1px solid transparent;
                }

                /* 富文本编辑框颜色 */
                :deep(.ke-edit) {
                    border: 1px solid transparent;
                }
                .head-tag{
                    .icon{
                        position: absolute;font-size: 50px;top: -38px;left: -42px;color: #f9f9f9;
                    }
                }
                .el-form-item__label{
                    line-height: 20px;
                }
                .el-form--label-top{
                    .el-form-item__label{
                        padding :10px 0px 0px 0px;
                    }
                }
                .el-form-item__content{
                    line-height: 30px;
                }
                .el-form-item {
                    margin-bottom: 10px;
                }
                .editAnswer-textarea{
                    width:100%;visibility:hidden;height: 200px;
                }
                .promptInfo{
                    position: absolute;
                    right:15px;
                    bottom:32px;
                    h2{
                        font-size: 16px;
                        color: #ccc;
                    }
                }
                .form-action {
                    padding-left: 0px; padding-right: 0px; padding-top: 8px;margin-bottom: 12px;
                }
                .editAnswerSubmit {
                    height: 38px;
                    float: left;
                    margin-right: 10px;
                    position: relative;
                    z-index: 2
                }
            }
        }
        .pagination-wrapper{//分页
            margin-top: 25px;
            margin-bottom: 15px;
            margin-right: 15px;
            display: flex;
            justify-content: flex-end;
        }
    }

    .ribbon-wrapper {
        width: 106px;
        height: 108px;
        overflow: hidden;
        position: absolute;
        top: -6px;
        right: -16px; 
        .ribbon {
            font-size: 18px;
            font-weight: 600;
            line-height: 18px;
            text-align: center;
            text-transform: uppercase;
            transform: rotate(45deg);
            position: relative;
            padding: 7px 0;
            left: -11px;
            top: 26px;
            width: 150px;
            background-color: #fe9d2d;
            color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            letter-spacing: 0.5px; 
            &:before, &:after {
                content: "";
                border-top: 4px solid #ce8025;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                position: absolute;
                bottom: -4px; 
            }
            &:before {
                left: 0; 
            }
            &:after {
                right: 0; 
            }
        }
    }
    .el-link--default{
        color: #909399 !important;
    }
    .el-link--default:hover {
        color: #409EFF !important;
    }
    .el-link--default.is-disabled{
        color: #dedfe0 !important;
        cursor: not-allowed !important;
    }

    .addAnswer{
        margin-left: 10px;margin-right: 10px; margin-top: 10px; margin-bottom: 10px;padding-top: 10px;
        :deep(.bytemd-split){
            height: calc(100vh - 100px);
        }
        :deep(.bytemd-split .CodeMirror-scroll){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
        :deep(.bytemd-split .bytemd-preview){//让外层滚动条不滚动
            overscroll-behavior:  contain;
        }
        :deep(.bytemd-editor){
            min-height: 250px; 
        }
        :deep(.CodeMirror-sizer){
            min-height: 245px !important; 
        }
        :deep(.bytemd-preview){
            min-height: 250px; 
        }
    }
}
</style>