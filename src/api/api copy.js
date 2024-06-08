import request from '@/utils/request.js'

/* 通用接口 */
// 登陆
export function loginService(loginData) {
    const formData = new FormData();
    for (const key in loginData) {
        formData.append(key, loginData[key]);
    }

    return request.post('/api/login', loginData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}


// 退出登陆
export function logoutService() {
    return request.get('/api/logout')
};

// 注册
export function registerService(registerData) {
    // 直接将registerData作为请求的数据，不需要序列化
    return request.post('/api/register', registerData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


// 获取医生列表
export function getDoctorListService() {
    return request.get('/api/doctor/getDoctorList')
};

// 获取时间表
export function getTimeTableService() {
    return request.get('/api/doctor/getTimeTable')
};


/* 用户功能接口 */
// 获取用户个人信息
export function getUserInfoService() {
    return request.get('/api/user/getUserInfo')
};

// 更新用户个人信息
export function updateUserInfoService(userInfo) {
    return request.post('/api/user/updateUserInfo', JSON.stringify({
        'userId': userInfo.userId,
        'name': userInfo.name,
        'gender': userInfo.gender,
        'age': userInfo.age,
        'address': userInfo.address,
        'tel': userInfo.tel,
        'identification': userInfo.identification,
        'image': userInfo.image,
    }));
}


// 获取用户预约记录
export function getUserRecordListService() {
    return request.get('/api/user/getRecordList')
};


/* 医生功能接口 */
// 获取医生个人信息
export function getDoctorInfoService() {
    return request.get('/api/doctor/getDoctorInfo')
};

// 更新医生个人信息
export function updateDoctorInfoService(doctorInfo) {
    console.log("更新！1")
    doctorInfo = doctorInfo.value;
    console.log("更新！")
    return request.post('/api/doctor/updateDoctorInfo', JSON.stringify({
        'doctorId': doctorInfo.doctorId,
        'name': doctorInfo.name,
        'department': doctorInfo.department,
        'title': doctorInfo.title,
        'profile': doctorInfo.profile,
        'image': doctorInfo.image,
    }));
}

// 获取医生预约记录
export function getDoctorRecordListService() {
    return request.get('/api/doctor/getRecordList')
};

// 获取医生可预约状况
export function getAppointmentStatusService(doctorId, date) {
    return request.get('/api/doctor/getAppointmentStatus',
        {
            params: {
                'doctorId': doctorId,
                'date': date
            }
        })
};

// 预约医生
export function doctorAppointmentService(appointmentInfo) {
    return request.post('/api/doctor/doctorAppointment', JSON.stringify({
        'doctorId': appointmentInfo.doctorId,
        'date': appointmentInfo.date,
        'timeId': appointmentInfo.timeId,
    }));
}

// 处理预约记录
export function handleRecordService(recordIdx, opration) {
    return request.post('/api/doctor/handleRecord', JSON.stringify({
        'recordIdx': recordIdx,
        'opration': opration
    }));
}

// 设置预约参数
export function setAppointmentParamsService(patientNum) {
    return request.get('/api/doctor/setAppointmentParams',
        {
            params: {
                'patientNum': patientNum
            }
        })
};

// 增加可预约时间段
export async function addDoctorTimeLineService(timeId) {
    const response = await request.get('/api/doctor/addDoctorTimeLine', {
        params: { 'timeId': timeId }
    });
    return response; // 或根据需要返回处理过的数据
};

// 删除可预约时间段
export async function deleteDoctorTimeLineService(timeId) {
    const response = await request.get('/api/doctor/deleteDoctorTimeLine', {
        params: { 'timeId': timeId }
    });
    return response; // 或根据需要返回处理过的数据
};


/* 管理员功能接口 */
// 添加医生
export function addDoctorService(doctorInfo) {
    return request.post('/api/admin/addDoctor', doctorInfo);
}

// 删除医生
export function deleteDoctorService(doctorId) {
    return request.post('/api/admin/deleteDoctor', JSON.stringify({
        'doctorId': doctorId
    }));
}

// 设置医生权限
export function setDoctorAuthorityService(doctorId, refuseAppointment, modifyInfo) {
    return request.post('/api/admin/setDoctorAuthority', JSON.stringify({
        'doctorId': doctorId,
        'refuseAppointment': refuseAppointment,
        'modifyInfo': modifyInfo
    }));
}