import request from '@/utils/request.js'
import { useCommonStore } from '@/stores/common.js'
import { useDoctorStore } from '@/stores/doctor.js'
import { useUserStore } from '@/stores/user.js'
// 数据仓库
const commonStore = useCommonStore();
const doctorStore = useDoctorStore();
const userStore = useUserStore();

/* 通用接口 */
// 已测试
// 登陆
export async function loginService(loginData) {
    const formData = new FormData();
    for (const key in loginData) {
        formData.append(key, loginData[key]);
    }

    const response = await request.post('/api/login', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

// 已测试
// 退出登陆
export async function logoutService() {
    const response = await request.get('/api/logout');
    return response.data;
}

// 已测试
// 注册
export async function registerService(registerData) {
    const response = await request.post('/api/register', registerData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

// 获取医生列表
export function getDoctorListService() {
    return request.get('/api/doctor/getDoctorList')
};

// 获取时间表
export function getTimeTableService() {
    return request.get('/api/doctor/getTimeTable')
};
// 获取时间表 - 异步
export async function getTimeTableServiceAsync() {
    try {
        const response = await request.get('/api/doctor/getTimeTable');
        if (response.data.code == 200) {
            commonStore.setTimeTable(response.data.data);
        }

    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

/* 用户功能接口 */
// 获取用户个人信息
export function getUserInfoService() {
    return request.get('/api/user/getUserInfo')
};

// 获取用户个人信息 - 异步
export async function getUserInfoServiceAsync() {
    try {
        const response = await request.get('/api/user/getUserInfo');
        if (response.data.code == 200) {
            userStore.setUserInfo(response.data.data);
        }

    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

// 已测试
// 更新用户个人信息
export async function updateUserInfoService(userInfo) {
    const response = await request.post('/api/user/updateUserInfo', JSON.stringify({
        'userId': userInfo.userId,
        'name': userInfo.name,
        'gender': userInfo.gender,
        'age': userInfo.age,
        'address': userInfo.address,
        'tel': userInfo.tel,
        'identification': userInfo.identification,
        'image': userInfo.image,
    }));
    return response.data;
}


// 获取用户预约记录
export function getUserRecordListService() {
    return request.get('/api/user/getRecordList')
};
// 获取用户预约记录 - 异步
export async function getUserRecordListServiceAsync() {
    try {
        const response = await request.get('/api/user/getRecordList');
        if (response.data.code == 200)
            userStore.setRecordList(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching user record list:', error);
        throw error;
    }
}


/* 医生功能接口 */
// 获取医生个人信息
export function getDoctorInfoService() {
    return request.get('/api/doctor/getDoctorInfo')
};

// 获取医生个人信息 - 异步
export async function getDoctorInfoServiceAsync() {
    try {
        const response = await request.get('/api/doctor/getDoctorInfo');
        if (response.data.code == 200)
            doctorStore.setDoctorInfo(response.data.data);
    } catch (error) {
        console.error('Error fetching user record list:', error);
        throw error;
    }
}


// 已测试
// 更新医生个人信息
export async function updateDoctorInfoService(doctorInfo) {
    doctorInfo = doctorInfo.value;
    const response = await request.post('/api/doctor/updateDoctorInfo', JSON.stringify({
        'doctorId': doctorInfo.doctorId,
        'name': doctorInfo.name,
        'department': doctorInfo.department,
        'title': doctorInfo.title,
        'profile': doctorInfo.profile,
        'image': doctorInfo.image,
    }));
    return response.data;
}

// 获取医生预约记录
export function getDoctorRecordListService() {
    return request.get('/api/doctor/getRecordList')
};

// 获取医生预约记录 - 异步
export async function getDoctorRecordListServiceAsync() {
    try {
        const response = await request.get('/api/doctor/getRecordList');
        if (response.data.code == 200)
            doctorStore.setRecordList(response.data.data);
        return response.data.data
    } catch (error) {
        console.error('Error fetching user record list:', error);
        throw error;
    }
}

// 已测试
// 获取医生可预约状况
export async function getAppointmentStatusService(doctorId, date) {
    const response = await request.get('/api/doctor/getAppointmentStatus', {
        params: {
            'doctorId': doctorId,
            'date': date
        }
    });
    return response.data;
}

// 已测试
// 预约医生
export async function doctorAppointmentService(appointmentInfo) {
    const response = await request.post('/api/doctor/doctorAppointment', JSON.stringify({
        'doctorId': appointmentInfo.doctorId,
        'date': appointmentInfo.date,
        'timeId': appointmentInfo.timeId,
    }));
    return response.data;
}

// 已测试
// 处理预约记录
export async function handleRecordService(recordIdx, opration) {
    const response = await request.post('/api/doctor/handleRecord', JSON.stringify({
        'recordIdx': recordIdx,
        'opration': opration
    }));
    return response.data;
}

// 已测试
// 设置预约参数
export async function setAppointmentParamsService(patientNum) {
    const response = await request.get('/api/doctor/setAppointmentParams', {
        params: {
            'patientNum': patientNum
        }
    });
    return response.data;
}

// 已测试
// 增加可预约时间段
export async function addDoctorTimeLineService(timeId) {
    const response = await request.get('/api/doctor/addDoctorTimeLine', {
        params: { 'timeId': timeId }
    });
    return response.data; // 或根据需要返回处理过的数据
}

// 已测试
// 删除可预约时间段
export async function deleteDoctorTimeLineService(timeId) {
    const response = await request.get('/api/doctor/deleteDoctorTimeLine', {
        params: { 'timeId': timeId }
    });
    return response.data; // 或根据需要返回处理过的数据
}

/* 管理员功能接口 */
// 已测试
// TODO: 新增权限有问题
// 添加医生
export async function addDoctorService(doctorInfo) {
    const response = await request.post('/api/admin/addDoctor', doctorInfo);
    return response.data;
}

// 已测试
// 删除医生
export async function deleteDoctorService(doctorId) {
    const response = await request.post('/api/admin/deleteDoctor', JSON.stringify({
        'doctorId': doctorId
    }));
    return response.data;
}

// 已测试
// 设置医生权限
export async function setDoctorAuthorityService(doctorId, refuseAppointment, modifyInfo) {
    const response = await request.post('/api/admin/setDoctorAuthority', JSON.stringify({
        'doctorId': doctorId,
        'refuseAppointment': refuseAppointment,
        'modifyInfo': modifyInfo
    }));
    return response.data;
}