import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('commonStore', () => {
    // 医生列表
    const doctorList = ref([]);
    const setDoctorList = (newData) => { doctorList.value = newData; }

    // 时间表
    const timeTable = ref([]);
    const setTimeTable = (newData) => { timeTable.value = newData; }

    return {
        doctorList, setDoctorList,
        timeTable, setTimeTable
    };
}, {
    // 持久化存储
    persist: true
});
