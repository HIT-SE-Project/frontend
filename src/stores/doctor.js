import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDoctorStore = defineStore('doctorStore', () => {
    // 医生个人信息
    const doctorInfo = ref({});
    const setDoctorInfo = (newData) => { doctorInfo.value = newData; }


    // 医生预约记录
    const recordList = ref({});
    const setRecordList = (newData) => { recordList.value = newData; }

    return {
        doctorInfo, setDoctorInfo,
        recordList, setRecordList
    };
}, {
    // 持久化存储
    persist: true
});
