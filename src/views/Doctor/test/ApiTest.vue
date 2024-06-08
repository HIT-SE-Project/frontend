<!-- api使用样例，数据均存储在dataStore -->

<script setup>
import {
  getTimeTable,
  getDoctorInfo,
  getDoctorRecordList
} from '@/api/apiUtils.js';
import {
  getAppointmentStatusService
} from '@/api/api.js'

import { useDoctorStore } from '@/stores/doctor.js'
import { useCommonStore } from '@/stores/common.js'
import { ref } from 'vue';

const commonStore = useCommonStore();
const doctorStore = useDoctorStore();
// 调用
getDoctorInfo();
getDoctorRecordList();
getTimeTable();



const doctorId = ref(2313)
const date = ref('2024-05-22')
const appointmentStatusResult = ref([]);
async function fetchAppointmentStatus() {
  try {
    const appointmentStatusResponse = await getAppointmentStatusService(doctorId.value, date.value);
    appointmentStatusResult.value = appointmentStatusResponse.data;
  } catch (error) {
    console.error("获取预约状态出错:", error);
  }
}
// 调用该函数来获取医生可预约状况
fetchAppointmentStatus();

</script>

<template>
  <div class="test-container">
    <div class="row">
      <div class="description">医生个人信息 doctorStore.doctorInfo</div>
      <div class="sub-description">接口: getDoctorInfo<br>参数: 无</div>
      <div class="data">{{ doctorStore.doctorInfo }}</div>
    </div>
    <div class="row">
      <div class="description">医生预约记录 doctorStore.recordList</div>
      <div class="sub-description">接口: getDoctorRecordList<br>参数: 无</div>
      <div class="data">{{ doctorStore.recordList }}</div>
    </div>
    <div class="row">
      <div class="description">时间表 commonStore.timeTable</div>
      <div class="sub-description">接口: getTimeTable<br>参数: 无</div>
      <div class="data">{{ commonStore.timeTable }}</div>
    </div>
    <div class="row">
      <div class="description">医生可预约状况 appointmentStatusResult</div>
      <div class="sub-description">接口: getAppointmentStatusService<br>参数: doctorId={{ doctorId }}, date={{ date }}</div>
      <div class="data">{{ appointmentStatusResult }}</div>
    </div>
  </div>

</template>


<style lang="css" scoped>
.test-container {
  background-color: #f5f6fa;
  padding: 20px
}

.row {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.description {
  font-weight: bold;
  margin-bottom: 5px;
}

.sub-description {
  margin-bottom: 10px;
  font-size: 16px;
}

.data {
  font-size: 14px;
}
</style>