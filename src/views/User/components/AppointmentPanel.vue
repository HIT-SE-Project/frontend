<script setup>
import {
    getUserInfo, getUserRecordList,
    getDoctorList, getTimeTable
} from '@/api/apiUtils.js';
import { doctorAppointmentService, getAppointmentStatusService, getUserInfoServiceAsync, getTimeTableServiceAsync, getUserRecordListServiceAsync } from '@/api/api.js';
import { useUserStore } from '@/stores/user.js'
import { useCommonStore } from '@/stores/common.js'
import { ElMessage } from 'element-plus';
import { ref, watch, onMounted, computed } from 'vue'
const userStore = useUserStore();
const commonStore = useCommonStore();

const userRecordList = ref([]);
// 异步加载数据
const loadUserrRecordList = async () => {
    try {
        const response = await getUserRecordListServiceAsync();
        userRecordList.value = response; // 假设 response.data 是记录列表
    } catch (error) {
        console.error('Error fetching user record list:', error);
    }
};

// // 在组件挂载时调用异步加载函数
// onMounted(async () => {
//     await Promise.all([
//         getUserInfoServiceAsync(),
//         getUserRecordListServiceAsync(),
//         getTimeTableServiceAsync(),
//         loadUserrRecordList() // 调用异步加载函数
//     ]);
// });

// 获取基本信息
onMounted(() => {
    getUserInfo();
    getUserRecordList();
    getDoctorList();
    getTimeTable();
});

const genderName = (flag) => {
    flag = parseInt(flag)
    let name = '';
    switch (flag) {
        case 1:
            name = '男';
            break;
        case 2:
            name = '女';
            break;
        case 3:
            name = '保密';
            break;
    }
    return name;
}

// 个人预约信息Time-line数据（全部）
async function organizeRecordList() {
    // 先按照 date 升序，再按照 timeId 升序排序
    await loadUserrRecordList();
    userRecordList.value.sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        } else {
            return a.timeId - b.timeId;
        }
    });

    organizedList.value = userRecordList.value.map(record => {
        // 根据 doctorId 找到对应的医生名字
        const doctor = commonStore.doctorList.find(doctor => doctor.doctorId === record.doctorId);
        const recordIdx = record.recordIdx;
        const name = doctor ? doctor.name : '医生未知';

        // 根据 timeId 找到对应的时间段
        const timeSlot = commonStore.timeTable.find(time => time.timeId === record.timeId);
        const time = timeSlot ? `${record.date} ${timeSlot.startTime.slice(0, 5)}-${timeSlot.endTime.slice(0, 5)}` : '时间未知';

        // 用于更方便地判断是否过期
        const date = record.date;

        // 根据 flag 设置状态
        let status = '';
        switch (record.flag) {
            case 1:
                status = '待审核';
                break;
            case 2:
                status = '已同意';
                break;
            case 3:
                status = '已拒绝';
                break;
            default:
                status = '已过期';
        }

        let type = '';
        switch (record.flag) {
            case 1:
                type = 'primary';
                break;
            case 2:
                type = 'success';
                break;
            case 3:
                type = 'danger';
                break;
            default:
                type = 'info';
                break;
        }

        let hollow = '';
        switch (record.flag) {
            case 1:
                hollow = true;
                break;
            case 2:
                hollow = false;
                break;
            case 3:
                hollow = false;
                break;
            default:
                hollow = true;
                break;
        }
        return { recordIdx, name, time, status, type, hollow, date };
    });
}
const organizedList = ref([]);
organizeRecordList();

// 个人预约信息Time-line数据（未过期）
// function filterRecordsForTodayAndFuture() {
//     const today = new Date();
//     const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
//     filteredList.value = organizedList.value.filter(record => record.date >= formattedToday);
// }
// const filteredList = ref([]);
// filterRecordsForTodayAndFuture();
// 计算属性：过滤出今天及之后的记录
const filteredList = computed(() => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return organizedList.value.filter(record => record.date >= formattedToday);
});


// 控制全部历史预约信息对话框显示
const dialogVisible = ref(false)


// 预约表单
const appointForm = ref({
    doctorId: '',
    date: '',
    timeId: ''
})

// 时间选择器规则 - 仅限今天及之后
const disabledDate = (time) => {
    return time.getTime() < Date.now() - 8.64e7;;
}

// 可预约信息
const appointmentStatusResult = ref([]);
async function handleDateChange() {
    try {
        const appointmentStatusResponse = await getAppointmentStatusService(parseInt(appointForm.value.doctorId), appointForm.value.date);
        appointmentStatusResult.value = appointmentStatusResponse.data;
        appointmentStatusResult.value.forEach(item => {
            // 在 commonStore.timeTable 中查找匹配的 timeId
            const timeTableItem = commonStore.timeTable.find(time => time.timeId === item.timeId);
            // 如果找到了匹配的项，则将其 startTime 和 endTime 添加到 appointmentStatusResult 对应项中
            if (timeTableItem) {
                item.startTime = timeTableItem.startTime;
                item.endTime = timeTableItem.endTime;
            }
        });
    } catch (error) {
        console.error("获取预约状态出错:", error);
    }
}


// 判断该时间段是否已经预约满
function isSlotUnavailable(timeId) {
    // if (!this.appointmentStatusResult || this.appointmentStatusResult.length === 0) {
    //     return true; // 如果数组为空，返回 'N/A' 或其他适当的默认值
    // }

    const slotStatus = appointmentStatusResult.value.find(status => status.timeId === timeId);
    return slotStatus ? (slotStatus.patientNum - slotStatus.reservedNum <= 0) : false;
}

// 选择医生
const seletedDoctorName = ref('')
const handleDoctorSelect = (doctorId) => {
    appointForm.value.doctorId = doctorId;
    seletedDoctorName.value = commonStore.doctorList.find(doc => doc.doctorId == appointForm.value.doctorId).name;
}
function onSeletedDoctorNameChange() {
    if (appointForm.value.date) {
        handleDateChange()
    }
}
watch(seletedDoctorName, onSeletedDoctorNameChange);

// 获取剩余预约数量
function getRemainingAppointments(timeId) {
    // 检查appointmentStatusResult是否为空
    // if (!this.appointmentStatusResult || this.appointmentStatusResult.length === 0) {
    //     return 'N/A'; // 如果数组为空，返回 'N/A' 或其他适当的默认值
    // }

    const slotStatus = appointmentStatusResult.value.find(status => status.timeId === timeId);
    if (slotStatus) {
        return `${slotStatus.patientNum - slotStatus.reservedNum} / ${slotStatus.patientNum}`;
    }
    return 'N/A'; // 如果没有找到对应的预约状态，返回 'N/A' 或其他适当的默认值
}


// 选择时间段
const handleTimeSelect = (timeId) => {
    appointForm.value.timeId = timeId;
}


async function submitForm() {
    try {
        let data = {
            doctorId: parseInt(appointForm.value.doctorId),
            date: appointForm.value.date,
            timeId: parseInt(appointForm.value.timeId)
        };

        const response = await doctorAppointmentService(data);
        if (response.code == 200) {
            ElMessage({
                message: '预约成功',
                type: 'success',
            });

            await getUserInfoServiceAsync();
            await getUserRecordListServiceAsync();
            window.location.reload();
        } else {
            ElMessage({
                message: '预约失败',
                type: 'error',
            });
        }
    } catch (error) {
        console.error(error);
        ElMessage({
            message: '预约失败',
            type: 'error',
        });
    }
}


</script>

<template>
    <div class="appointment-panel-container">
        <!-- 个人信息及预约情况部分 -->
        <div class="personal-info-area border shadow">
            <!-- 个人信息 -->
            <div class="user-info">
                <div class="user-info-avatar">
                    <img :src="userStore.userInfo.image" alt="Avatar">
                </div>
                <div class="user-info-content">
                    <div class="info-row">
                        <span class="info-label">姓名: </span>
                        <span class="info-value">{{ userStore.userInfo.name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">性别: </span>
                        <span class="info-value">{{ genderName(userStore.userInfo.gender) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">年龄: </span>
                        <span class="info-value">{{ userStore.userInfo.age }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">电话: </span>
                        <span class="info-value">{{ userStore.userInfo.tel }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">地址: </span>
                        <span class="info-value">{{ userStore.userInfo.address }}</span>
                    </div>
                </div>
            </div>

            <!-- 预约时间线 -->
            <div class="timeline">
                <!-- userRecordList : {{ userRecordList }} -->
                <!-- organizedList: {{ organizedList }} -->
                <!-- filteredList: {{ filteredList }} -->
                <el-timeline style="max-width: 600px" v-if="filteredList.length != 0">
                    <el-timeline-item v-for="(item, index) in filteredList" :key="index" :icon="item.icon"
                        :type="item.type" :hollow="item.hollow" :timestamp="item.time">
                        {{ item.name }} {{ item.status }}
                    </el-timeline-item>
                </el-timeline>
                <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%;">暂无预约
                </div>
            </div>

            <!-- 查看全部历史记录 -->
            <div class="more">
                <el-button type="primary" @click="dialogVisible = true">查看全部历史记录</el-button>
                <el-dialog v-model="dialogVisible" title="历史记录" width="500" style="height: 700px; overflow: auto;"
                    :before-close="handleClose">
                    <el-timeline style="max-width: 600px">
                        <el-timeline-item v-for="(item, index) in organizedList" :key="index" :icon="item.icon"
                            :type="item.type" :hollow="item.hollow" :timestamp="item.time">
                            {{ item.name }} {{ item.status }}
                        </el-timeline-item>
                    </el-timeline>
                </el-dialog>
            </div>
        </div>

        <!-- 预约区域 -->
        <div class="appointment-area">
            <!-- 上方 - 医生列表区域 -->
            <div class="top-area border shadow">
                <div class="filter">
                    <!-- 请选择要预约的科室 >
                    <el-select v-model="value" placeholder="Select" size="large" style="width: 240px">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select> -->
                    请选择要预约的医生 >
                </div>
                <div class="doctor-list">
                    <div class="doctor-card" v-for="doctor in commonStore.doctorList" :key="doctor.doctorId">
                        <div class="avatar">
                            <img :src="doctor.image" alt="医生头像">
                        </div>
                        <div class="info">
                            <div class="info-rows">
                                <div class="row-1">{{ doctor.name }}</div>
                                <div class="row-2">
                                    <span>{{ doctor.department }}</span>
                                </div>
                                <div class="row-3">
                                    <span>{{ doctor.title }}</span>
                                </div>
                            </div>
                            <div class="doctor-profile">
                                <div class="doctor-profile-title">
                                    <el-icon>
                                        <User />
                                    </el-icon>个人简介
                                </div>
                                <div class="doctor-profile-content">
                                    {{ doctor.profile }}
                                </div>
                                <div class="reserve-btn">
                                    <el-button type="success"
                                        @click="handleDoctorSelect(doctor.doctorId)">点击选择</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 下方 - 预约表单部分 -->
            <div class="bottom-area appointment-form border shadow">
                <div class="doctor-info">
                    <span>已选择医生：{{ seletedDoctorName }}</span>
                    <el-date-picker v-model="appointForm.date" type="date" placeholder="选择日期" :size="size"
                        value-format="YYYY-MM-DD" :disabled-date="disabledDate" :disabled="!appointForm.doctorId"
                        @change="handleDateChange" />
                </div>
                <div class="time-slots" v-if="appointForm.doctorId && appointForm.date">
                    <div class="time-slot"
                        :class="{ selected: appointForm.timeId == slot.timeId, 'unavailable': isSlotUnavailable(slot.timeId) }"
                        v-for="slot in appointmentStatusResult" :key="slot.timeId"
                        @click="handleTimeSelect(slot.timeId)">
                        <div class="time">
                            {{ (slot?.startTime && typeof slot.startTime === 'string') ? slot.startTime.slice(0, 5) : ''
                            }} -
                            {{ (slot?.endTime && typeof slot.endTime === 'string') ? slot.endTime.slice(0, 5) : '' }}
                        </div>
                        <div class="available">剩余预约数:
                            {{ slot ? getRemainingAppointments(slot.timeId) : '请稍等' }}
                        </div>
                    </div>
                </div>
                <div class="time-slots no-selected" v-else>
                    请先选择要预约的医生和日期
                </div>
                <el-button class="submit-button" type="primary" @click="submitForm()"
                    style="height: 40px;">提交预约</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.appointment-panel-container {
    height: 100%;
    min-width: 950px;
    padding: 20px;
    display: grid;
    grid-template-columns: 25% 75%;
    gap: 20px;
    background-color: #f5f6fa;
}

/* 个人信息部分 */
.personal-info-area {
    background-color: #fff;
    /* display: grid; */
    /* grid-template-rows: 280px 300px 50px; */
    display: flex;
    flex-direction: column;
    height: 100%;
    /* overflow-y: scroll; */
    overflow: auto;

    .user-info {
        height: 280px;
        /* 固定高度 280px */
        display: grid;
        grid-template-rows: 120px auto;
        border-bottom: 1px solid #dcdfe6;

        .user-info-avatar {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 100px;
                height: 100px;
                border-radius: 12px;
            }
        }

        .user-info-content {
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .info-row {
                display: flex;
                margin-bottom: 5px;

                .info-label {
                    font-weight: bold;
                    margin-right: 5px;
                }

                .info-value {
                    flex: 1;
                }
            }
        }
    }

    .timeline {
        padding: 20px 0;
        flex: 1;
        overflow-y: auto;
    }

    .more {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center
    }
}

/* 预约部分 */
.appointment-area {
    min-height: 400px;
    display: grid;
    grid-template-rows: 2fr 1.2fr;
    gap: 20px;
    margin-right: 20px;
}

/* 左侧区域-> 医生列表 */
.top-area {
    display: grid;
    grid-template-rows: 50px auto;
    overflow: hidden;
    background-color: #fff;
    padding: 10px;

    .doctor-list {
        overflow: auto;
    }

    .doctor-card {
        display: grid;
        grid-template-columns: 130px auto;
        gap: 10px;
        border-bottom: 1px solid #dcdfe6;
        /* margin-bottom: 10px; */
        padding-bottom: 5px;
        padding-top: 15px;

        .avatar {
            display: flex;
            justify-content: center;

            img {
                width: 100px;
                height: 100px;
                border-radius: 12px;
            }
        }

        .info {
            display: grid;
            grid-template-columns: 140px auto;

            .info-rows {
                .row-1 {
                    font-size: 24px;
                    font-weight: 700;
                }

                .row-2,
                .row-3 {
                    font-size: 16px;
                }
            }

            .doctor-profile {
                .doctor-profile-title {
                    font-size: 18px;
                    margin-bottom: 5px;
                }

                .doctor-profile-content {
                    min-height: 60px;
                }

                .reserve-btn {
                    display: flex;
                    justify-content: right;
                }
            }


        }

    }

}

/* 右侧区域-> 预约表单 */
.bottom-area {
    height: 100%;
    min-height: 260px;
    width: 100%;
    overflow: auto;
    padding: 20px;
    background-color: #fff;
    display: grid;
    grid-template-rows: 50px auto 50px;

    .doctor-info {
        margin-bottom: 20px;
        font-weight: 700;
        display: flex;
        justify-content: space-between
    }

    .time-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .time-slot {
            flex: 1 1 140px;
            /* 设置每个时间段卡片的初始大小为 140px，可根据需要调整 */
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #fff;
            height: 70px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            cursor: pointer;
            transition: transform 0.2s;

            .time {
                font-weight: 700;
            }

            .available {
                /* color: #666; */
            }
        }

        .time-slot:hover {
            background-color: lightgray;
        }

        .time-slot:active {
            transform: scale(0.95);
        }

        .time-slot.selected {
            background-color: #409eff;
            color: #fff;
        }

        .time-slot.unavailable {
            pointer-events: none;
            opacity: 0.5;
        }
    }

    .no-selected {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .submit-button {
        display: block;
        width: 100%;
        margin-top: 20px;
        /* 调整按钮位置 */
    }
}
</style>