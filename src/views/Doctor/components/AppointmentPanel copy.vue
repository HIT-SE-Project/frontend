<script setup>
import {
    getDoctorInfo, getDoctorRecordList, getTimeTable
} from '@/api/apiUtils.js';
import {
    handleRecordService, setAppointmentParamsService,
    getDoctorInfoServiceAsync, getDoctorRecordListServiceAsync, getTimeTableServiceAsync
} from '@/api/api.js';

import {
    getAppointmentStatusService, addDoctorTimeLineService, deleteDoctorTimeLineService
} from '@/api/api.js'
import { useDoctorStore } from '@/stores/doctor.js'
import { useCommonStore } from '@/stores/common.js'
import { ElMessage } from 'element-plus';
import { computed, ref, onMounted, watch } from 'vue'

const commonStore = useCommonStore();
const doctorStore = useDoctorStore();
const doctorRecordList = ref([]);

// 异步加载数据
const loadDoctorRecordList = async () => {
    try {
        const response = await getDoctorRecordListServiceAsync();
        doctorRecordList.value = response; // 假设 response.data 是记录列表
    } catch (error) {
        console.error('Error fetching doctor record list:', error);
    }
};


// 在组件挂载时调用异步加载函数
onMounted(async () => {
    await Promise.all([
        getDoctorInfoServiceAsync(),
        getDoctorRecordListServiceAsync(),
        getTimeTableServiceAsync(),
        loadDoctorRecordList() // 调用异步加载函数
    ]);
});



// 待审核列表
const pendingReviewList = computed(() => {
    return doctorRecordList.value
        .filter(record => record.flag === 1)
        .map(record => {
            const timeSlot = commonStore.timeTable.find(slot => slot.timeId === record.timeId);
            if (timeSlot) {
                const { startTime, endTime } = timeSlot;
                const time = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
                return { ...record, time };
            }
            return record;
        });
});

watch(pendingReviewList, (newVal, oldVal) => {
    doctorStore.setUnHandledMessage(newVal.length); // 当 pendingReviewList 更新时，更新 unHandledMessage
});

// 已审核列表
const allReviewedList = computed(() => {
    return doctorRecordList.value
        // 过滤掉flag为1的记录
        .filter(record => record.flag !== 1)
        // 按照date字段排序
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(record => {
            const timeSlot = commonStore.timeTable.find(slot => slot.timeId === record.timeId);
            if (timeSlot) {
                const { startTime, endTime } = timeSlot;
                const time = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
                return { ...record, time };
            }
            return record;
        });
});

// 用于时间线
const timeLineList = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 将时间部分设置为午夜，确保仅比较日期部分

    return doctorRecordList.value
        // 过滤掉flag为1的记录，并且保留今天及之后的记录
        .filter(record => record.flag == 2 && new Date(record.date) >= today)
        // 按照date字段排序
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(record => {
            const timeSlot = commonStore.timeTable.find(slot => slot.timeId === record.timeId);
            if (timeSlot) {
                const { startTime, endTime } = timeSlot;
                const time = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
                return { ...record, time };
            }
            return record;
        });
});

// 处理同意请求
const handleAgree = async (index, row) => {
    try {
        const response = await handleRecordService(parseInt(row.recordIdx), parseInt(1));
        if (response.code == 200) {
            ElMessage({
                message: '已同意',
                type: 'success',
            });
            window.location.reload();
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
};

// 处理拒绝请求
const handleReject = async (index, row) => {
    if (doctorStore.doctorInfo.refuseAppointment == '1') {
        try {
            const response = await handleRecordService(parseInt(row.recordIdx), parseInt(0));
            if (response.code == 200) {
                ElMessage({
                    message: '已拒绝',
                    type: 'success',
                });
                window.location.reload();
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
    } else {
        ElMessage({
            message: '无权限操作',
            type: 'error',
        });
    }
};

const patientNum = ref([])
const nowTimePeriodList = ref([])

// 新的时间段信息：用户选择
const newTimePeriodList = ref([]);

// 生成今天的日期
function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// 请求可预约人数、可预约时间段变量
async function fetchAppointmentStatus() {
    try {
        await getDoctorInfoServiceAsync();
        console.log(parseInt(doctorStore.doctorInfo.doctorId))
        const appointmentStatusResponse = await getAppointmentStatusService(parseInt(doctorStore.doctorInfo.doctorId), getFormattedDate());
        const appointmentData = appointmentStatusResponse.data;
        patientNum.value = appointmentData[0].patientNum;
        nowTimePeriodList.value = appointmentData.map(item => item.timeId);
        newTimePeriodList.value = appointmentData.map(item => item.timeId);
    } catch (error) {
        console.error("获取预约状态出错:", error);
    }
}
// 调用该函数来获取医生可预约状况
fetchAppointmentStatus();

// 编辑可预约人数
const handleEditPatientNum = async () => {
    if (doctorStore.doctorInfo.modifyinfo == '1') {
        try {
            const response = await setAppointmentParamsService(patientNum.value);
            if (response.code == 200) {
                ElMessage({
                    message: '更新成功',
                    type: 'success',
                });
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
    } else {
        ElMessage({
            message: '无权限操作',
            type: 'error',
        });
    }
};


// 配置可预约时间段对话框
const editTimePeriod = ref(false)

// 1. 包含所有 timeTable 里的时间段信息
const timePeriodList = computed(() => {
    return commonStore.timeTable.map(time => {
        return {
            timeId: time.timeId,
            date: `${time.startTime.slice(0, 5)}-${time.endTime.slice(0, 5)}`
        };
    });
});



// 增加、删除可预约时间段
async function generateAddAndDeleteLists() {
    const add = newTimePeriodList.value.filter(id => !nowTimePeriodList.value.includes(id));
    const del = nowTimePeriodList.value.filter(id => !newTimePeriodList.value.includes(id));
    console.log(add);
    console.log(del);
    try {
        // 所有添加请求的 Promise 数组
        const addPromises = add.map(timeId => addDoctorTimeLineService(parseInt(timeId)));
        // 所有删除请求的 Promise 数组
        const deletePromises = del.map(timeId => deleteDoctorTimeLineService(parseInt(timeId)));

        // 使用 Promise.all 等待所有请求完成
        await Promise.all([...addPromises, ...deletePromises]);
        // 如果所有请求都成功，显示成功消息
        ElMessage.success('所有操作成功完成');
    } catch (error) {
        ElMessage.error('操作失败，请重试');
    }
}



</script>

<template>
    <div class="doctor-appointment-panel-container">
        <div class="appointment-manage-container">
            <div class="pending-review-container table border shadow">
                <el-table :data="pendingReviewList"
                    style="width: 100%; display: grid; grid-template-columns: repeat(4, 1fr);"
                    :header-cell-style="{ 'text-align': 'center', fontSize: '17px', background: '#f8f8f8', color: '#9eabb4' }"
                    :cell-style="{ textAlign: 'center' }" :header-row-style="{ height: '45px', }"
                    :row-style="{ height: '50px', fontSize: '16px' }">
                    <el-table-column prop="userId" label="患者ID" />
                    <el-table-column prop="date" label="日期" />
                    <el-table-column prop="time" label="时间" />
                    <el-table-column prop="flag" label="操作">
                        <template #default="scope">
                            <el-button size="small" type="success" @click="handleAgree(scope.$index, scope.row)">
                                同意
                            </el-button>
                            <el-button size="small" type="danger" @click="handleReject(scope.$index, scope.row)">
                                拒绝
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="all-record-container table border shadow">
                <el-table :data="allReviewedList"
                    style="width: 100%; display: grid; grid-template-columns: repeat(4, 1fr);"
                    :header-cell-style="{ 'text-align': 'center', fontSize: '17px', background: '#f8f8f8', color: '#9eabb4' }"
                    :cell-style="{ textAlign: 'center' }" :header-row-style="{ height: '45px', }"
                    :row-style="{ height: '50px', fontSize: '16px' }">
                    <el-table-column prop="userId" label="患者ID" />
                    <el-table-column prop="date" label="日期" />
                    <el-table-column prop="time" label="时间" />
                    <el-table-column prop="flag" label="状态">
                        <template #default="scope">
                            <el-tag type="success" v-if="scope.row.flag == '2'">已同意</el-tag>
                            <el-tag type="danger" v-if="scope.row.flag == '3'">已拒绝</el-tag>
                            <el-tag type="info" v-if="scope.row.flag == '4'">已过期</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>


        <div class="right-container border shadow">

            <div class="info-container">
                <div class="header">
                    权限信息：
                </div>
                <div class="info-row">
                    <div>拒绝预约权限：</div>
                    <div>
                        <span v-if="doctorStore.doctorInfo.refuseAppointment == '1'" class="yes">是</span>
                        <span v-if="doctorStore.doctorInfo.refuseAppointment == '0'" class="no">否</span>
                    </div>

                </div>
                <div class="info-row">
                    <div>修改预约参数权限：</div>
                    <div>
                        <span v-if="doctorStore.doctorInfo.modifyinfo == '1'" class="yes">是</span>
                        <span v-if="doctorStore.doctorInfo.modifyinfo == '0'" class="no">否</span>
                    </div>
                </div>
                <div class="info-row">
                    <div>每时间段可接待人数：</div>
                    <div>
                        <span>{{ doctorStore.doctorInfo.patientNum }}</span>
                        <!-- <el-input-number v-model="doctorStore.doctorInfo.patientNum" :min="1" :max="10" @change="handleEditPatientNum"/> -->
                        <el-input-number :disabled="doctorStore.doctorInfo.modifyinfo == '0'" size="small"
                            v-model="patientNum" :min="0" :max="10" @change="handleEditPatientNum" />
                    </div>
                </div>
                <div class="info-row">
                    <div>可预约时间段配置：</div>
                    <div>
                        <span>{{ doctorStore.doctorInfo.patientNum }}</span>
                        <el-button :disabled="doctorStore.doctorInfo.modifyinfo == '0'" type="success" size="small"
                            plain @click="editTimePeriod = true">修改</el-button>
                        <el-dialog v-model="editTimePeriod" title="可预约时间段配置" width="500">
                            <!-- <div>
                                {{ timePeriodList }}
                                <br />
                                {{ nowTimePeriodList }}
                                <br />
                                {{ newTimePeriodList }}
                            </div> -->
                            <el-checkbox-group v-model="newTimePeriodList">
                                <el-checkbox v-for="(item, index) in timePeriodList" :key="index" :label="item.date"
                                    :value="item.timeId" />
                            </el-checkbox-group>
                            <template #footer>
                                <div class="dialog-footer">
                                    <el-button @click="editTimePeriod = false">取消</el-button>
                                    <el-button type="primary"
                                        @click="editTimePeriod = false; generateAddAndDeleteLists()">
                                        确认
                                    </el-button>
                                </div>
                            </template>
                        </el-dialog>
                    </div>
                </div>
            </div>
            <div class="timeline-container">
                <div class="header">
                    时间安排：
                </div>
                <el-timeline style="max-width: 600px" v-if="timeLineList.length != 0">
                    <el-timeline-item v-for="(item, index) in timeLineList" :key="index" :icon="item.icon"
                        type="primary" :hollow="true" :timestamp="item.date + ' ' + item.time">
                        患者ID: {{ item.userId }}
                    </el-timeline-item>
                </el-timeline>
                <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%;">暂无预约
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.doctor-appointment-panel-container {
    height: 100%;
    min-width: 950px;
    padding: 20px;
    background-color: #f5f6fa;
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 20px;
}

/* 预约部分 */
.appointment-manage-container {
    display: grid;
    grid-template-rows: 1fr 3fr;
    gap: 20px;

    .pending-review-container {
        height: 100%;
        background-color: #fff;
        overflow: hidden;
    }

    .all-record-container {
        height: 100%;
        background-color: #fff;
        overflow: hidden;
    }

    .table {
        height: 100%;
        display: grid;
        grid-template-rows: 50px 1fr;
        overflow: auto;
    }
}

/* 右侧区域 */
.right-container {
    background-color: #fff;
    display: grid;
    grid-template-rows: 200px auto;
    min-width: 350px;
    height: 100%;
    overflow-y: auto;

    .header {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .info-container {
        border-bottom: 1px solid #dee3e8;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .info-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            text-align: left;
        }

        .yes {
            color: #4caf50;
        }

        .no {
            color: #f44336;
        }
    }

    /* 时间线 */
    .timeline-container {
        display: flex;
        padding: 20px;
        overflow: auto;
        flex-direction: column;
    }
}
</style>