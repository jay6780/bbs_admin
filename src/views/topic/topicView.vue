<!-- 话题查看 -->
<template>
    <div class="main blankBackground" >
        <div class="navbar">
            
            <el-button type="primary" plain @click="router.push({path: state.sourceUrlObject.path, query:state.sourceUrlObject.query})">返回</el-button>
        
        </div>
        <div class="topicViewModule" v-if="state.topic != undefined && state.topic != null && Object.keys(state.topic).length>0">
            <div class="topic-wrap">
                <div class="topicTag">
                    <span class="tag">{{state.topic.tagName}}</span>
                </div>

                
                <div class="operat">
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topic/manage?method=auditTopic*','post')" v-if="state.topic.status == 10" @click="auditTopic(state.topic.id);">审核</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/mediaProcessQueue/manage?method=addMediaProcessQueue*','post')" @click="addMediaProcessQueue(state.topic.id)">添加媒体处理任务</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topicLike/list*','get')" @click="router.push({path: '/admin/control/topicLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),itemId:state.topic.id,likeModule:10,topicPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/redEnvelope/redEnvelopeAmountDistribution/list*','get')" v-if="state.topic.giveRedEnvelopeId != null && state.topic.giveRedEnvelopeId != ''" @click="router.push({path: '/admin/control/redEnvelope/redEnvelopeAmountDistribution/list', query:{giveRedEnvelopeId:state.topic.giveRedEnvelopeId, visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:'')}})">红包</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topicFavorite/list*','get')" @click="router.push({path: '/admin/control/topicFavorite/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:'')}})">收藏用户</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topicReport/list*','get')" @click="router.push({path: '/admin/control/topicReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:''), parameterId:state.topic.id,module:10}})">举报</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topic/topicUnhideList*','get')" @click="store.setCacheNumber(); router.push({path: '/admin/control/topic/topicUnhideList', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:'')}})">解锁隐藏内容用户</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" v-if="state.topic.isStaff == false" @click="onRiskControlPenalty(10,state.topic.id)">风控处罚</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topic/manage?method=edit*','get')" @click="editTopicUI();">修改</el-link>
                    <el-link class="item" href="javascript:void(0);" :disabled="!verifyPermissionMenu('/control/topic/manage?method=delete*','post')" @click="deleteTopic(state.topic.id)">删除</el-link>
                    
                </div>
                
                <div class="editTopic-post" v-show="state.editTopicFormView">
                    <div class="editTopic data-form">
                        <el-form label-width="120" @submit.native.prevent>
                            <el-form-item label="标题" :required="true" :error="error.title">
                                <el-input v-model.trim="state.title" maxlength="150" :clearable="true" show-word-limit></el-input>
                            </el-form-item>
                            <el-form-item label="标签" :required="true" :error="error.tagId">
                                <el-select v-model="state.tagIdGroup" size="large" class="custom-select-width"  @click="queryTagList" @change="selectedTag" no-match-text="还没有标签" placeholder="选择标签">
                                    
                                    <template v-for="tag in state.options">
                                        <el-option-group :key="'group-'+tag.id" :label="tag.name" v-if="tag.childNodeNumber >0">
                                            <el-option v-for="childTag in tag.childTag" :key="'childTag-'+tag.id" :label="childTag.name" :value="childTag.id"><div class="option-group">{{ childTag.name }}</div></el-option>
                                        </el-option-group>
                                        <el-option v-else :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
                            
                                    </template>
                                </el-select>
                                
                            </el-form-item>
                            <el-form-item label="排序" :required="true" :error="error.sort">
                                <el-input-number ref="sort_ref" v-model="state.sort" controls-position="right" :min="0" :max="99999999"></el-input-number>
                                <div class="form-help" >数字越大越在前</div>
                            </el-form-item>
                            <el-form-item label="允许评论" :required="true">
                                <el-switch v-model="state.allow" ></el-switch>
                            </el-form-item>
                            <el-form-item label="精华" :error="error.essence">
                                <el-switch v-model="state.essence" ></el-switch>
                            </el-form-item>
                            <el-form-item label="状态" :required="true">
                                <el-radio-group v-model="state.status">
                                    <el-radio :label="10">待审核</el-radio>
                                    <el-radio :label="20">已发布</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            
                            <el-form-item label="内容" :required="true">
                                <div v-show="!state.isEditTopicMarkdown" style="width: 100%;">
                                    <textarea ref="topicContentRef" :editorId="'editTopic'" style="width:100%;height:300px;visibility:hidden;"></textarea>
                                </div>
                                <div v-if="state.isEditTopicMarkdown" style="width: 100%;">
                                    <Editor  :editorId="'editTopic'" :value="state.editTopicMarkdownContent" :plugins="state.editTopicEditorPlugin" :locale="zhHans" :sanitize="editTopicSanitize" placeholder="请输入内容..." @change="handleEditTopicMarkdownChange"/>
                                </div>
                                
                            </el-form-item>
                            <el-form-item>
                                <el-button class="submitButton" type="primary" size="large" @mousedown.native="editTopic" :disabled="state.editTopic_disabled">提交</el-button>
                                <el-button class="submitButton" type="primary" size="large" plain @mousedown.native="cancelEditTopic();">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
               
                <div class="head">
                    <div class="title">
                        {{state.topic.title}}
                        <span class="essence" v-if="state.topic.essence == true">精华</span>
                        <span class="top" v-if="state.topic.sort >0">置顶</span>
                    </div>
                    <div class="topicInfo clearfix" >
                        <div class="avatar">
                            <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                <template #default>
                                    <p v-if="state.topic.nickname != null && state.topic.nickname != ''">呢称: {{state.topic.nickname}}</p>
                                    <p>账号: {{state.topic.account}}</p>
                                    <p v-if="state.topic.userRoleNameList != null && state.topic.userRoleNameList.length >0" >角色: 
                                        <span class="topicViewModule_topic-wrap_head_topicInfo_userRoleName" v-for="roleName in state.topic.userRoleNameList" >{{roleName}}</span>
                                    </p> 
                                    
                                    
                                </template>
                                <template #reference v-if="state.topic.isStaff == false">
                                    <div class="avatar-wrapper" >
                                        <div class="avatar-badge" v-if="state.topic.avatarName == null || state.topic.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </div>
                                        <div class="avatar-badge" v-if="state.topic.avatarName != null && state.topic.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="state.topic.avatarPath+'100x100/'+state.topic.avatarName"></el-avatar>
                                        </div>
                                    </div>
                                </template>
                                
                                <template #reference v-if="state.topic.isStaff == true">
                                    <div class="avatar-wrapper">
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="state.topic.avatarName == null || state.topic.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </el-badge>
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="state.topic.avatarName != null && state.topic.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="state.topic.avatarPath+'100x100/'+state.topic.avatarName"></el-avatar>
                                        </el-badge>
                                    </div>
                                </template>
                            </el-popover>
                        </div>
                        <div class="userName" title="账号">
                            {{state.topic.account}}
                            <div class="nickname" title="呢称">
                                {{state.topic.nickname}}
                                <span class="topicViewModule_topic-wrap_head_topicInfo_userRoleName" v-if="state.topic.userRoleNameList != null && state.topic.userRoleNameList.length >0" v-for="roleName in state.topic.userRoleNameList" title="角色">{{roleName}}</span> 
                            </div>
                        </div>
                        <div class="postTime" title="发表时间">{{state.topic.postTime}}</div>
                        <div class="viewTotal-icon" title="查看总数"><el-icon><View /></el-icon></div>
                        <div class="viewTotal" title="查看总数">{{state.topic.viewTotal}}次阅读</div>
                        <div class="comment-icon" title="评论总数"><el-icon><ChatDotRound /></el-icon></div>
                        <div class="comment" title="评论总数">{{state.topic.commentTotal}}个评论</div>
                        
                        <div class="ipAddress" title="IP地址">
                            {{state.topic.ip}}&nbsp;{{state.topic.ipAddress}}
                            
                            <div class="statusTagInfo">
                                <span class="orange-tag" v-if="state.topic.status ==10" title="话题状态">待审核</span>
                                <span class="green-tag" v-if="state.topic.status ==20" title="话题状态">已发布</span>
                                <span class="red-tag" v-if="state.topic.status ==110" title="话题状态">待审核(员工\系统)删除</span>
                                <span class="red-tag" v-if="state.topic.status ==120" title="话题状态">已发布(员工\系统)删除</span>	
                                <span v-if="state.topic.giveRedEnvelopeId != null && state.topic.giveRedEnvelopeId != ''" class="redEnvelope" title="发红包">红包 {{state.giveRedEnvelope.totalAmount}} 元</span>
                        
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="[state.topic.isMarkdown != null && state.topic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent' : 'main', router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 10 ? 'reportMark' : '']">
                    <div v-if="state.topic.lastUpdateTime != null" class="lastUpdateTime" >最后修改时间：{{state.topic.lastUpdateTime}}</div>
                    <div :ref="'topic_'+state.topic.id">
                        <RenderTemplate :html="state.topic.content"></RenderTemplate>
                    </div>
                </div>
                
            </div>
        </div>

        
        <div class="commentModule">
            <div class="commentList">
                <div class="item" :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 20 && comment.id == router.currentRoute.value.query.commentId ? 'reportMark' : ''" v-for="(comment,index) in state.commentList" :key="'comment_'+comment.id" :commentId="comment.id"  :ref="'comment_'+comment.id">
                    <div class="head">
                        <div class="avatarBox">
                            <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                <template #default>
                                    <p v-if="comment.nickname != null && comment.nickname != ''">呢称: {{comment.nickname}}</p>
                                    <p>账号: {{comment.account}}</p>
                                    <p v-if="comment.userRoleNameList != null && comment.userRoleNameList.length >0" >角色: 
                                        <span class="topicViewModule_topic-wrap_head_topicInfo_userRoleName" v-for="roleName in comment.userRoleNameList" >{{roleName}}</span>
                                    </p> 
                                    
                                    
                                </template>
                                <template #reference v-if="comment.isStaff == false">
                                    <div class="avatar-wrapper" >
                                        <div class="avatar-badge" v-if="comment.avatarName == null || comment.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </div>
                                        <div class="avatar-badge" v-if="comment.avatarName != null && comment.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="comment.avatarPath+'100x100/'+comment.avatarName"></el-avatar>
                                        </div>
                                    </div>
                                </template>
                                
                                <template #reference v-if="comment.isStaff == true">
                                    <div class="avatar-wrapper">
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="comment.avatarName == null || comment.avatarName == ''">
                                            <el-avatar shape="square" :size="64" :icon="UserFilled"></el-avatar>
                                        </el-badge>
                                        <el-badge value="员工" type="warning" class="avatar-badge" v-if="comment.avatarName != null && comment.avatarName != ''">
                                            <el-avatar shape="square" :size="64" :src="comment.avatarPath+'100x100/'+comment.avatarName"></el-avatar>
                                        </el-badge>
                                    </div>
                                </template>
                            </el-popover>
                        </div>
                    
                    
                        <span class="info" >
                            <h2 class="clearfix" >
                                
                                <div class="userName">
                                    {{comment.account}}
                                    <div class="nickname" >
                                        {{comment.nickname}}
                                        <i class="userRoleName" v-for="roleName in comment.userRoleNameList" >{{roleName}}</i>
                                        <i class="master" v-if="comment.userName == state.topic.userName && comment.isStaff == state.topic.isStaff">作者</i>
                                    </div>
                                </div>
                                
                            </h2>
                            
                            <div class="time clearfix">{{comment.postTime}}</div>
                        </span>
                        <span class="floor">{{index+1}}楼</span>                     
                    </div>
                   
                    <div class="main">
                        <div class="quote"  v-if="comment.quoteList != null && comment.quoteList.length >0" >
                            <RenderTemplate :html="state.quoteData.get(comment.id)"></RenderTemplate>
                        </div>
                        

                        <div :class="[comment.isMarkdown != null && comment.isMarkdown == true ? 'markdown-body-custom commentMarkdownContent' : 'commentContent']" :ref="'commentContent_'+comment.id">
                            <RenderTemplate :html="comment.content"></RenderTemplate>
                        </div>
                        
                        <div class="clearfix"></div>
                        
                        <div class="replyList" v-if="comment.replyList.length >0">
                            
                            <ul class="timeline box">
                                
                                <li class="timeline-item replyItem-container" v-for="(reply,index2) in comment.replyList" :key="reply.id"  :replyId="reply.id" >
                                    <div :ref="el => handleReplyNode(el, reply.id)" v-if="state.replyExpandOrShrink.get(comment.id) || (state.replyExpandOrShrink.get(comment.id) == false && index2 <state.viewNumber)">
                                    <div class="tail" v-if="state.line.get(reply.id)"></div>
                                    <div class="node node--normal" v-if="state.dot.get(reply.id)"></div>
                                    <div class="replyItem">
                                        <div :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 30 && reply.id == router.currentRoute.value.query.replyId ? 'reply-reportMark' : ''">
                                            <div class="reply-top" >
                                                <div class="avatarBox">
                                                    <el-popover effect="light" trigger="hover" placement="top" :persistent="false">
                                                        <template #default>
                                                            <p v-if="reply.nickname != null && reply.nickname != ''">呢称: {{reply.nickname}}</p>
                                                            <p>账号: {{reply.account}}</p>
                                                            <p v-if="reply.userRoleNameList != null && reply.userRoleNameList.length >0" >角色: 
                                                                <span class="topicViewModule_topic-wrap_head_topicInfo_userRoleName" v-for="roleName in reply.userRoleNameList" >{{roleName}}</span>
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
                                                                <i class="master" v-if="reply.userName == state.topic.userName && reply.isStaff == state.topic.isStaff">作者</i>
                                                            </div>
                                                            <div class="account" >{{reply.account}}<span class="time">{{reply.postTime}}</span></div>
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
                                                                <i class="master" v-if="reply.friendUserName == state.topic.userName && reply.isFriendStaff == state.topic.isStaff">作者</i>
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
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/topicLike/list*','get')" @click="router.push({path: '/admin/control/topicLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),itemId:reply.id,likeModule:30,topicPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=auditReply*','post')" href="javascript:void(0);" v-if="reply.status ==10"  @click="auditReply(reply.id)">审核</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=addReply*','get')" href="javascript:void(0);" @click="addReplyFriendUI(reply.id)">回复</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=editReply*','get')" href="javascript:void(0);" @click="editReplyUI(reply)">修改</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=recoveryReply*','post')" href="javascript:void(0);" v-if="reply.status >100"  @click="recoveryReply(reply.id)">恢复</el-link>
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/topicReport/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/topicReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:''), parameterId:reply.id,module:30}})">举报</el-link>
                    
                                                    <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" v-if="reply.isStaff == false" @click="onRiskControlPenalty(50,reply.id)">风控处罚</el-link>
                   
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
                                            
                                            <div class="replyContent" @click="clickReplyLevel(comment.id,reply.id)">
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
                                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="addReplyFriend(comment.id,reply.id)" :disabled="state.addReplyFriend_disabled.get(reply.id)">提交</el-button>
                                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelAddReplyFriend(reply.id);">取消</el-button>
                                                    </el-form-item>
                                                </el-form>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </li>
                            </ul>
                            <div class="link" :class="!state.replyExpandOrShrink.get(comment.id) ? 'noLink':''" v-if="comment.replyList.length >state.viewNumber">
                                <span @click="telescopicReply(comment.id);" v-if="state.replyExpandOrShrink.get(comment.id)">点击收缩</span>
                                <span @click="telescopicReply(comment.id);" v-else>剩余{{comment.replyList.length-state.viewNumber}}条</span>
                               
                            </div>  
                        </div>           
                    </div>
                    <!-- 回复评论 -->
                    <div class="addReply-post" v-if="state.addReplyFormView.get(comment.id)">
                        <div class="addReply-wrap">
                            <el-form @submit.native.prevent>
                                <el-form-item >
                                    <div style="width: 100%;">
                                        <textarea :ref="el => handleAddReplyNode(el, comment.id)" :editorId="'addReply_'+comment.id" :commentId="comment.id" class="addReply-textarea" ></textarea>
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-button class="submitButton" size="large" type="primary" @mousedown.native="addReply(comment.id)" :disabled="state.addReply_disabled.get(comment.id)">提交</el-button>
                                    <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelAddReply(comment.id);">取消</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="quote-post" v-if="state.quoteFormView.get(comment.id)">
                        <div class="quote-formModule">
                            <div class="addQuote-wrap">
                                <div class="head-tag"><Icon name="quote-left-solid" size="50px" class="icon"/></div>
                                <div v-if="!state.isQuoteCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                    <textarea :ref="el => handleQuoteNode(el, comment.id)" :editorId="'quoteComment_'+comment.id" :commentId="comment.id" class="quote-textarea"  ></textarea>
                                </div>
                                <div v-if="state.isQuoteCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                    <Editor mode="split" :editorId="'quoteComment_'+comment.id" :value="(state.quoteCommentMarkdownContent[comment.id] as string)" :plugins="state.quoteCommentEditorPlugin" :locale="zhHans" :sanitize="commentSanitize" placeholder="请输入内容..." @change="handleQuoteCommentMarkdownChange($event,comment.id)"/>
                                </div>
                                <div class="form-action">
                                    <div class="quoteSubmit">
                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="addQuote(comment.id);" :disabled="state.addQuote_disabled.get(comment.id)">提交</el-button>
                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelQuote(comment.id);">取消</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="editComment-post" v-if="state.editCommentFormView.get(comment.id)">
                        <div class="editComment-formModule">
                            <div class="editComment-wrap">
                                <div class="head-tag"><Icon name="pencil-alt" size="50px" class="icon"/></div>
                                
                                <el-form label-position="top" label-width="auto" @submit.native.prevent>
                                    <el-form-item label="状态" >
                                        <el-radio-group :modelValue="useCommentStatusModel(comment.id).value" @update:modelValue="useCommentStatusModel(comment.id).value = $event">
                                            <el-radio :label="10">待审核</el-radio>
                                            <el-radio :label="20">已发布</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-form>
                                
                                <div v-if="!state.isEditCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                    <textarea :ref="el => handleEditCommentNode(el, comment.id)" :editorId="'editComment_'+comment.id" :commentId="comment.id" class="editComment-textarea" ></textarea>
                                </div>
                                <div v-if="state.isEditCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                    <Editor mode="split" :editorId="'editComment_'+comment.id" :value="(state.editCommentMarkdownContent[comment.id] as string)" :plugins="state.editCommentEditorPlugin" :locale="zhHans" :sanitize="commentSanitize" placeholder="请输入内容..." @change="handleEditCommentMarkdownChange($event,comment.id)"/>
                                </div>
                                   
                                <div class="form-action">
                                    <div class="editCommentSubmit">
                                        <el-button class="submitButton" size="large" type="primary" @mousedown.native="editComment(comment.id);" :disabled="state.editComment_disabled.get(comment.id)">提交</el-button>
                                        <el-button class="submitButton" size="large" type="primary" plain @mousedown.native="cancelEditComment(comment.id);">取消</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bottomInfo">
                        <div class="toolbar">
                        
                            <span class="orange-tag" v-if="comment.status ==10" title="评论状态">待审核</span>
                            <span class="green-tag" v-if="comment.status ==20" title="评论状态">已发布</span>
                            <span class="red-tag" v-if="comment.status ==110" title="评论状态">待审核用户删除</span>
                            <span class="red-tag" v-if="comment.status ==120" title="评论状态">已发布用户删除</span>
                            <span class="red-tag" v-if="comment.status ==100010" title="评论状态">待审核(员工\系统)删除</span>
                            <span class="red-tag" v-if="comment.status ==100020" title="评论状态">已发布(员工\系统)删除</span>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/topicLike/list*','get')" @click="router.push({path: '/admin/control/topicLike/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),itemId:comment.id,likeModule:20,topicPage:(route.query.page != undefined ? route.query.page:'')}})">点赞用户</el-link>
                    
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=auditComment*','post')" href="javascript:void(0);" v-if="comment.status ==10" @click="auditComment(comment.id)">审核</el-link>
                           
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=addReply*','get')" href="javascript:void(0);" @click="addReplyUI(comment.id)">回复</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=addQuote*','get')" href="javascript:void(0);" @click="addQuoteUI(comment.id)">引用</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=editComment*','get')" href="javascript:void(0);" @click="editCommentUI(comment)">修改</el-link>
                            
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=recoveryComment*','post')" href="javascript:void(0);" v-if="comment.status >100" @click="recoveryComment(comment.id)">恢复</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/topicReport/list*','get')" href="javascript:void(0);" @click="router.push({path: '/admin/control/topicReport/list', query:{ visible:(route.query.visible != undefined ? route.query.visible:''),topicView_beforeUrl:(route.query.topicView_beforeUrl != undefined ? route.query.topicView_beforeUrl:''),topicId :state.topic.id, commentId:(route.query.commentId != undefined ? route.query.commentId:''),topicPage:(route.query.page != undefined ? route.query.page:''), parameterId:comment.id,module:20}})">举报</el-link>
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/penaltyPostInfo/riskControlPenaltyList*','get')" v-if="comment.isStaff == false" @click="onRiskControlPenalty(30,comment.id)">风控处罚</el-link>
                   
                            <el-link class="operat-btn" :disabled="!verifyPermissionMenu('/control/comment/manage?method=deleteComment*','post')" href="javascript:void(0);" @click="deleteComment(comment.id)">删除</el-link>
                            
                            
                        
                        
                        
                        </div>
                    </div>
                </div>
                
                
                <div class="pagination-wrapper" v-if="state.isShowPage">
                    <el-pagination background  @current-change="page" :current-page="state.currentpage"  :page-size="state.maxresult" layout="total, prev, pager, next,jumper" :total="state.totalrecord"></el-pagination>
                </div>
                
                <div class="addComment" >
                    <el-form @submit.native.prevent>
                        <el-form-item :error="error.content">
                            <div v-show="!state.isAddCommentMarkdown" style="width: 100%;">
                                <textarea :editorId="'addComment'" ref="commentContentRef" style="width:100%;height:300px;visibility:hidden;"></textarea>
                            </div>
                            <div v-if="state.isAddCommentMarkdown" style="width: 100%;">
                                <Editor mode="split" :editorId="'addComment'" :value="state.addCommentMarkdownContent" :plugins="state.addCommentEditorPlugin" :locale="zhHans" :sanitize="commentSanitize" placeholder="请输入内容..." @change="handleAddCommentMarkdownChange"/>
                            </div>
                        </el-form-item>
                        <el-form-item>
                            <el-button class="submitButton" size="large" type="primary" @mousedown.native="addCommentForm" :disabled="state.addCommentForm_disabled || !verifyPermissionMenu('/control/comment/manage?method=addComment*','post')">提交</el-button>
                            
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
    name: 'topicView',
    beforeRouteEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        //上级路由编码
        if(to.query.topicView_beforeUrl == undefined || to.query.topicView_beforeUrl==''){//前一个URL
            let parameterObj:any = new Object();
            parameterObj.path = from.path;
            let query = from.query;
            for(let q in query){
                query[q] = encodeURIComponent(query[q] as string);
            
            }
            
            parameterObj.query = query;
            //将请求参数转为base62
            let wordArray = enc.Utf8.parse(JSON.stringify(parameterObj));
            let encrypt = enc.Base64url.stringify(wordArray);


            
            let newFullPath = updateURLParameter(to.fullPath,'topicView_beforeUrl',encrypt);
            
            to.fullPath = newFullPath;
            
            let paramGroup = to.query;
            paramGroup.topicView_beforeUrl = encrypt;
            to.query = paramGroup;
        }
        next()
    }
}
</script>



<script lang="ts" setup>
    import { type ComponentInternalInstance,  getCurrentInstance, nextTick, onActivated, onDeactivated, onMounted, reactive, ref } from 'vue';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import type { AxiosResponse } from 'axios';
    import { type NavigationGuardNext, type RouteLocationNormalized, useRoute, useRouter } from 'vue-router';
    import { dayjs, ElMessage, ElMessageBox } from 'element-plus';
    import { processErrorInfo,getLanguageClassName, updateURLParameter, getElementTop,verifyPermissionMenu, useDynamicMapVModel, resolvePath } from '@/utils/tool';
    import { createEditor } from '@/utils/editor';
    import type { GiveRedEnvelope, SourceUrl, Topic,Comment, Reply, User, Tag, VoteTheme } from '@/types';
    import { enc} from 'crypto-js';
    import { UserFilled } from '@element-plus/icons-vue'
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';
    import { escapeHtml, escapeVueHtml, unescapeHtml } from '@/utils/escape';
    import Prism from "prismjs";
    import { nativeQueryVideoRedirect } from '@/utils/http';
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'   
    import zhHans from 'bytemd/locales/zh_Hans.json'
    import { markdownPlugins,sanitize } from '@/utils/markdownEditor';
    import Long from "long";
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { Editor } from '@bytemd/vue-next'
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import config from '@/utils/markdownPlugin/plugin-config';
    import { hideContent } from '@/utils/markdownPlugin/plugin-hide-content';
    import { videoUpload } from '@/utils/markdownPlugin/plugin-video-upload';
    import { fileUpload } from '@/utils/markdownPlugin/plugin-file-upload';
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

    const topicContentRef = ref()
    const commentContentRef = ref()
    
    const emit = defineEmits([ "onJumpPage" ]);


    
    interface VoteOptionItem {
        id: string;
        text: string;
    }

    const state = reactive({
        topicId :'',//话题Id
        commentId :'',//评论Id
        visible :'true',//是否显示 true:未删除话题 false:已删除话题
        topic :{} as Topic,//话题
        giveRedEnvelope :{} as GiveRedEnvelope,//红包
        availableTag:'',//评论富文本编辑器允许使用的标签
        userName:'',//用户名称
        commentList:[] as Array<Comment>,
        totalrecord : 0, //总记录数
        currentpage : 1, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数
        isShowPage:false,//是否显示分页 maxresult没返回结果前就显示会导致分页栏显示页码错误

        viewNumber:10,//回复(展开/收缩) 展示数量
        replyExpandOrShrink :new Map(), //回复展开/收缩 map格式 key:评论Id value:是否展开

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
        
        editTopicAvailableTag:[] as Array<string>,//修改话题富文本编辑器允许使用的标签

        editTopicMarkdownContent:'',//markdown修改问题内容
        isEditTopicMarkdown:false,//是否使用markdown问题编辑器


        supportEditor:10,//支持编辑器
        addCommentMarkdownContent:'',//markdown评论内容
        isAddCommentMarkdown:false,//是否使用markdown评论编辑器

        addCommentEditor :{} as any,//添加评论编辑器
        addCommentEditorCreateParameObject :{} as any,//添加评论编辑器的创建参数
        
        
        quoteFormView : new Map(),//评论引用表单  key:评论Id value:是否显示
        quoteEditorMap:new Map(),//引用评论富文本编辑器集合 key:评论Id value:富文本编辑器
        quoteEditorCreateParameMap:new Map(),//引用评论编辑器的创建参数 key:评论Id value:编辑器参数对象
        quoteData : new Map(),//引用数据 map格式 key:评论Id value:引用html数据

        isQuoteCommentMarkdownMap: new Map(),//引用评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        quoteCommentMarkdownContent : {} as any,//引用评论markdown编辑内容 key:评论Id value:评论内容
        
        
        editCommentFormView : new Map(),//修改评论表单  key:评论Id value:是否显示
        editCommentEditorMap:new Map(),//修改评论富文本编辑器集合 key:评论Id value:富文本编辑器
        editCommentEditorCreateParameMap:new Map(),//修改评论编辑器的创建参数 key:评论Id value:编辑器参数对象

        isEditCommentMarkdownMap: new Map(),//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        editCommentMarkdownContent : {} as any,//修改评论markdown编辑内容 key:评论Id value:评论内容
        
        editCommentData : new Map(),//修改评论数据 map格式 key:评论Id value:修改html数据
        commentStatusField :new Map<string, number>(), //评论状态项绑定  key:评论Id value:状态

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
        tagId :'',//标签Id
        sort : 0,
        allow : true,
        status :0,
        essence:false,
        isAllowLoadTagGroup:true,//是否允许加载标签组
        tagIdGroup : [], //标签Id组
        loading :false,//是否正在从远程获取数据
        options: [] as Array<Tag>,//Select 选择器标签数据
        editTopicFormView:false,//修改话题表单是否显示
        editTopicEditor :{} as any,//修改话题编辑器
        editTopicEditorCreateParameObject :{} as any,//修改话题编辑器的创建参数
        
        playerIdList: [] as Array<string>,//视频播放Id列表
		playerObjectList: [] as Array<any>,//视频播放对象集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
		playerNodeList: [] as Array<any>,//视频节点对象集合

        quoteElementNodes:new Map<string,HTMLTextAreaElement | null>(),//引用评论项Element节点集合  key:commentId value:el
		editCommentElementNodes:new Map<string,HTMLTextAreaElement | null>(),//修改评论项Element节点集合 key:commentId value:el
		replyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//回复列表项Element节点集合  key:replyId value:el
        addReplyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//添加回复Element节点集合  key:commentId value:el
        addReplyFriendElementNodes:new Map<string,HTMLTextAreaElement | null>(),//添加回复对方Element节点集合  key:replyId value:el
        editReplyElementNodes:new Map<string,HTMLTextAreaElement | null>(),//修改回复Element节点集合  key:replyId value:el
        
        addCommentForm_disabled:false,//提交评论按钮是否禁用
        addQuote_disabled : new Map(),//提交引用按钮是否禁用 map格式 key:评论Id value:是否禁用
        editComment_disabled : new Map(),//提交修改评论按钮是否禁用 map格式 key:评论Id value:是否禁用
        editTopic_disabled:false,//提交修改话题按钮是否禁用
        addReplyFriend_disabled: new Map(),//提交添加回复对方按钮是否禁用 map格式 key:一语论Id value:是否禁用
        addReply_disabled: new Map(),//提交添加回复对方按钮是否禁用 map格式 key:一语论Id value:是否禁用
        editReply_disabled: new Map(),//提交修改回复按钮是否禁用 map格式 key:回复Id value:是否禁用
        


        line : new Map(),//楼中楼的线  key:回复Id value:是否显示
        dot : new Map(),//楼中楼的点  key:回复Id value:是否显示

        editTopicEditorPlugin:[] as BytemdPlugin[],//修改话题Markdown编辑器插件
        addCommentEditorPlugin:[] as BytemdPlugin[],//添加评论Markdown编辑器插件
        quoteCommentEditorPlugin:[] as BytemdPlugin[],//引用评论Markdown编辑器插件
        editCommentEditorPlugin:[] as BytemdPlugin[],//修改评论Markdown编辑器插件

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
        essence :'',

        keyword :'',

        voteOption :'',
        voteTitle :'',
        voteMaxChoice :'',
        voteEndDate :'',
    });


    /**
     * 绑定评论状态 
     * @param commentId 评论Id
     */
    function useCommentStatusModel(commentId: string) {
        return useDynamicMapVModel<number>(state.commentStatusField, commentId);
    }
    /**
     * 绑定回复状态 
     * @param replyId 回复Id
     */
    function useReplyStatusModel(replyId: string) {
        return useDynamicMapVModel<number>(state.replyStatusField, replyId);
    }


    //引用评论ref节点处理
    const handleQuoteNode =(el: any,commentId:string) => {
        if(el != null){
            state.quoteElementNodes.set(commentId, el);
        }
    }
    //修改评论ref节点处理
    const handleEditCommentNode = (el: any,commentId:string) => {
        if(el != null){
            state.editCommentElementNodes.set(commentId, el);
        }
    }
    //回复ref节点处理
	const handleReplyNode = (el: any,replyId:string) => {
        if(el != null){
            state.replyElementNodes.set(replyId, el);
        }
	}

    //添加回复ref节点处理
    const handleAddReplyNode = (el: any,commentId:string) => {
        if(el != null){
            state.addReplyElementNodes.set(commentId, el);
        }
    }
    //添加回复对方ref节点处理
    const handleAddReplyFriendNode = (el: any,replyId:string) => {
        if(el != null){
            state.addReplyFriendElementNodes.set(replyId, el);
        }
    }
    //修改回复ref节点处理
    const handleEditReplyNode = (el: any,replyId:string) => {
        if(el != null){
            state.editReplyElementNodes.set(replyId, el);
        }
    }
    
                       
    //处理Markdown
    const handleEditTopicMarkdownChange = (value: string) => {
        state.editTopicMarkdownContent = value;
    }

    //白名单
    const editTopicSanitize = (schema: any) => {
        schema = sanitize(schema);
        
        if(state.editTopicAvailableTag?.indexOf('embedVideo') != -1){//嵌入视频
            schema.tagNames.push('iframe');
        }

        return schema;
    }

    //处理切换到富文本编辑器
    const handleEditTopicToggleRichtextEditor = (editorId: string) => {
        state.isEditTopicMarkdown= false;
        nextTick(()=>{
            if (Object.keys(state.editTopicEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.editTopicEditor = createEditor(
                    state.editTopicEditorCreateParameObject.ref, 
                    state.editTopicEditorCreateParameObject.availableTag, 
                    state.editTopicEditorCreateParameObject.uploadPath, 
                    state.editTopicEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditTopicToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.editTopicEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditTopicMarkdown,state.editTopicEditor,undefined)
                    }
                );
                state.editTopicEditor.html(state.editTopicEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
        
        
    } 

    //处理切换到Markdown编辑器
    const handleEditTopicToggleMarkdownEditor = (editorId: string) => {
        
        if (Object.keys(state.editTopicEditor).length != 0) {//不等于空
            state.editTopicEditorCreateParameObject.html = state.editTopicEditor.html();//切换时保存富文本内容
			state.editTopicEditor.remove();
            state.editTopicEditor = {};
		}
        state.isEditTopicMarkdown = true;
    }




    //处理添加评论Markdown
    const handleAddCommentMarkdownChange = (value: string) => {
        state.addCommentMarkdownContent = value;
    }

    //评论白名单
    const commentSanitize = (schema: any) => {
        schema = sanitize(schema);
        return schema;
    }


     //处理切换到富文本编辑器
     const handleAddCommentToggleRichtextEditor = (editorId: string) => {
        state.isAddCommentMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.addCommentEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.addCommentEditor = createEditor(
                    state.addCommentEditorCreateParameObject.ref, 
                    state.addCommentEditorCreateParameObject.availableTag, 
                    state.addCommentEditorCreateParameObject.uploadPath, 
                    state.addCommentEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAddCommentToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addCommentEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAddCommentMarkdown,state.addCommentEditor,undefined)
                    }
                );
                state.addCommentEditor.html(state.addCommentEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    }

    //处理添加评论切换到Markdown编辑器
    const handleAddCommentToggleMarkdownEditor = (editorId: string) => {
        if (Object.keys(state.addCommentEditor).length != 0) {//不等于空
            state.addCommentEditorCreateParameObject.html = state.addCommentEditor.html();//切换时保存富文本内容
            state.addCommentEditor.remove();
            state.addCommentEditor = {};
        }
        state.isAddCommentMarkdown = true;
    }


    //处理引用评论Markdown
    const handleQuoteCommentMarkdownChange = (value: string, commentId: string) => {
       Object.assign(state.quoteCommentMarkdownContent, {[commentId] : value});
    }


    //处理引用评论切换到富文本编辑器
    const handleQuoteCommentToggleRichtextEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];
        state.isQuoteCommentMarkdownMap.set(commentId,false);

        nextTick(()=>{
            
            let quoteEditorCreateParameObject = state.quoteEditorCreateParameMap.get(commentId);

            if (quoteEditorCreateParameObject !=undefined && Object.keys(quoteEditorCreateParameObject).length != 0) {//不等于空
               
                //创建富文本编辑器
                let quoteCommentEditor = createEditor(
                    quoteEditorCreateParameObject.ref, 
                    quoteEditorCreateParameObject.availableTag, 
                    quoteEditorCreateParameObject.uploadPath, 
                    quoteEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleQuoteCommentToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,quoteEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isQuoteCommentMarkdownMap.get(commentId),quoteCommentEditor,undefined)
                    }
                );
                quoteCommentEditor.html(quoteEditorCreateParameObject.html);//切换时设置富文本内容
                state.quoteEditorMap.set(commentId, quoteCommentEditor);
            }
        })
    }

    //处理引用评论切换到Markdown编辑器
    const handleQuoteCommentToggleMarkdownEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];

        let quoteEditor = state.quoteEditorMap.get(commentId);
        if (quoteEditor !=undefined && Object.keys(quoteEditor).length != 0) {//不等于空
            let quoteEditorCreateParameObject = state.quoteEditorCreateParameMap.get(commentId);
            quoteEditorCreateParameObject.html = quoteEditor.html();//切换时保存富文本内容
            quoteEditor.remove();
            quoteEditor = {};
        }

        state.isQuoteCommentMarkdownMap.set(commentId,true);                
    }


    //处理修改评论Markdown
    const handleEditCommentMarkdownChange = (value: string, commentId: string) => {
       Object.assign(state.editCommentMarkdownContent, {[commentId] : value});
    }

    //处理修改评论切换到富文本编辑器
    const handleEditCommentToggleRichtextEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];
        state.isEditCommentMarkdownMap.set(commentId,false);

        nextTick(()=>{
            
            let editEditorCreateParameObject = state.editCommentEditorCreateParameMap.get(commentId);

            if (editEditorCreateParameObject !=undefined && Object.keys(editEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                let editCommentEditor = createEditor(
                    editEditorCreateParameObject.ref, 
                    editEditorCreateParameObject.availableTag, 
                    editEditorCreateParameObject.uploadPath, 
                    editEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditCommentToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,editEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditCommentMarkdownMap.get(commentId),editCommentEditor,undefined)
                    }
                );
                editCommentEditor.html(editEditorCreateParameObject.html);//切换时设置富文本内容
                state.editCommentEditorMap.set(commentId, editCommentEditor);
            }
        })
    }

    //处理修改评论切换到Markdown编辑器
    const handleEditCommentToggleMarkdownEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];

        let editEditor = state.editCommentEditorMap.get(commentId);
        if (editEditor !=undefined && Object.keys(editEditor).length != 0) {//不等于空
            let editEditorCreateParameObject = state.editCommentEditorCreateParameMap.get(commentId);
            editEditorCreateParameObject.html = editEditor.html();//切换时保存富文本内容
            editEditor.remove();
            editEditor = {};
        }

        state.isEditCommentMarkdownMap.set(commentId,true);                
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
       

        if(forum == 'editTopic'){//修改话题
            if(state.isEditTopicMarkdown){//是否使用markdown评论编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.editTopicEditor.insertMention(url,title);
            }
        }else if(forum == 'addComment'){//添加评论
            if(state.isAddCommentMarkdown){//是否使用markdown评论编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.addCommentEditor.insertMention(url,title);
            }
        }else if(forum == 'editComment'){//修改评论
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id

            if(state.isEditCommentMarkdownMap.get(commentId)!= undefined && state.isEditCommentMarkdownMap.get(commentId) == true){//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                let editor = state.editCommentEditorMap.get(commentId);
                editor.insertMention(url,title);
            }
        }else if(forum == 'quoteComment'){//引用评论
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id


            if(state.isQuoteCommentMarkdownMap.get(commentId)!= undefined && state.isQuoteCommentMarkdownMap.get(commentId)){//引用评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);

            }else{
                let editor = state.quoteEditorMap.get(commentId);
                editor.insertMention(url,title);
            }
        }else if(forum == 'addReply'){//添加回复
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id


            let editor = state.addReplyEditorMap.get(commentId);
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
    const telescopicReply = (commentId:string) => {
        let status = state.replyExpandOrShrink.get(commentId);
        if(status){
            state.replyExpandOrShrink.set(commentId, false); //收缩

            if (state.commentList != null && state.commentList.length > 0) {
                for(var i=0;i<state.commentList.length; i++){
                    var comment = state.commentList[i];
                    if(comment.id == commentId){
                        if(comment.replyList != null && comment.replyList.length >=state.viewNumber){
                            //展开前最后一条回复
                            let reply = comment.replyList[state.viewNumber-1];

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
            state.replyExpandOrShrink.set(commentId, true); //伸展
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



     //查询话题
     const queryTopic = () => {
        let params = {};
        if(router.currentRoute.value.query.page != undefined && router.currentRoute.value.query.page != ''){
            params = {
                method : 'view',
                topicId :state.topicId,
                commentId :state.commentId,
                page :state.currentpage,
            }
        }else{
            params = {
                method : 'view',
                topicId :state.topicId,
                commentId :state.commentId,
                
            }
        }

        proxy?.$axios({
            url: '/control/topic/manage',
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
			    			if(key == "topic"){//话题
			    				let topic = mapData[key];
			    				//清空播放器
								clearVideoPlayer();
								
								
								//处理自定义标签
								let contentNode = document.createElement("div");
								contentNode.innerHTML = topic.content;
								
								bindNode(contentNode);
								topic.content = escapeVueHtml(contentNode.innerHTML);
								
                                

	                            state.topic = topic;
								
								nextTick(()=>{
                                    setTimeout(function() {
                                        renderVideoPlayer();//渲染视频播放器
                                    }, 30);

                                    //渲染代码
                                    let topicRefValue = proxy?.$refs['topic_'+state.topicId];
                                    if(topicRefValue != undefined){
                                        renderBindNode(topicRefValue); 
                                    }
                                });
			    			}else if(key == "giveRedEnvelope"){//发红包
								let giveRedEnvelope = mapData[key];
			    				state.giveRedEnvelope = giveRedEnvelope;
			    			
			    			
			    			}else if(key == "availableTag"){//评论富文本框支持标签
			    				state.availableTag = mapData[key];
				    			
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
                            }else if(key == "userName"){//用户名称
								let userName = mapData[key];
			    				state.userName = userName;
			    			}else if(key == "pageView"){//评论分页列表
                               
			    				let pageView = mapData[key];
			    				
			    				let commentList = pageView.records;
			    				
                                //清空

                                state.replyElementNodes.clear();


                                state.commentList.length = 0;
			    				
			    				
			    				if(commentList != null && commentList.length > 0){
				    				for (let i = 0; i <commentList.length; i++) {
										let comment = commentList[i];
										
                                        if(!state.replyExpandOrShrink.get(comment.id)){//如果之前没有设置或不存在
                                            state.replyExpandOrShrink.set(comment.id, false); //是否展开
                                        }
										

										//组装引用数据
										if(comment.quoteList != null && comment.quoteList.length >0){
											let quoteContent = "";
											for (let j = 0; j <comment.quoteList.length; j++) {
												let quote = comment.quoteList[j];
												let avatarHtml = "";
												
												avatarHtml += "<div class=\"avatar\">";
							                	avatarHtml += 		"<el-popover effect=\"light\" trigger=\"hover\" placement=\"top\" :persistent=\"false\">";
											    avatarHtml += 		   	"<template #default>";
												
												
												if(quote.nickname  != null && quote.nickname != ''){
											   	//	avatarHtml += 			"<p>呢称: "+quote.nickname+"</p>";
											   		avatarHtml += 			"<p>呢称: "+escapeHtml(quote.nickname)+"</p>";
												}   	
												avatarHtml += 				"<p>账号: "+quote.account+"</p>";
											    if(quote.userRoleNameList != null && quote.userRoleNameList.length >0){
											        avatarHtml += 			"<p>角色: ";
											        for (let k = 0; k <quote.userRoleNameList.length; k++) {
											        	let roleName = quote.userRoleNameList[k];
											        	avatarHtml += 			"<span class=\"topicViewModule_topic-wrap_head_topicInfo_userRoleName\" >"+escapeHtml(roleName)+"</span>";
											        }
											        avatarHtml += 			"</p>";
												}       
											    avatarHtml += 		   	 "</template>";
											    	
											    if(quote.isStaff == false){
											   		avatarHtml += 			"<template #reference>";
											   		avatarHtml += 				"<div class=\"avatar-wrapper\" >";
											   		if(quote.avatarName == null || quote.avatarName == ''){
											   			avatarHtml += 				"<div class=\"avatar-badge\" >";
											   			avatarHtml += 					"<el-avatar shape=\"square\" :size=\"40\" icon=\"UserFilled\"></el-avatar>";
											   			avatarHtml += 				"</div>";
											   		}
											   		if(quote.avatarName != null && quote.avatarName != ''){
											   			avatarHtml += 				"<div class=\"avatar-badge\" >";
											   			avatarHtml += 					"<el-avatar shape=\"square\" :size=\"40\" src=\""+quote.avatarPath+"100x100/"+quote.avatarName+"\"></el-avatar>";
											   			avatarHtml += 				"</div>";
											   		}
											   		avatarHtml += 				"</div>";
											   		avatarHtml += 			"</template>";
												}    
											    if(quote.isStaff == true){
											   		avatarHtml += 			"<template #reference>";
											   		avatarHtml += 				"<div class=\"avatar-wrapper\" >";   		
                                                    if(quote.avatarName == null || quote.avatarName == ''){
                                                        avatarHtml += 					"<el-badge value=\"员工\" type=\"warning\" class=\"avatar-badge\">";
                                                        avatarHtml += 						"<el-avatar shape=\"square\" :size=\"40\" icon=\"UserFilled\"></el-avatar>";
                                                        avatarHtml += 					"</el-badge>";
                                                    }
                                                    if(quote.avatarName != null && quote.avatarName != ''){
                                                        avatarHtml += 					"<el-badge value=\"员工\" type=\"warning\" class=\"avatar-badge\">";
                                                        avatarHtml += 					"<el-avatar shape=\"square\" :size=\"40\" src=\""+quote.avatarPath+"100x100/"+quote.avatarName+"\"></el-avatar>";
											   			avatarHtml += 					"</el-badge>";
                                                    }
											   		avatarHtml += 				"</div>";
											   		avatarHtml += 			"</template>";
												} 
											    avatarHtml += 		"</el-popover>";
							                	avatarHtml += "</div>";
												
												avatarHtml += "<span class=\"info\" >";
												avatarHtml += 		"<h2 class=\"clearfix\" >";
											    avatarHtml += 			"<div class=\"userName\">";
											    avatarHtml += 				""+quote.account+"";
											    avatarHtml += 				"<div class=\"nickname\" >";
											    
											    if(quote.nickname != null && quote.nickname !=''){
											    	avatarHtml += 					""+escapeHtml(quote.nickname)+"";
											    }
											   
											    for (let k = 0; k <quote.userRoleNameList.length; k++) {
											        let roleName = quote.userRoleNameList[k];
											        avatarHtml += 				"<i class=\"userRoleName\" >"+escapeHtml(roleName)+"</i>";
											    
											      
											    }
											    if(quote.userName == state.topic.userName && quote.isStaff ==state.topic.isStaff){
											    	avatarHtml += 				"<i class=\"master\">作者</i>";
											    
											    }
											    avatarHtml += 				"</div>";
											    avatarHtml += 			"</div>";
						                        avatarHtml += 		"</h2>";
												avatarHtml += "</span>";
												
												quoteContent = "<div class=\"quoteComment\">"+quoteContent+"<span class=\"userInfo\">"+avatarHtml+"</span><div class=\"content\">"+quote.content+"</div></div>";
			
			
											}
											
											state.quoteData.set(comment.id, escapeVueHtml(quoteContent));
										}


                                        
                                        //回复
                                        if(comment.replyList != null && comment.replyList.length >0){
                                            for (let j = 0; j <comment.replyList.length; j++) {
                                                let reply = comment.replyList[j];
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
                                        contentNode.innerHTML = comment.content;
                                        bindNode(contentNode);
                                        comment.content = escapeVueHtml(contentNode.innerHTML);

                                        if(!state.quoteFormView.get(comment.id)){//如果之前没有设置或不存在
                                            state.quoteFormView.set(comment.id,false);
                                        }
				    					if(!state.addQuote_disabled.get(comment.id)){//如果之前没有设置或不存在
                                            state.addQuote_disabled.set(comment.id,false);
                                        }
				    					
				    					
				    					state.commentStatusField.set(comment.id,comment.status);


			    					}
			    					state.commentList = commentList;
			    				
				    				state.totalrecord = parseInt(pageView.totalrecord);//服务器返回的long类型已转为String类型
					    			state.currentpage = pageView.currentpage;
									state.totalpage = parseInt(pageView.totalpage);//服务器返回的long类型已转为String类型
									state.maxresult = pageView.maxresult;
									state.isShowPage = true;//显示分页栏
									
									
									nextTick(()=> {
										

                                        if(commentList != null && commentList.length > 0){
                                            for (let i = 0; i <commentList.length; i++) {
                                                let comment = commentList[i];
                                                let commentRefValue =  (proxy?.$refs['commentContent_'+comment.id] as any);
                                                if(commentRefValue != undefined && commentRefValue[0]){
                                                    renderBindNode(commentRefValue[0]); 
                                                }
                                                
                                            }
                                        }

                                        //跳转到锚点
                                        nextTick(()=> {
                                            setTimeout(function () {
                                                //跳转到评论
                                                if(state.commentId != null && state.commentId != '' && (router.currentRoute.value.query.replyId == undefined || router.currentRoute.value.query.replyIdreplyId == '')){

                                                    let commentRef = (proxy?.$refs['comment_'+state.commentId] as any);
                                                    if(commentRef !=undefined){
                                                        let commentRefValue = commentRef[0];
                                                        
                                                        //锚点距离浏览器顶部的高度 - <el-main>标签距离浏览器顶部的高度
                                                        //document.querySelector(".el-main")!.scrollTop = commentRefValue.offsetTop - (document.querySelector(".el-main") as any).offsetTop;
                                                        document.querySelector(".el-main")!.scrollTo({
                                                            top: commentRefValue.offsetTop - (document.querySelector(".el-main") as any).offsetTop,
                                                            behavior: 'smooth'
                                                        })
                                                    }
                                                }

                                                //跳转到回复
                                                if(router.currentRoute.value.query.replyId != undefined && router.currentRoute.value.query.replyId != ''){
                                                    if (state.commentList != null && state.commentList.length > 0) {
                                                        for(var i=0;i<state.commentList.length; i++){
                                                            var comment = state.commentList[i];
                                                            if(comment.replyList != null && comment.replyList.length > 0){
                                                                for(var j=0;j<comment.replyList.length; j++){
                                                                    var reply = comment.replyList[j];
                                                                    if(reply.id==router.currentRoute.value.query.replyId && j >=state.viewNumber){//如果在收缩层
                                                                        telescopicReply(comment.id);//展开
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    nextTick(()=> {
                                                        let replyElement = state.replyElementNodes.get(router.currentRoute.value.query.replyId as string);
                                                        if(replyElement){
                                                            //window.scrollTo(0,replyElement.getBoundingClientRect().top-20);
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

                            let flag = false;
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
                        }

                        editorIconList = editorIconList.filter(function(value:string, index:number, arr:any){
                            if(value == "mention"){//删除@提及按钮
                                return false;
                            }
                            return true;
                        });

                        let uploadPath = "control/comment/manage?method=uploadImage&userName="+state.userName+"&isStaff=true&topicId="+state.topicId;
                        if(state.supportEditor == 20 || state.supportEditor == 40){
                            state.isAddCommentMarkdown = true;
                        }
			    		
                        

                        
			    		if (Object.keys(state.addCommentEditorCreateParameObject).length === 0) {//等于空
			    			
                            if(!state.isAddCommentMarkdown){
                                //创建富文本编辑器
                                state.addCommentEditor = createEditor(commentContentRef.value, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleAddCommentToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isAddCommentMarkdown,state.addCommentEditor,undefined)
                                });
                            }
                            state.addCommentEditorCreateParameObject = {
			    				ref:commentContentRef.value,
			    				availableTag:editorIconList,
			    				uploadPath:uploadPath,
			    				userGradeList:null,
                                editorId:commentContentRef.value.getAttribute('editorId')
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

    //清空播放器
    const clearVideoPlayer = () => {
        for(let i=0; i< state.playerObjectList.length; i++){
            let playerObject = state.playerObjectList[i];
            
            playerObject.destroy();//销毁播放器
        }
        for(let i=0; i< state.playerHlsList.length; i++){
            let hls = state.playerHlsList[i];
            hls.destroy();//销毁视频流
        }
        state.playerObjectList.length = 0;//清空数组
        state.playerHlsList.length = 0;//清空数组
        state.playerIdList.length = 0;//清空数组
        state.playerNodeList.length = 0;//清空数组
    }

    //渲染视频播放器
    const renderVideoPlayer = () => {
        
        for(let i=0; i< state.playerIdList.length; i++){
            let playerId = state.playerIdList[i];
            let url = document.getElementById(playerId)?.getAttribute("url");
            let cover = document.getElementById(playerId)?.getAttribute("cover");//封面
            let thumbnail = document.getElementById(playerId)?.getAttribute("thumbnail");//缩略图
            
            let dp = null;
            if(url == ""){//如果视频处理中
                dp = new DPlayer({
                    container: document.getElementById(playerId),//播放器容器元素
                    screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                    
                    video: {
                        
                    }
                });
                let dom = document.createElement('div');
                dom.innerHTML="<div class='dplayer-process'><div class='box'><div class='prompt'>视频处理中，请稍后再刷新</div></div></div>";
                document.getElementById(playerId)?.appendChild(dom);
            }else{

                if(cover != undefined && cover != "" && thumbnail != undefined && thumbnail != ""){//切片视频
                    let hls = null;
                    dp = new DPlayer({
                        container: document.getElementById(playerId),//播放器容器元素
                        screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                        
                        video: {
                            url: url,
                            pic: cover,//视频封面
                            thumbnails: thumbnail,//视频预览图
                            type: 'customHls',
                            customType: {
                                customHls: function (video:any, player:any) {
                                    hls = new Hls();
                                    hls.loadSource(video.src);
                                    hls.attachMedia(video);
                                    hls.config.xhrSetup = (xhr, url) => {
                                        if(url.startsWith(store.apiUrl+"videoRedirect?")){//如果访问视频重定向页
                                            //如果使用重定向跳转时会自动将标头Authorization发送到seaweedfs，seaweedfs会报501错误 A header you provided implies functionality that is not implemented
                                            //这里发送X-Requested-With标头到后端，让后端返回需要跳转的地址
                                            let videoRedirectDate = {} as any;
                                            nativeQueryVideoRedirect(url,function(date:any){
                                                videoRedirectDate = date;
                                            });

                                            if(videoRedirectDate != null && Object.keys(videoRedirectDate).length>0 && videoRedirectDate.redirect != ''){
                                                //告诉hls重新发送ts请求
                                                xhr.open("GET", videoRedirectDate.redirect, true);//用重定向后的地址请求
                                                //xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                            }
                                        }else{
                                            // 请求ts的url 添加参数 props.fileid
                                            //url = url + "?t=" + props.fileid;
                                            // 这一步必须 告诉hls重新发送ts请求
                                            xhr.open("GET", url, true);
                                            //xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                        }
                                    };
                                },
                            },
                        }
                    });
                    state.playerHlsList.push(hls);
                }else{
                    if(url?.startsWith(store.apiUrl+"videoRedirect?")){//如果访问视频重定向页
                        //如果使用重定向跳转时会自动将标头Authorization发送到seaweedfs，seaweedfs会报501错误 A header you provided implies functionality that is not implemented
                        //这里发送X-Requested-With标头到后端，让后端返回需要跳转的地址
                        let videoRedirectDate = {} as any;
                        nativeQueryVideoRedirect(url,function(date:any){
                            videoRedirectDate = date;
                        });

                        if(videoRedirectDate != null && Object.keys(videoRedirectDate).length>0 && videoRedirectDate.redirect != ''){
                            //告诉hls重新发送ts请求
                            //xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                            dp = new DPlayer({
                                container: document.getElementById(playerId),//播放器容器元素
                                screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                                
                                video: {
                                    url: videoRedirectDate.redirect
                                }
                            });
                        }
                        
                    }else{
                        dp = new DPlayer({
                            container: document.getElementById(playerId),//播放器容器元素
                            screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                            
                            video: {
                                url: url
                            }
                        });

                    }

                }
                
            }
            state.playerObjectList.push(dp);
        }
        
        
        //添加播放器节点数据
        if(state.playerObjectList.length >0){
            
            for(let i=0; i< state.playerIdList.length; i++){
                let playerId = state.playerIdList[i];
                let node = document.getElementById(playerId);//节点对象
                state.playerNodeList.push(node);
            }
        }
        
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

    //审核话题
    const auditTopic = (topicId:string) => {

        ElMessageBox.confirm('此操作将该话题状态改为已发布, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('topicId',  topicId); 

            proxy?.$axios({
                url: '/control/topic/manage?method=auditTopic',
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
				    		
				    		queryTopic();
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
    //添加媒体处理任务
    const addMediaProcessQueue = (topicId:string) => {
        ElMessageBox.confirm('此操作将添加媒体处理任务, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('id', topicId);
		    formData.append('module', '10');

            proxy?.$axios({
                url: '/control/mediaProcessQueue/manage?method=addMediaProcessQueue',
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


    //查询标签
    const queryTagList = (event:any) => {
        if(!state.isAllowLoadTagGroup){
            return;
        }

        proxy?.$axios({
            url: '/control/tag/manage',
            method: 'get',
            params: {
                method : 'allTag'
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            state.isAllowLoadTagGroup = false;
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        state.options = result.data;
                        
                    }else if(result.code === 500){//错误
                       
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //选中标签
    const selectedTag = (val:any) => {
        state.tagId = val;
    }

    //修改话题表单
    const editTopicUI = () => {
        if(state.editTopicFormView){//如果已打开
            return;
        }
			
        state.editTopicFormView = true;

        proxy?.$axios({
            url: '/control/topic/manage',
            method: 'get',
            params: {
                method : 'edit',
                topicId :state.topicId,
            }
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(result){
                    if(result.code === 200){//成功
                        let mapData = result.data;
			    		
			    		let userGradeList = null;
			    		let topic = null;
			    		
						for(let key in mapData){
			    			if(key == "userGradeList"){//所有设置的等级
								userGradeList = mapData[key];
			    			}else if(key == "topic"){
			    				topic = mapData[key];
                                
                                if(topic.voteThemeId != null && topic.voteThemeId != ''){
                                    state.isVote = true;//是否发起投票
                                }
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

						if(userGradeList != null && topic != null){
							
							state.title = topic.title;
								
							state.sort = topic.sort;
							state.allow = topic.allow;
							state.status = topic.status;
							state.essence = topic.essence;




                            if(topic.isMarkdown != null && topic.isMarkdown == true){
                                state.isEditTopicMarkdown = true;
                                state.editTopicMarkdownContent = topic.markdownContent;
                            }else{
                                state.isEditTopicMarkdown = false;
                                topicContentRef.value.value = topic.content;
                            }


		    				
		    				
		    				
		    				state.tagId = topic.tagId;
		
							state.tagIdGroup = topic.tagId;
                            let tag =new Object() as Tag;
                            tag.id = topic.tagId;
                            tag.name = topic.tagName;
                            state.options.push(tag);
		    				
		    				
	    					let uploadPath = "control/topic/manage?method=upload&userName="+topic.userName+"&isStaff="+topic.isStaff;
				   		
					   		let availableTag = ['source', '|', 'preview', 'code',
						        '|', 'justifyleft', 'justifycenter', 'justifyright',
						        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
						        'superscript', 'clearhtml', 'quickformat', 'selectall', '|',
						        'formatblock', 'fontname', 'fontsize', 'fullscreen',  '/', 'forecolor', 'hilitecolor', 'bold',
						        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
						         'media','embedVideo','uploadVideo', 'insertfile','emoticons', 'table', 'hr',   'pagebreak',
						         'link', 'unlink','hide','hidePassword','hideComment','hideGrade','hidePoint','hideAmount'];
					   		
                            state.editTopicAvailableTag = availableTag;//修改话题富文本编辑器允许使用的标签

                           
                            if(!state.isEditTopicMarkdown){
                                //创建富文本编辑器
                                state.editTopicEditor = createEditor(topicContentRef.value, availableTag, uploadPath, userGradeList,store_fileStorageSystem.value,(editorId: string)=>{
                                    handleEditTopicToggleMarkdownEditor(editorId);
                                },
                                (editorId: string)=>{
                                    //提及弹窗
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isEditTopicMarkdown,state.editTopicEditor,undefined)
                                });
                            }

			    			state.editTopicEditorCreateParameObject = {
			    				ref:topicContentRef.value,
			    				availableTag:availableTag,
			    				uploadPath:uploadPath,
			    				userGradeList:userGradeList,
                                editorId:topicContentRef.value.getAttribute('editorId')
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

    //取消修改话题
    const cancelEditTopic = () => {
        if (Object.keys(state.editTopicEditor).length != 0) {//不等于空
			state.editTopicEditor.remove();
            state.editTopicEditor = {};
		}
        state.editTopicEditorCreateParameObject ={};

        state.editTopicMarkdownContent = "";
        
        state.title ='';
        state.tagId ='';//标签Id
        state.sort= 0;
        state.allow = true;
        state.status =0;
        state.essence = false;
        state.isAllowLoadTagGroup=true;//是否允许加载标签组
        state.tagIdGroup =[];//标签Id组
        state.loading =false;//是否正在从远程获取数据
        state.options= [];//Select 选择器标签数据



        state.isVote = false;//是否发起投票
        state.voteTitle ='';
        state.voteMaxChoice =1;
        state.voteEndDate_format ='';
        state.voteEndDate ='';//截止时间
        state.voteOptions.length = 0;//投票选项列表

        state.editTopicFormView = false;
        state.isEditTopicMarkdown= false;
    }

    //修改话题
    const editTopic = () => {
        state.editTopic_disabled = true;
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        formData.append('topicId', state.topicId);
        if(state.title != null && state.title != ''){
            formData.append('title', state.title);
            
        }
        
        if(state.tagId != null && state.tagId != ''){
            formData.append('tagId', state.tagId); 
        }
        if(state.sort != null && state.sort >=0){
            formData.append('sort', String(state.sort));
        }
        formData.append('allow', state.allow.toString());
        formData.append('status', String(state.status));
        formData.append('essence',state.essence.toString());
        
        if(state.isEditTopicMarkdown){
            formData.append('isMarkdown', state.isEditTopicMarkdown.toString());
            formData.append('markdownContent', state.editTopicMarkdownContent);
        }else{
            if(topicContentRef.value.value != null && topicContentRef.value.value !=''){
                formData.append('content', topicContentRef.value.value);
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
            url: '/control/topic/manage?method=edit',
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
                            message: '提交成功',
                            type: 'success',
                            onClose: ()=>{
                                
                            }
                        })
                        //取消修改话题
						cancelEditTopic();

			    		
			    		queryTopic();
                    }else if(result.code === 500){//错误
                        //修改返回属性
                        for (const [key, value] of Object.entries(result.data as Map<string,string>) as [string, string][]){
                            if(key == "content"){
                                ElMessageBox.alert(value, '错误', {
                                    type:'error',
                                    draggable: true,
                                    dangerouslyUseHTMLString: false,
                                    showConfirmButton: false
                                }).catch((error) => {
                                    console.log(error);
                                });
                            }
                        }



                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

                        
                    }
                }
            }
            state.editTopic_disabled = false;
        })
        .catch((error: any) =>{
            console.log(error);
            state.editTopic_disabled = false;
        });

    }



    //删除话题
    const deleteTopic = (topicId:string) => {
        ElMessageBox.confirm('此操作将删除该话题, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('topicId', topicId);

            proxy?.$axios({
                url: '/control/topic/manage?method=delete',
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


    //审核评论
    const auditComment = (commentId:string) => {
        ElMessageBox.confirm('此操作将该评论状态改为已发布, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('commentId',  commentId); 

            proxy?.$axios({
                url: '/control/comment/manage?method=auditComment',
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
                            queryTopic();
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

    //恢复评论
    const recoveryComment = (commentId:string) => {
        ElMessageBox.confirm('此操作将恢复该评论, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('commentId',  commentId); 

            proxy?.$axios({
                url: '/control/comment/manage?method=recoveryComment',
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

                            queryTopic();
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

    //添加评论
    const addCommentForm = () => {
        state.addCommentForm_disabled = true;

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        if(state.topicId != null && state.topicId != ''){
            formData.append('topicId',  state.topicId); 
        }

        if(state.isAddCommentMarkdown){
            formData.append('isMarkdown', state.isAddCommentMarkdown.toString());
            formData.append('markdownContent', state.addCommentMarkdownContent);
        }else{
            if(commentContentRef.value.value != null && commentContentRef.value.value !=''){
                formData.append('content', commentContentRef.value.value);
            }
        }
        

        proxy?.$axios({
            url: '/control/comment/manage?method=addComment',
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

                        state.addCommentMarkdownContent = "";
                        if (Object.keys(state.addCommentEditor).length != 0) {//不等于空
                            //清空字段
                            state.addCommentEditor.html("");
                            state.addCommentEditor.remove();
                            state.addCommentEditor = {};
                        }
                        state.addCommentEditorCreateParameObject = {};
			    		 
			    		queryTopic();
			    	}else if(result.code === 500){//错误
			    		//处理错误信息
                        processErrorInfo(result.data as Map<string,string> , error,()=>{});

			    		
			    	}
                }
                state.addCommentForm_disabled = false;
            }
        })
        .catch((error: any) =>{
            console.log(error);
            state.addCommentForm_disabled = false;//提交按钮disabled状态
        });

    }

    //修改评论表单
    const editCommentUI = (comment:Comment) => {
        if(state.editCommentFormView.get(comment.id) == true){//如果已打开
            return;
        }
		
        proxy?.$axios({
            url: '/control/comment/manage',
            method: 'get',
            params: {
                method : 'editComment',
                commentId: comment.id,
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
			    			if(key == "comment"){//评论
			    				let _comment = mapData[key];
                                


                              
			    				state.editCommentFormView.set(comment.id,true);
								nextTick(()=> {
                                    let editCommentElement = state.editCommentElementNodes.get(comment.id);
                                    if(editCommentElement){
                                        if(_comment.isMarkdown != null && _comment.isMarkdown == true){
                                            Object.assign(state.editCommentMarkdownContent, {[_comment.id] : _comment.markdownContent});
                                        }else{
                                            editCommentElement.value = _comment.content;
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


                                        let uploadPath = "control/comment/manage?method=uploadImage&userName="+comment.userName+"&isStaff="+comment.isStaff+"&topicId="+state.topicId;
                                        if(_comment.isMarkdown != null && _comment.isMarkdown == true){
                                            state.isEditCommentMarkdownMap.set(comment.id,true);
                                        }else{
                                            state.isEditCommentMarkdownMap.set(comment.id,false);
                                        }

                                        

                                        
                                        if(!state.isEditCommentMarkdownMap.get(comment.id)){
                                            //创建富文本编辑器
                                            let editor = createEditor(editCommentElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                                                handleEditCommentToggleMarkdownEditor(editorId);
                                            },
                                            (editorId: string)=>{
                                                //提及弹窗
                                                mentionPopUp(editorId,undefined)
                                            },
                                            (editorId: string)=>{
                                                //AI弹窗
                                                aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isEditCommentMarkdownMap.get(comment.id),editor,undefined)
                                            });
                                            
                                            state.editCommentEditorMap.set(comment.id,editor);
                                        }
                                        
                                        
                                        state.editCommentEditorCreateParameMap.set(comment.id,{
                                            ref:editCommentElement,
                                            availableTag:editorIconList,
                                            uploadPath:uploadPath,
                                            userGradeList:null,
                                            editorId:editCommentElement.getAttribute('editorId'),
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
    //取消修改评论
    const cancelEditComment = (commentId:string) => {
        let editCommentEditor = state.editCommentEditorMap.get(commentId);
        if(editCommentEditor != null){
            editCommentEditor.remove();
            state.editCommentEditorMap.delete(commentId);
            state.editCommentEditorCreateParameMap.delete(commentId);
            state.editCommentElementNodes.delete(commentId);
        }
        state.editCommentFormView.set(commentId,false);
        state.isEditCommentMarkdownMap.set(commentId,false);
    }

    //修改评论
    const editComment = (commentId:string) => {
        state.editComment_disabled.set(commentId,true);
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
        formData.append('commentId',  commentId); 


        let commentStatus = state.commentStatusField.get(commentId);
        if(commentStatus){
            formData.append('status',  String(commentStatus)); 
        }

        if(state.isEditCommentMarkdownMap.get(commentId)!= undefined && state.isEditCommentMarkdownMap.get(commentId) == true){
            
            formData.append('isMarkdown', state.isEditCommentMarkdownMap.get(commentId).toString());
          
            if(state.editCommentMarkdownContent[commentId] != undefined){
                formData.append('markdownContent', state.editCommentMarkdownContent[commentId]);
            }
        }else{
            let editCommentElement = state.editCommentElementNodes.get(commentId);
            if(editCommentElement){
                formData.append('content', editCommentElement.value);
            }
        }

        proxy?.$axios({
            url: '/control/comment/manage?method=editComment',
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
			    		



                        nextTick(()=>{//需要延迟才能让state.editCommentFormView的设置生效
                            cancelEditComment(commentId)
                            //state.editCommentFormView.set(commentId,false);
                        })
						
			    		
			    		
			    		
			    		queryTopic();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.editComment_disabled.set(commentId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.editComment_disabled.set(commentId,false);
        });
    }

    //引用评论表单
    const addQuoteUI = (commentId:string) => {
        if(state.quoteFormView.get(commentId) == true){//如果已打开
			return;
		}
			
			
        state.quoteFormView.set(commentId,true);
        
        nextTick(()=> {
            let quoteElement = state.quoteElementNodes.get(commentId);
            if(quoteElement){
                let uploadPath = "control/comment/manage?method=uploadImage&userName="+state.userName+"&isStaff=true&topicId="+state.topicId;
                    
                    
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

                    editorIconList = editorIconList.filter(function(value:string, index:number, arr:any){
                        if(value == "mention"){//删除@提及按钮
                            return false;
                        }
                        return true;
                    });
                }

                if(state.supportEditor == 20 || state.supportEditor == 40){
                    state.isQuoteCommentMarkdownMap.set(commentId,true);
                }else{
                    state.isQuoteCommentMarkdownMap.set(commentId,false);
                }

                
                

                if(!state.isQuoteCommentMarkdownMap.get(commentId)){
                    //创建富文本编辑器
                    let editor = createEditor(quoteElement, editorIconList, uploadPath, null,store_fileStorageSystem.value,(editorId: string)=>{
                        handleQuoteCommentToggleMarkdownEditor(editorId);
                    },
                    (editorId: string)=>{
                        //提及弹窗
                        mentionPopUp(editorId,undefined)
                    },
                    (editorId: string)=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,uploadPath,'file',store_fileStorageSystem.value,state.isQuoteCommentMarkdownMap.get(commentId),editor,undefined)
                    });
                    state.quoteEditorMap.set(commentId,editor);
                }
                state.quoteEditorCreateParameMap.set(commentId,{
                    ref:quoteElement,
                    availableTag:editorIconList,
                    uploadPath:uploadPath,
                    userGradeList:null,
                    editorId:quoteElement.getAttribute('editorId'),
                });
            }

        });
    }

    //取消引用评论
    const cancelQuote = (commentId:string) => {
        let quoteEditor = state.quoteEditorMap.get(commentId);
        if(quoteEditor != null){
            quoteEditor.remove();
            state.quoteEditorMap.delete(commentId);
            state.quoteEditorCreateParameMap.delete(commentId);
            state.quoteElementNodes.delete(commentId);
        }
        state.quoteFormView.set(commentId,false);	
        state.isQuoteCommentMarkdownMap.set(commentId,false);
	}

    //引用评论
    const addQuote = (commentId:string) => {
        state.addQuote_disabled.set(commentId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
			
		formData.append('commentId',  commentId); 
			
			
        if(state.isQuoteCommentMarkdownMap.get(commentId)!= undefined && state.isQuoteCommentMarkdownMap.get(commentId) == true){
            formData.append('isMarkdown', state.isQuoteCommentMarkdownMap.get(commentId).toString());
            if(state.quoteCommentMarkdownContent[commentId] != undefined){
                formData.append('markdownContent', state.quoteCommentMarkdownContent[commentId]);
            }
        }else{
            let quoteElement = state.quoteElementNodes.get(commentId);
            if(quoteElement){
                formData.append('content', quoteElement.value);
            }
        }

        

        proxy?.$axios({
            url: '/control/comment/manage?method=addQuote',
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
                            message: '添加成功',
                            type: 'success',
                            onClose: ()=>{
                                
                            }
                        })

                        //删除缓存
                        store.setCacheNumber();

                        //清除评论列表
                        //clearCommentList();



                        nextTick(()=>{//需要延迟才能让state.quoteFormView[commentId]的设置生效
                            cancelQuote(commentId)
                            //state.quoteFormView.set(commentId,false);
                        })
						
			    		
			    	
			    		
			    		queryTopic();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.addQuote_disabled.set(commentId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.addQuote_disabled.set(commentId,false);
        });
    }

    //删除评论
    const deleteComment = (commentId:string) => {
        ElMessageBox.confirm('此操作将删除该评论, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('commentId', commentId);

            proxy?.$axios({
                url: '/control/comment/manage?method=deleteComment',
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
                            //清除评论列表
                            //clearCommentList() 
                            queryTopic();
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
            url: '/control/comment/manage',
            method: 'get',
            params: {
                method : 'addReply',
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


                                let uploadPath = "control/comment/manage?method=uploadImage&userName="+mapData.userName+"&isStaff=true&topicId="+state.topicId;
                
                                
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
     const addReplyFriend = (commentId:string,replyId:string) => {
        state.addReplyFriend_disabled.set(replyId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
			
        formData.append('commentId',  commentId); 

        formData.append('friendReplyId',  replyId); 
        
        let addReplyFriendElement = state.addReplyFriendElementNodes.get(replyId);
        if(addReplyFriendElement){
            formData.append('content', addReplyFriendElement.value);
        }


        proxy?.$axios({
            url: '/control/comment/manage?method=addReply',
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

                        //清除评论列表
                        //clearCommentList();
                        nextTick(()=>{//需要延迟才能让state.addReplyFriendFormView的设置生效
                            cancelAddReplyFriend(replyId);
                        })
						

			    		queryTopic();
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
    const addReplyUI = (commentId:string) => {
        if(state.addReplyFormView.get(commentId) == true){//如果已打开
            return;
        }


        proxy?.$axios({
            url: '/control/comment/manage',
            method: 'get',
            params: {
                method : 'addReply',
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
                        state.addReplyFormView.set(commentId,true);
                        nextTick(()=> {
                            let addReplyElement = state.addReplyElementNodes.get(commentId);
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

                                
                                let uploadPath = "control/comment/manage?method=uploadImage&userName="+mapData.userName+"&isStaff=true&topicId="+state.topicId;
                
                                
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
                                
                                state.addReplyEditorMap.set(commentId,editor);
                                
                                
                                
                    
                                state.addReplyEditorCreateParameMap.set(commentId,{
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
    const cancelAddReply = (commentId:string) => {
        let addReplyEditor = state.addReplyEditorMap.get(commentId);
        if(addReplyEditor != null){
            addReplyEditor.remove();
            state.addReplyEditorMap.delete(commentId);
            state.addReplyEditorCreateParameMap.delete(commentId);
            state.addReplyElementNodes.delete(commentId);
        }
        state.addReplyFormView.set(commentId,false);
        
    }

    //添加回复
    const addReply = (commentId:string) => {
        state.addReply_disabled.set(commentId,true);

        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })

        let formData = new FormData();
			
        formData.append('commentId',  commentId); 

        let addReplyElement = state.addReplyElementNodes.get(commentId);
        if(addReplyElement){
            formData.append('content', addReplyElement.value);
        }

        proxy?.$axios({
            url: '/control/comment/manage?method=addReply',
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
                            cancelAddReply(commentId)
                        })

			    		queryTopic();
                    }else if(result.code === 500){//错误
                        
                        //处理错误信息
                        processErrorInfo(result.data as Map<string,string> , reactive({}),()=>{});

                        
                    }
                }
            }
            state.addReply_disabled.set(commentId,false);
        })
        .catch((error: any) =>{
            console.log(error);
            state.addReply_disabled.set(commentId,false);
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
		    	
            formData.append('replyId',  replyId); 
            proxy?.$axios({
                url: '/control/comment/manage?method=auditReply',
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
                            queryTopic();
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

    //恢复回复
    const recoveryReply = (replyId:string) => {
        ElMessageBox.confirm('此操作将恢复该回复, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('replyId',  replyId); 
            proxy?.$axios({
                url: '/control/comment/manage?method=recoveryReply',
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
                            queryTopic();
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

    //修改回复表单
    const editReplyUI = (reply:Reply) => {
        if(state.editReplyFormView.get(reply.id) == true){//如果已打开
            return;
        }
        
        proxy?.$axios({
            url: '/control/comment/manage',
            method: 'get',
            params: {
                method : 'editReply',
                replyId : reply.id,
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
			    			if(key == "reply"){//回复
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


                                        let uploadPath = "control/comment/manage?method=uploadImage&userName="+_reply.userName+"&isStaff="+_reply.isStaff+"&topicId="+state.topicId;
                                        
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
		formData.append('replyId',  replyId); 
			
        let replyStatus = state.replyStatusField.get(replyId);
        if(replyStatus){
            formData.append('status', String(replyStatus));
        }

        let editReplyElement = state.editReplyElementNodes.get(replyId)
        if(editReplyElement){
            formData.append('content', editReplyElement.value);
        }


        proxy?.$axios({
            url: '/control/comment/manage?method=editReply',
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
						
			    		
			    		queryTopic();
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

    //删除回复
    const deleteReply = (replyId:string) => {
        ElMessageBox.confirm('此操作将删除该回复, 是否继续?',{
            // type: 'warning',
            cancelButtonText: "取消",
            confirmButtonText: '确定'
        })
        .then(() => {

            let formData = new FormData();
		    	
            formData.append('replyId', replyId);

            proxy?.$axios({
                url: '/control/comment/manage?method=deleteReply',
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
                            queryTopic();
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
            path: '/admin/control/topic/manage/view', 
            query:{ 
                visible : router.currentRoute.value.query.visible,
                topicView_beforeUrl:(router.currentRoute.value.query.topicView_beforeUrl != undefined ? router.currentRoute.value.query.topicView_beforeUrl:''),
                topicId : state.topicId,
                commentId : state.commentId,
                page : page
            }
        });
    }
    //清除评论列表
    const clearCommentList = () => {
        state.quoteData.clear();
        state.commentList.length =0;

        for (const [key, value] of Object.entries(state.editCommentEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.editCommentEditorMap.clear();
        state.editCommentEditorCreateParameMap.clear();
        state.isEditCommentMarkdownMap.clear();
        state.editCommentMarkdownContent = {} as any;//修改评论markdown编辑内容 key:评论Id value:评论内容
        state.editCommentElementNodes.clear()

        for (const [key, value] of Object.entries(state.quoteEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.quoteEditorMap.clear();
        state.quoteEditorCreateParameMap.clear();
        state.isQuoteCommentMarkdownMap.clear();
        state.quoteCommentMarkdownContent = {} as any;//引用评论markdown编辑内容 key:评论Id value:评论内容
        state.quoteElementNodes.clear();
        

        state.editCommentFormView.clear();
        state.quoteFormView.clear();



        state.addCommentEditorPlugin.length = 0;//插件
        state.quoteCommentEditorPlugin.length = 0;//插件
        state.editCommentEditorPlugin.length = 0;//插件


        for (const [key, value] of Object.entries(state.addReplyEditorMap)){
            if(value != null){
                value.html("");//清空字段
				value.remove();
            }
        }
        state.addReplyEditorMap.clear();
        state.addReplyFormView.clear() //添加回复表单
        state.addReplyEditorCreateParameMap.clear()//添加回复编辑器的创建参数
        state.addReplyElementNodes.clear()

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
    const clickReplyLevel = (commentId:string,replyId:string) => {
       
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
            showReplyLevel(commentId,replyId);
        }
        
    }

    //关闭回复层级
    const closeReplyLevel = () => {
        state.dot.clear();
        state.line.clear();
    }

    //展示回复层级
    const showReplyLevel = (commentId:string,replyId:string) => {

        let dotArray = new Array();
        let replyList = [] as Array<Reply>;
        if(state.commentList != null && state.commentList.length > 0){
            A:for (let i = 0; i <state.commentList.length; i++) {
                let comment = state.commentList[i];
				
                 if(comment.id == commentId){
                    //回复
                    if(comment.replyList != null && comment.replyList.length >0){
                        replyList = comment.replyList;
                        for (let j = 0; j <comment.replyList.length; j++) {
                            let reply = comment.replyList[j];
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

		if(router.currentRoute.value.query.topicId != undefined && router.currentRoute.value.query.topicId != ''){
			state.topicId = router.currentRoute.value.query.topicId as string;
		}
		if(router.currentRoute.value.query.commentId != undefined && router.currentRoute.value.query.commentId != ''){
			state.commentId = router.currentRoute.value.query.commentId as string;
		}
		if(router.currentRoute.value.query.page != undefined && router.currentRoute.value.query.page != ''){
			state.currentpage = parseInt(router.currentRoute.value.query.page as string);
		}

		
		//上级路由解码
		if(router.currentRoute.value.query.topicView_beforeUrl != undefined && router.currentRoute.value.query.topicView_beforeUrl != ''){
			
            let parsedWordArray = enc.Base64url.parse(router.currentRoute.value.query.topicView_beforeUrl as string);
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
		
		
		
		
		queryTopic();

    }) 

    //keep-alive 进入时
    onActivated (()=>{
        if (Object.keys(state.addCommentEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isAddCommentMarkdown){
                //创建富文本编辑器
                state.addCommentEditor = createEditor(
                    state.addCommentEditorCreateParameObject.ref, 
                    state.addCommentEditorCreateParameObject.availableTag, 
                    state.addCommentEditorCreateParameObject.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleAddCommentToggleMarkdownEditor(state.addCommentEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(state.addCommentEditorCreateParameObject.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,state.addCommentEditorCreateParameObject.editorId,state.addCommentEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isAddCommentMarkdown,state.addCommentEditor,undefined)
                    }
                );
            }
		}
		
		
		//创建富文本编辑器
		state.quoteEditorCreateParameMap.forEach(function(value,key){
            if(!state.isQuoteCommentMarkdownMap.get(key)){
                let editor = createEditor(
                    value.ref, 
                    value.availableTag, 
                    value.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleQuoteCommentToggleMarkdownEditor(value.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(value.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,state.isQuoteCommentMarkdownMap.get(key),editor,undefined)
                    }
                );
            
                state.quoteEditorMap.set(key,editor);
            }
	    });
	
		//创建富文本编辑器
		state.editCommentEditorCreateParameMap.forEach(function(value,key){
            if(!state.isEditCommentMarkdownMap.get(key)){
                let editor = createEditor(
                    value.ref, 
                    value.availableTag, 
                    value.uploadPath, 
                    null,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditCommentToggleMarkdownEditor(value.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(value.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,value.editorId,value.uploadPath,'file',store_fileStorageSystem.value,state.isEditCommentMarkdownMap.get(key),editor,undefined)
                    }
                );
            
                state.editCommentEditorMap.set(key,editor);
            }
	    });
	
		if (Object.keys(state.editTopicEditorCreateParameObject).length != 0) {//不等于空
            if(!state.isEditTopicMarkdown){
                //创建富文本编辑器
                state.editTopicEditor = createEditor(
                    state.editTopicEditorCreateParameObject.ref, 
                    state.editTopicEditorCreateParameObject.availableTag, 
                    state.editTopicEditorCreateParameObject.uploadPath, 
                    state.editTopicEditorCreateParameObject.userGradeList,
                    store_fileStorageSystem.value,
                    ()=>{
                        handleEditTopicToggleMarkdownEditor(state.editTopicEditorCreateParameObject.editorId);
                    },
                    ()=>{
                        //提及弹窗
                        mentionPopUp(state.editTopicEditorCreateParameObject.editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,state.editTopicEditorCreateParameObject.editorId,state.editTopicEditorCreateParameObject.uploadPath,'file',store_fileStorageSystem.value,state.isEditTopicMarkdown,state.editTopicEditor,undefined)
                    }
                );
            }
		}

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

        if (Object.keys(state.addCommentEditor).length != 0) {//不等于空
			state.addCommentEditor.remove();
            state.addCommentEditor = {};
		}
		
		
		state.quoteEditorMap.forEach(function(value,key){
			value.remove();
	    });
        state.quoteEditorMap.clear();
		
		state.editCommentEditorMap.forEach(function(value,key){
			value.remove();
	    });
		state.editCommentEditorMap.clear();
		
		if (Object.keys(state.editTopicEditor).length != 0) {//不等于空
			state.editTopicEditor.remove();
            state.editTopicEditor = {};
		}

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


/* 话题查看 */
.topicViewModule{
	.topic-wrap{
        background: #fff;
        position: relative;
        .topicTag{
            padding-top:15px;
            margin-left:10px;
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
                .essence{
                    display: inline-block;
                    padding: 4px 5px 4px;
                    margin-right:5px;
                    font-size: 14px;
                    line-height: 14px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: #fff;
                    background-color: #ff7875;
                    position: relative;
                    top: -3px;
                }
                .top{
                    display: inline-block;
                    padding: 4px 5px 4px;
                    margin-right:5px;
                    font-size: 14px;
                    line-height: 14px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: #fff;
                    background-color: #69c0ff;
                    position: relative;
                    top: -3px;
                }
            }
            .topicInfo{
                color: #909399;
                font-size: 14px;
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
                .comment-icon{
                    float: left;margin-left: 20px;position: relative;top: 51px;
                }
                .comment{
                    float: left;margin-left: 3px;  position: relative;top: 48px;
                }
                .ipAddress{
                    float: right;position: relative;top: 48px;
                    .statusTagInfo{
                        position: absolute;right:0px; top: -30px;white-space: nowrap;
                    }
                    .redEnvelope{
                        display: inline-block;
                        font-size: 14px;
                        line-height: 14px;
                        padding: 6px 8px 6px 8px;
                        border-radius: 3px;
                        color:#ff4d4f;
                        background-color:#ffccc7;
                        margin-left: 6px;
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
        :deep(.topicMarkdownContent) {
            margin: 0px 10px 10px 10px;
            padding-top:10px;
            padding-bottom:15px;
            min-height: 80px;
            font-size: 15px;
            line-height: 1.8;
            color: #222;
            border-top: 1px solid #f1f1f1;
            word-wrap : break-word;
            word-break : break-all;
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
                word-wrap : break-word;
                word-break : break-all;
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
            hide{
                border: 0;
                border-left: 3px solid #53a8ff;
                margin-left: 10px;
                padding: 0.5em;
                min-height:26px;
                display: block;
                margin: 30px 0px 0px 0px;
                
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
            .inputValue_10{
                &:before {
                    content: '密码: ' attr(input-value) '';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_20{
                &:before {
                    content: '回复话题可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_30{
                &:before {
                    content: '达到等级 ' attr(description) ' 可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_40{
                &:before {
                    content: '需要支付 ' attr(input-value) ' 积分可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_50{
                &:before {
                    content: '需要支付 ' attr(input-value) ' 元费用可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            player{
                display: block;
                margin-top: 8px;
                height: 576px;
            }
            .dplayer-process {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 99;
                .box{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .prompt{
                        width: 250px;
                        height: 80px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        padding :0px 30px;
                        border-radius :3px;
                        color: #fff;
                        line-height: 80px;
                        font-size: 20px;
                        background-color:rgb(0,0,0);
                        opacity:0.7;
                        filter:alpha(opacity=70);
                        text-align: center;
                    }
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
            word-wrap : break-word;
            word-break : break-all;
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
            pre{white-space:pre-wrap;}
            pre code{/*连续字母数字换行*/
                word-break: break-all;
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
            hide{
                border: 0;
                border-left: 3px solid #53a8ff;
                margin-left: 10px;
                padding: 0.5em;
                min-height:26px;
                display: block;
                margin: 30px 0px 0px 0px;
                
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
            .inputValue_10{
                &:before {
                    content: '密码: ' attr(input-value) '';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_20{
                &:before {
                    content: '回复话题可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_30{
                &:before {
                    content: '达到等级 ' attr(description) ' 可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_40{
                &:before {
                    content: '需要支付 ' attr(input-value) ' 积分可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            .inputValue_50{
                &:before {
                    content: '需要支付 ' attr(input-value) ' 元费用可见';
                    color: #53a8ff;
                    font-size:14px;
                    position: absolute;
                    margin-top: -30px;
                    line-height: 30px;
                }
            }
            player{
                display: block;
                margin-top: 8px;
                height: 576px;
            }
            .dplayer-process {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 99;
                .box{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .prompt{
                        width: 250px;
                        height: 80px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        padding :0px 30px;
                        border-radius :3px;
                        color: #fff;
                        line-height: 80px;
                        font-size: 20px;
                        background-color:rgb(0,0,0);
                        opacity:0.7;
                        filter:alpha(opacity=70);
                        text-align: center;
                    }
                }
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

    .editTopic{
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

.topicViewModule_topic-wrap_head_topicInfo_userRoleName{
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


.commentModule {
	.commentList {
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
            .main {
                padding: 20px 0px 0 74px;
                font-size: 16px;
                line-height: 26px;
                margin: 0 0 10px;
                :deep(.commentMarkdownContent) {
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
                :deep(.commentContent) {
                    margin-bottom: 10px;
                    color:#222;font-size: 15px;word-wrap : break-word;word-break : break-all;
                    a{
                        font-size: 15px;
                        color: #26a2ff;
                    }
                    p{font-size:16px;word-wrap : break-word;word-break : break-all;}
                    /* 自动换行 */
                    pre{white-space:pre-wrap;}
                    pre code{/*连续字母数字换行*/
                        word-break: break-all;
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
                .quote{
                    padding:5px 8px;border-bottom:none;text-align: left;margin-left: 5px;
                    :deep(.quoteComment){
                        background:#fafafa;padding:3px 3px 0px 3px;border:1px solid #ddd;line-height:140%;font-size: 15px;border-radius: 3px;
                        .userInfo{
                            position: relative;
                            .avatar{
                                float: left;margin-left: 5px;margin-top: 10px;
                            }
                            .info {
                                display: block;
                                float: left;
                                margin-left: 5px;
                                h2 {
                                    color:#909399;
                                    font-size:14px;
                                    float: left;
                                    .userName{
                                        margin-right: 5px;
                                        position: relative;top: 30px;
                                        .nickname{
                                            position: absolute;top: -19px;left: 0px;white-space: nowrap;
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
                                    position: relative;top: -1px;margin-left: 5px;
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
                                    position: relative;top: -1px;margin-left: 5px;
                                }
                            }
                            .el-badge__content{
                                transform: scale(0.7);top: -10px;
                                right: -18px;
                            }
                        }
                        .content{
                            margin-left: 5px;margin-top: 60px;margin-bottom: 10px;line-height: 26px;
                            
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
                        position: relative;
                        top: -1px;
                        line-height: 24px;
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
                                h2 {
                                    color:#909399;
                                    font-size:14px;
                                    float: left;
                                    .userName{
                                        margin-right: 5px;
                                        position: relative;top: 14px;font-size:14px;


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
                            color:#666;font-size: 15px;word-wrap : break-word;word-break : break-all;;
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
        .quote-formModule {
            margin-top:50px;
            margin-left: 75px;
            .addQuote-wrap{
                position: relative;
                padding:20px 20px 50px 20px;
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
                        position: absolute;font-size: 50px;top: -36px;left: -40px;color: #f9f9f9;
                    }
                }
                .quote-textarea{
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
                .quoteSubmit {
                    height: 38px;
                    float: left;
                    margin-right: 10px;
                    position: relative;
                    z-index: 2
                }
            }
        }
        /* 修改评论  */
        .editComment-formModule {
            margin-top:50px;
            margin-left: 75px;
            .editComment-wrap{
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
                        position: absolute;font-size: 50px;top: -36px;left: -42px;color: #f9f9f9;
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
                .editComment-textarea{
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
                .editCommentSubmit {
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
    .addComment{
        margin-left: 10px;margin-right: 10px; margin-top: 15px; margin-bottom: 10px;padding-top: 10px;

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
}
</style>