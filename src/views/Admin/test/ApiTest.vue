<!-- api使用样例，数据均存储在dataStore -->

<script setup>
import {
  getDoctorList
} from '@/api/apiUtils.js';
import {

} from '@/api/api.js'

import { useCommonStore } from '@/stores/common.js'


const commonStore = useCommonStore();
getDoctorList();

</script>

<template>
  <div class="test-container">
    <div class="row">
      <div class="description">医生列表 commonStore.doctorList</div>
      <div class="sub-description">接口: getDoctorList<br>参数: 无</div>
      <div class="data">{{ commonStore.doctorList }}</div>
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