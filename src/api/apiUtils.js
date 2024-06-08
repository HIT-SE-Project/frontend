import {
    getDoctorListService, getTimeTableService,
    getUserInfoService, getUserRecordListService,
    getDoctorInfoService, getDoctorRecordListService,
} from '@/api/api.js';
import { useCommonStore } from '@/stores/common.js'
import { useDoctorStore } from '@/stores/doctor.js'
import { useUserStore } from '@/stores/user.js'

// 数据仓库
const commonStore = useCommonStore();
const doctorStore = useDoctorStore();
const userStore = useUserStore();

/* common仓库 */
export const getDoctorList = async function () {
    let data = await getDoctorListService();
    if (data.data.code == 200)
        commonStore.setDoctorList(data.data.data);
}

export const getTimeTable = async function () {
    let data = await getTimeTableService();
    if (data.data.code == 200)
        commonStore.setTimeTable(data.data.data);
}

/* doctor仓库 */
export const getDoctorInfo = async function () {
    let data = await getDoctorInfoService();
    doctorStore.setDoctorInfo(data.data.data);
}

export const getDoctorRecordList = async function () {
    let data = await getDoctorRecordListService();
    doctorStore.setRecordList(data.data.data);
}


/* user仓库 */
export const getUserInfo = async function () {
    let data = await getUserInfoService();
    if (data.data.code == 200)
        userStore.setUserInfo(data.data.data);
}

export const getUserRecordList = async function () {
    let data = await getUserRecordListService();
    if (data.data.code == 200)
        userStore.setRecordList(data.data.data);
}
