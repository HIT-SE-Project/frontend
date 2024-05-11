<template>
    <div>
        <!-- 标签栏组件 -->
        <TabBar :activeTab="activeTab" @tabChange="handleTabChange" />
        <!-- 根据当前标签页动态显示对应的组件 -->
        <component :is="currentTabComponent" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TabBar from './components/TabBar.vue';
import AppointmentPanel from './components/AppointmentPanel.vue';
import PersonalInfoPanel from './components/PersonalInfoPanel.vue';

// 响应式状态：当前选中的标签页
const activeTab = ref('appointment');

// 方法：处理标签页切换事件
const handleTabChange = (tab) => {
    activeTab.value = tab;
};

// 计算属性：根据当前选中的标签页返回对应的组件
const currentTabComponent = () => {
    switch (activeTab.value) {
        case 'appointment':
            return AppointmentPanel;
        case 'personalInfo':
            return PersonalInfoPanel;
        default:
            return null;
    }
};
</script>