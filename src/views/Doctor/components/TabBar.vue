<template>
    <div class="tabbar-container">
        <div class="left"></div>
        <div class="tabs">
            <div class="tab" v-for="(tab, index) in tabs" :key="index" @click="changeTab(index)"
                :class="{ active: activeTab === index }">
                <div class="tab-item"
                    :style="{ backgroundColor: activeTab === index ? '#0077c2' : '#fff', color: activeTab === index ? '#fff' : '#000' }">
                    {{ tab.label }}
                </div>
            </div>
        </div>
        <div class="right">
            <el-tooltip content="待处理预约信息" placement="top" effect="dark" style="margin-right: 20px; margin-top: 10px;">
                <el-badge v-if="doctorStore.unHandledMessage > 0" :value="doctorStore.unHandledMessage" class="item"
                    style="margin-right: 20px; margin-top: 10px;">
                    <el-icon size="large">
                        <Bell />
                    </el-icon>
                </el-badge>
            </el-tooltip>


            <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    logoutService
} from '@/api/api.js';
import { ElMessage } from 'element-plus';
import { useDoctorStore } from '@/stores/doctor.js'
const router = useRouter();
const doctorStore = useDoctorStore();
const tabs = [
    { label: '预约面板', route: '/doctor/appointment' },
    { label: '个人信息', route: '/doctor/profile' },
    { label: 'ApiTest', route: '/doctor/test' }
];
const activeTab = ref(0);

function changeTab(index) {
    activeTab.value = index;
    router.push(tabs[index].route);
}
async function handleLogout() {
    try {
        const value = await logoutService();
        console.log(value)
        router.push('/login');
        if (value.code == 200) {
            ElMessage({
                message: '已退出',
                type: 'success',
            });
            let storage = window.localStorage;
            storage.clear();
        } else {
            ElMessage({
                message: '操作失败',
                type: 'error',
            });
        }
    } catch (error) {
        console.error(error);
        ElMessage({
            message: '操作失败',
            type: 'error',
        });
    }
}

</script>

<style scoped>
.tabbar-container {
    width: 100%;
    height: 100%;
    display: flex;
    color: #000;
    background-color: #fff;
}

.left,
.right {
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.left {
    border-right: 1px solid #dcdfe6;
    background: no-repeat url('@/assets/logo3.png');
    background-size: cover;
}

.tabs {
    flex: 1;
    display: flex;
}

.tab {
    width: 200px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.tab-item {
    height: 80%;
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;

}

.tab-item.active {
    background-color: #0077c2;
    color: #fff;
}
</style>