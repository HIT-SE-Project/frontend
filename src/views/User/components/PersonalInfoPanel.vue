<script setup>
import {
    updateUserInfoService, getUserInfoServiceAsync
} from '@/api/api.js';
import {
    getUserInfo
} from '@/api/apiUtils.js';
import { useUserStore } from '@/stores/user.js'
import { ElMessage } from 'element-plus';
import { onMounted } from 'vue';
onMounted(() => {
    getUserInfo();
});


const userStore = useUserStore();
const userInfo = userStore.userInfo

function handleSubmit() {
    // userInfo.userId = parseInt(userInfo.userId)
    userInfo.gender = parseInt(userInfo.gender)
    userInfo.age = parseInt(userInfo.age)
    let response = updateUserInfoService(userInfo);
    response.then(async (value) => {
        if (value.code == 200) {
            ElMessage({
                message: '更新成功',
                type: 'success',
            });
            await getUserInfoServiceAsync();
            window.location.reload();

        } else {
            ElMessage({
                message: '更新失败',
                type: 'error',
            });
        }
    }).catch((error) => {
        console.error(error);
        ElMessage({
            message: '更新失败',
            type: 'error',
        });
    });
}

const genderName = (flag) => {
    flag = parseInt(flag)
    let name = '';
    switch (flag) {
        case 1:
            name = '男';
            break;
        case 2:
            name = '女';
            break;
        case 3:
            name = '保密';
            break;
    }
    return name;
}
</script>

<template>
    <div class="personal-info-panel-container">
        <div class="main-card border shadow">
            <div class="title">个人信息</div>
            <div class="profile">
                <div class="profile-form">
                    <div class="form-area">
                        <div class="form-item">
                            <div class="heading">
                                姓名
                            </div>
                            <div class="content">
                                <el-input v-model="userInfo.name" style="width: 420px" placeholder="请输入您的姓名" />
                            </div>
                        </div>
                        <div class="form-item" style="display: flex;">
                            <div>
                                <div class="heading">
                                    性别：{{ genderName(userInfo.gender) }}
                                </div>
                                <div class="content">
                                    <el-radio-group v-model="userInfo.gender" class="ml-4">
                                        <el-radio value="1" size="large">男</el-radio>
                                        <el-radio value="2" size="large">女</el-radio>
                                        <el-radio value="3" size="large">保密</el-radio>
                                    </el-radio-group>
                                </div>
                            </div>
                            <div style="margin-left: 80px;">
                                <div class="heading">
                                    年龄
                                </div>
                                <div class="content">
                                    <el-input-number v-model="userInfo.age" :min="1" :max="100"
                                        @change="handleChange" />
                                </div>
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                地址
                            </div>
                            <div class="content">
                                <el-input v-model="userInfo.address" style="width: 420px" placeholder="请输入您的住址" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                联系方式
                            </div>
                            <div class="content">
                                <el-input v-model="userInfo.tel" style="width: 420px" placeholder="请输入手机号码" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                身份证号
                            </div>
                            <div class="content">
                                <el-input v-model="userInfo.identification" style="width: 420px"
                                    placeholder="请输入18位身份证号码" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                头像URL
                            </div>
                            <div class="content">
                                <el-input v-model="userInfo.image" style="width: 420px" placeholder="请输入正确的图片URL" />
                            </div>
                        </div>

                    </div>
                </div>
                <div class="profile-picture">
                    <div class="profile-picture-title">
                        照片
                    </div>
                    <img :src="userInfo.image" alt="URL错误">
                </div>

            </div>
            <div class="btn">
                <el-button type="primary" plain round style="height: 40px; width: 200px; font-size: 20px;"
                    @click="handleSubmit()">提交</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.personal-info-panel-container {
    background-color: #f5f6fa;
    height: 100%;
    width: 100%;
    min-height: 800px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-card {
    width: 960px;
    background-color: #fff;
    padding: 30px;
}

.profile {
    display: grid;
    grid-template-columns: 7fr 3fr;
}

.profile-picture {
    /* background-color: blue; */
    display: flex;
    /* justify-content: center; */
    /* align-items: center; */
    flex-direction: column;
}

.profile-picture img {
    height: 200px;
    width: 200px;
    border-radius: 12px
}

.title {
    font-size: 24px;
    font-weight: 700;
    padding-bottom: 10px;
    border-bottom: 1px solid #d0d7deb3;
}

.form-item .heading {
    margin-top: 15px;
    font-size: 18px;
    /* font-weight: 600; */
}

.btn {
    /* background-color: pink; */
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
