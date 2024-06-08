<script setup>
import {
    updateDoctorInfoService, getDoctorInfoServiceAsync
} from '@/api/api.js';
import {
    getDoctorInfo
} from '@/api/apiUtils.js';
import { useDoctorStore } from '@/stores/doctor.js'
import { ElMessage } from 'element-plus';
import { ref, onMounted } from 'vue';

onMounted(() => {
    getDoctorInfo();
});

const doctorStore = useDoctorStore();
const doctorInfo = ref({
    doctorId: doctorStore.doctorInfo.doctorId,
    name: doctorStore.doctorInfo.name,
    department: doctorStore.doctorInfo.department,
    title: doctorStore.doctorInfo.title,
    profile: doctorStore.doctorInfo.profile,
    image: doctorStore.doctorInfo.image
});

function handleSubmit() {
    let response = updateDoctorInfoService(doctorInfo);
    response.then(async (value) => {
        if (value.code == 200) {
            ElMessage({
                message: '更新成功',
                type: 'success',
            });
            await getDoctorInfoServiceAsync();
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

</script>

<template>
    <div class="doctor-personal-info-panel-container">
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
                                <el-input v-model="doctorInfo.name" style="width: 420px" placeholder="请输入" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                科室
                            </div>
                            <div class="content">
                                <el-input v-model="doctorInfo.department" style="width: 420px" placeholder="请输入" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                职称
                            </div>
                            <div class="content">
                                <el-input v-model="doctorInfo.title" style="width: 420px" placeholder="请输入" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                个人简介
                            </div>
                            <div class="content">
                                <el-input v-model="doctorInfo.profile" style="width: 420px"
                                    :autosize="{ minRows: 1, maxRows: 5 }" type="textarea" placeholder="请输入" />
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                头像URL
                            </div>
                            <div class="content">
                                <el-input v-model="doctorInfo.image" style="width: 420px" placeholder="请输入正确的图片URL" />
                            </div>
                        </div>

                    </div>
                </div>
                <div class="profile-picture">
                    <div class="profile-picture-title">
                        照片
                    </div>
                    <img :src="doctorInfo.image" alt="URL错误">
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
.doctor-personal-info-panel-container {
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
