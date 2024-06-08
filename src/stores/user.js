import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', () => {
    // 个人信息
    const userInfo = ref({});
    const setUserInfo = (newData) => { userInfo.value = newData; }

    // 预约记录
    const recordList = ref([]);
    const setRecordList = (newData) => { recordList.value = newData; }

    return {
        userInfo, setUserInfo,
        recordList, setRecordList
    };
}, {
    // 持久化存储
    persist: true
});
