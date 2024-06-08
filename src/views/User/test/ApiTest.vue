<!-- api使用样例，数据均存储在dataStore -->

<script setup>
import {
  getUserInfo, getUserRecordList,
  getDoctorList, getTimeTable
} from '@/api/apiUtils.js';
import {
  getAppointmentStatusService
} from '@/api/api.js'

import { useUserStore } from '@/stores/user.js'
import { useCommonStore } from '@/stores/common.js'
import { ref } from 'vue';

const userStore = useUserStore();
const commonStore = useCommonStore();
// 调用
getUserInfo();
getUserRecordList();
getDoctorList();
getTimeTable();

const doctorId = ref(9536)
const date = ref('2024-05-11')
const appointmentStatusResult = ref([]);

async function fetchAppointmentStatus() {
  console.log("执行了")
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
      <div class="description">个人信息 userStore.userInfo</div>
      <div class="sub-description">接口: getUserInfo<br>参数: 无</div>
      <div class="data">{{ userStore.userInfo }}</div>
    </div>
    <div class="row">
      <div class="description">预约记录 userStore.recordList</div>
      <div class="sub-description">接口: getUserRecordList<br>参数: 无</div>
      <div class="data">{{ userStore.recordList }}</div>
    </div>
    <div class="row">
      <div class="description">医生列表 commonStore.doctorList</div>
      <div class="sub-description">接口: getDoctorList<br>参数: 无</div>
      <div class="data">{{ commonStore.doctorList }}</div>
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