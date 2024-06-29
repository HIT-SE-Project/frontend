<script setup>
import {
    getUserInfo, getUserRecordList,
    getDoctorList, getTimeTable
} from '@/api/apiUtils.js';
import { doctorAppointmentService, getAppointmentStatusService, getUserInfoServiceAsync, getUserRecordListServiceAsync } from '@/api/api.js';
import { useUserStore } from '@/stores/user.js'
import { useCommonStore } from '@/stores/common.js'
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue'
// import { ElSelect, ElOption, ElButton, ElIcon } from 'element-plus';
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

// 医生筛选器
// 当前选择的科室
const selectedDepartment = ref('');

// 所有科室的集合
const departments = computed(() => {
    const deptSet = new Set();
    commonStore.doctorList.forEach(doc => {
        deptSet.add(doc.department);
    });
    return Array.from(deptSet);
});

// 根据选择的科室筛选医生
const filteredDoctors = computed(() => {
    return selectedDepartment.value
        ? commonStore.doctorList.filter(doctor => doctor.department === selectedDepartment.value)
        : commonStore.doctorList;
});

// 清除筛选条件的函数
const clearFilter = () => {
    selectedDepartment.value = ''; // 重置科室选择
    // 如果还有其他筛选条件，也在这里重置
};

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
    const slotStatus = appointmentStatusResult.value.find(status => status.timeId === timeId);
    return slotStatus ? (slotStatus.patientNum - slotStatus.reservedNum <= 0) : false;
}

// 选择医生
const seletedDoctorName = ref('')
const seletedDoctorId = ref('')
const handleDoctorSelect = (doctorId) => {
    appointForm.value.doctorId = doctorId;
    seletedDoctorName.value = commonStore.doctorList.find(doc => doc.doctorId == appointForm.value.doctorId).name;
    seletedDoctorId.value = doctorId;
}
function onSeletedDoctorNameChange() {
    if (appointForm.value.date) {
        handleDateChange()
    }
}
watch(seletedDoctorName, onSeletedDoctorNameChange);

// 获取剩余预约数量
function getRemainingAppointments(timeId) {
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
            // 延迟1.5秒后刷新页面(让预约成功弹窗多一会)
            setTimeout(() => {
                window.location.reload();
            }, 1500);
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
        <div class="personal-info-area">
            <!-- 个人信息 -->
            <div class="user-info border shadow">
                <div class="user-info-avatar">
                    <img :src="userStore.userInfo.image" alt="请填写个人信息">
                </div>
                <div class="user-info-content">
                    <div class="info-row">
                        <span class="info-label">姓名: </span>
                        <span class="info-value">{{ userStore.userInfo.name }}</span>
                    </div>
                    <div class="info-row">
                        <div style="margin-right: 20px">
                            <span class="info-label">性别: </span>
                            <span class="info-value">{{ genderName(userStore.userInfo.gender) }}</span>
                        </div>
                        <div>
                            <span class="info-label">年龄: </span>
                            <span class="info-value">{{ userStore.userInfo.age }}</span>
                        </div>

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
            <div class="timeline-area border shadow">
                <div class="timeline-heading">
                    <el-icon style="vertical-align: middle" :size="20">
                        <List />
                    </el-icon>预约记录
                </div>
                <div class="timeline">
                    <el-timeline style="max-width: 600px" v-if="filteredList.length != 0">
                        <el-timeline-item v-for="(item, index) in filteredList" :key="index" :icon="item.icon"
                            :type="item.type" :hollow="item.hollow" :timestamp="item.time">
                            {{ item.name }} {{ item.status }}
                        </el-timeline-item>
                    </el-timeline>
                    <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%;">
                        <el-empty description="暂无预约" />
                    </div>
                </div>

                <!-- 查看全部历史记录 -->
                <div class="more">
                    <el-button type="primary" style="background-color: #0077C2; color: #fff; height: 40px"
                        @click="dialogVisible = true">查看全部历史记录</el-button>
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

        </div>

        <!-- 预约区域 -->
        <div class="appointment-area">
            <!-- 上方 - 医生列表区域 -->
            <div class="top-area border shadow">
                <div class="filter">
                    <span class="filter-heading">
                        <el-icon style="vertical-align: middle" :size="20">
                            <Connection />
                        </el-icon> 选择预约医生
                    </span>
                    <div>
                        <!-- 科室选择器 -->
                        <el-select v-model="selectedDepartment" placeholder="请选择科室" size="large" style="width: 240px">
                            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
                        </el-select>
                        <el-button style="margin-left: 10px;background-color: #00619a;" type="primary" circle
                            @click="clearFilter" :icon="Refresh"></el-button>

                    </div>

                </div>
                <div class="doctor-list">
                    <div class="doctor-card" v-for="doctor in filteredDoctors" :key="doctor.doctorId"
                        :class="{ 'doctor-card-highlight': doctor.doctorId === seletedDoctorId }">
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
                                    <el-button type="primary" disabled v-if="doctor.doctorId === seletedDoctorId"
                                        style="width: 90px;"
                                        @click="handleDoctorSelect(doctor.doctorId)">已选择</el-button>
                                    <el-button type="primary" v-else style="width: 90px; background-color: #0077c2;"
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
                    <div class="doctor-info-heading">
                        <el-icon style="vertical-align: middle" :size="20">
                            <Connection />
                        </el-icon> 选择预约时间
                    </div>
                    <el-date-picker v-model="appointForm.date" type="date" placeholder="选择预约日期"
                        style="height: 40px; width: 280px;" value-format="YYYY-MM-DD" :disabled-date="disabledDate"
                        :disabled="!appointForm.doctorId" @change="handleDateChange" />

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
                    <!-- HTML -->
                    <div
                        style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; width: 80%; height: 80%;">
                        <div class="select-doctor-svg">
                        </div>
                        <span style="color: #a8abb2;">请先选择要预约的医生和日期</span>
                    </div>
                </div>
                <el-button class="submit-button" type="primary" @click="submitForm()" :disabled="!appointForm.timeId"
                    style="height: 40px; background-color: #0077C2;">提交预约</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.appointment-panel-container {
    height: 100%;
    min-width: 1250px;
    min-height: 550px;
    padding: 20px;
    display: grid;
    grid-template-columns: 25% 75%;
    gap: 20px;
    background-color: #f5f6fa;
    /* background-color: #fff; */
    /* color: rgba(0, 0, 0, 0.548); */
}

/* 个人信息部分 */
.personal-info-area {
    height: 100%;
    overflow: auto;
    display: grid;
    grid-template-rows: 140px auto;
    gap: 20px;
    min-width: 300px;

    .user-info {
        padding: 0 10px;
        /* background-color: #0f1222; */
        background-image: linear-gradient(to right, #0077c2 0%, #0178c3 50%, #58a3f3 100%);
        color: #fff;
        display: grid;
        grid-template-columns: 120px auto;
        overflow: hidden;

        .user-info-avatar {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 110px;
                height: 110px;
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

    .timeline-area {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;

        .timeline-heading {
            height: 50px;
            font-size: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .timeline {
            padding: 20px 0;
            flex: 1;
            overflow-y: auto;
        }

        .more {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

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
    background-color: #fff;
    /* background-color: #f5f5f5; */
    display: grid;
    grid-template-rows: 50px auto;
    overflow: hidden;
    padding: 10px;


    .filter {
        display: flex;

        justify-content: space-between;

        .filter-heading {
            /* display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row; */
            font-size: 20px;
            font-weight: 700;
            margin: 0 10px 0 5px;
        }
    }

    .doctor-list {
        overflow: auto;
    }

    .doctor-card {
        display: grid;
        grid-template-columns: 130px auto;
        gap: 10px;
        border-bottom: 1px solid #dcdfe677;
        /* margin-bottom: 10px; */
        padding-bottom: 5px;
        padding-top: 15px;
        transition: background-color 0.3s;
        /* border: none; */
        box-sizing: border-box;

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
            grid-template-columns: 120px auto;

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
                    margin-right: 8px;
                }
            }


        }

    }

    .doctor-card-highlight {
        border: 1px solid #0077C2;
        border-radius: 12px;
        /* box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3); */
        background-color: #f8f9fa;
        background-color: #79bcff60;
        transition: all 0.3s ease;

        background-image: linear-gradient(to bottom, #cfe6f1 0%, #e6f8ff 100%);
    }


    .doctor-card-highlight .reserve-btn .el-button {
        background-color: #d4eaf7;
        color: #5e5e5e;
    }
}

/* 右侧区域-> 预约表单 */
.bottom-area {
    background-color: #fff;
    /* background-color: #f5f5f5; */
    height: 100%;
    min-height: 260px;
    width: 100%;
    overflow: auto;
    padding: 20px;
    display: grid;
    grid-template-rows: 50px auto 50px;

    .doctor-info {
        margin-bottom: 20px;
        font-weight: 700;
        display: flex;
        justify-content: space-between;

        .doctor-info-heading {
            font-size: 20px;
            font-weight: 700;
        }
    }

    .time-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        /* CSS */
        .select-doctor-svg {
            width: 100%;
            height: 100%;
            background-image: url('@/assets/select_doctor.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

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
            /* background-color: #e6e9f4; */

            .time {
                font-weight: 700;
                /* background-color: #4069ff2d;
                border-radius: 6px; */
            }

            .available {
                /* color: #666; */
            }
        }

        .time-slot:hover {
            background-color: #e7e7e7dc;
            transition: all 0.3s ease;
        }

        .time-slot:active {
            transform: scale(0.95);
        }

        .time-slot.selected {
            background-color: #b4d4e8;
            /* color: #fff; */
            /* color: #000; */
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