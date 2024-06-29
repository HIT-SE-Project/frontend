import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDoctorStore = defineStore('doctorStore', () => {
    // 医生个人信息
    const doctorInfo = ref({});
    const setDoctorInfo = (newData) => { doctorInfo.value = newData; }


    // 医生预约记录
    const recordList = ref({});
    const setRecordList = (newData) => { recordList.value = newData; }

    // 待处理的预约记录数量
    const unHandledMessage = ref();
    const setUnHandledMessage = (newData) => { unHandledMessage.value = newData; }

    return {
        doctorInfo, setDoctorInfo,
        recordList, setRecordList,
        unHandledMessage, setUnHandledMessage
    };
}, {
    // 持久化存储
    persist: true
});
