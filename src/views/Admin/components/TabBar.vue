<template>
    <div class="tabbar-container">
        <div class="left"></div>
        <div class="tabs">
            <div class="tab" v-for="(tab, index) in tabs" :key="index" @click="changeTab(index)"
                :class="{ active: activeTab === index }">
                <div class="tab-item"
                    :style="{ backgroundColor: activeTab === index ? '#007bff' : '#fff', color: activeTab === index ? '#fff' : '#000' }">
                    {{ tab.label }}
                </div>
            </div>
        </div>
        <div class="right">
            <el-button type="warning" @click="handleLogout">退出登录</el-button>
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
const router = useRouter();

const tabs = [
    { label: '管理面板', route: '/admin/panel' },
    { label: 'ApiTest', route: '/admin/test' }
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
    background-color: #007bff;
    color: #fff;
}
</style>