<script setup>
import {
    getDoctorList
} from '@/api/apiUtils.js';
import {
    setDoctorAuthorityService, updateDoctorInfoService, addDoctorService, deleteDoctorService
} from '@/api/api.js';

import { useCommonStore } from '@/stores/common.js'
import { ElMessage } from 'element-plus';
import { computed, ref, reactive, onMounted } from 'vue'

const commonStore = useCommonStore();

onMounted(() => {
    getDoctorList();
});

// 对话框
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)

// 选中编辑的医生ID和信息
const selectedDoctorId = ref('');
const selectedDoctorInfo = computed(() => {
    const doctor = commonStore.doctorList.find(doctor => doctor.doctorId == selectedDoctorId.value);
    return doctor ? ref({ ...doctor }) : ref(null);
});



// 新增医生信息
const addInfoForm = ref(null);
const newDoctorInfoForm = reactive({
    account: '',
    password: '',
    name: '',
    department: '',
    title: '',
    profile: '',
    image: '',
    refuseAppointment: '',
    modifyInfo: '',
})

const rules = reactive({
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    department: [{ required: true, message: '请输入科室', trigger: 'blur' }],
    title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
    profile: [{ required: true, message: '请输入个人简介', trigger: 'blur' }],
    image: [{ required: true, message: '请输入头像URL', trigger: 'blur' }],
    refuseAppointment: [{ required: true, message: '请选择拒绝预约权限', trigger: 'change' }],
    modifyInfo: [{ required: true, message: '请选择修改参数权限', trigger: 'change' }],
});


// 提交新增医生
const handleAddSubmit = async () => {
    try {
        const valid = await addInfoForm.value.validate();
        if (valid) {
            const response = await addDoctorService(newDoctorInfoForm);
            console.log(response)
            if (response.code == 200) {
                ElMessage({
                    message: '添加成功',
                    type: 'success',
                });
                window.location.reload();
            } else {
                ElMessage({
                    message: '操作失败',
                    type: 'error',
                });
            }
        } else {
            ElMessage({
                message: '请输入对应信息',
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


// 提交编辑医生
function handleEditSubmit() {
    const doctorInfo = ref({
        doctorId: parseInt(selectedDoctorInfo.value._rawValue.doctorId),
        name: selectedDoctorInfo.value._rawValue.name,
        department: selectedDoctorInfo.value._rawValue.department,
        title: selectedDoctorInfo.value._rawValue.title,
        profile: selectedDoctorInfo.value._rawValue.profile,
        image: selectedDoctorInfo.value._rawValue.image
    });
    let response = updateDoctorInfoService(doctorInfo);
    response.then((value) => {
        if (value.code == 200) {
            ElMessage({
                message: '更新成功',
                type: 'success',
            });
            window.location.reload();
        } else {
            ElMessage({
                message: '更新失败',
                type: 'error',
            });
        }
    }).catch((error) => {
        console.error(error);
        ElMessage({
            message: '更新失败',
            type: 'error',
        });
    });
    setDoctorAuthorityService(parseInt(selectedDoctorInfo.value._rawValue.doctorId), parseInt(selectedDoctorInfo.value._rawValue.refuseAppointment), parseInt(selectedDoctorInfo.value._rawValue.modifyinfo))
}

// 删除医生
const handleDelete = async (doctorId) => {
    try {
        const response = await deleteDoctorService(parseInt(doctorId));
        if (response.code == 200) {
            ElMessage({
                message: '删除成功',
                type: 'success',
            });
            window.location.reload();
        } else {
            ElMessage({
                message: '删除失败',
                type: 'error',
            });
        }
    } catch (error) {
        console.error(error);
        ElMessage({
            message: '删除失败',
            type: 'error',
        });
    }
}


</script>

<template>
    <div class="management-panel-container">
        <div class="table-container border shadow">
            <el-table :data="commonStore.doctorList" style="width: 100%;"
                :header-cell-style="{ 'text-align': 'center', fontSize: '17px', background: '#f8f8f8', color: '#9eabb4' }"
                :cell-style="{ textAlign: 'center' }" :header-row-style="{ height: '45px', }"
                :row-style="{ height: '50px', fontSize: '16px' }">
                <el-table-column prop="doctorId" label="ID" width="120" />
                <el-table-column label="头像" width="160">
                    <template #default="scope">
                        <el-avatar shape="square" :size="120" :src="scope.row.image" />
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="department" label="科室" width="120" />
                <el-table-column prop="title" label="职称" width="120" />
                <el-table-column prop="profile" label="个人简介" />
                <el-table-column prop="" label="权限" width="200">
                    <template #default="scope">
                        <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 10px;">
                            <div>拒绝预约权限：
                                <el-tag v-if="scope.row.refuseAppointment == '1'" type="success">是</el-tag>
                                <el-tag v-if="scope.row.refuseAppointment == '0'" type="warning">否</el-tag>
                            </div>
                            <div>修改参数权限：
                                <el-tag v-if="scope.row.modifyinfo == '1'" type="success">是</el-tag>
                                <el-tag v-if="scope.row.modifyinfo == '0'" type="warning">否</el-tag>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="" label="操作" width="220">
                    <template #header>
                        <el-button type="warning" plain @click="addDialogVisible = true;">添加医生</el-button>
                    </template>
                    <template #default="scope">
                        <el-button type="primary"
                            @click="editDialogVisible = true; selectedDoctorId = scope.row.doctorId;">
                            <el-icon :size="20">
                                <Edit />
                            </el-icon>编辑
                        </el-button>

                        <el-popconfirm title="确定要删除吗？" confirm-button-text="确认" cancel-button-text="取消"
                            confirm-button-type="danger" :hide-after=10 @confirm="handleDelete(scope.row.doctorId)">
                            <template #reference>
                                <el-button type="danger">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 编辑 -->
        <el-dialog v-model="editDialogVisible" width="900" title="编辑医生信息">
            <div class="dialog">
                <div class="profile">
                    <div class="profile-form">
                        <div class="form-area">
                            <div class="form-item">
                                <div class="heading">
                                    姓名
                                </div>
                                <div class="content">
                                    <el-input v-model="selectedDoctorInfo.value.name" style="width: 420px"
                                        placeholder="请输入" />
                                </div>
                            </div>
                            <div class="form-item">
                                <div class="heading">
                                    科室
                                </div>
                                <div class="content">
                                    <el-input v-model="selectedDoctorInfo.value.department" style="width: 420px"
                                        placeholder="请输入" />
                                </div>
                            </div>
                            <div class="form-item">
                                <div class="heading">
                                    职称
                                </div>
                                <div class="content">
                                    <el-input v-model="selectedDoctorInfo.value.title" style="width: 420px"
                                        placeholder="请输入" />
                                </div>
                            </div>
                            <div class="form-item">
                                <div class="heading">
                                    个人简介
                                </div>
                                <div class="content">
                                    <el-input v-model="selectedDoctorInfo.value.profile" style="width: 420px"
                                        :autosize="{ minRows: 1, maxRows: 5 }" type="textarea" placeholder="请输入" />
                                </div>
                            </div>
                            <div class="form-item">
                                <div class="heading">
                                    头像URL
                                </div>
                                <div class="content">
                                    <el-input v-model="selectedDoctorInfo.value.image" style="width: 420px"
                                        placeholder="请输入正确的图片URL" />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="profile-picture">
                        <div class="heading">
                            头像
                        </div>
                        <img :src="selectedDoctorInfo.value.image" alt="请输入正确的图片URL">
                    </div>
                </div>
                <div class="permission-area">
                    <div class="form-item">
                        <div class="heading">
                            拒绝预约权限
                        </div>
                        <div class="content">
                            <el-radio-group v-model="selectedDoctorInfo.value.refuseAppointment" class="ml-4">
                                <el-radio value="1">是</el-radio>
                                <el-radio value="0">否</el-radio>
                            </el-radio-group>
                        </div>
                    </div>
                    <div class="form-item">
                        <div class="heading">
                            修改参数权限
                        </div>
                        <div class="content">
                            <el-radio-group v-model="selectedDoctorInfo.value.modifyinfo" class="ml-4">
                                <el-radio value="1">是</el-radio>
                                <el-radio value="0">否</el-radio>
                            </el-radio-group>
                        </div>

                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleEditSubmit()">
                        提交
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 增加 -->
        <el-dialog v-model="addDialogVisible" title="新增医生信息" width="900">
            <div class="dialog">
                <el-form :model="newDoctorInfoForm" ref="addInfoForm" style="max-width: 600px" :rules="rules">
                    <div class="account-area">
                        <div class="form-item">
                            <div class="heading">
                                账号
                            </div>
                            <div class="content">
                                <el-form-item prop="account">
                                    <el-input v-model="newDoctorInfoForm.account" style="width: 300px"
                                        placeholder="请输入" />
                                </el-form-item>

                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                密码
                            </div>
                            <div class="content">
                                <el-form-item prop="password">
                                    <el-input v-model="newDoctorInfoForm.password" style="width: 300px"
                                        placeholder="请输入" />
                                </el-form-item>
                            </div>
                        </div>
                    </div>
                    <div class="profile">
                        <div class="profile-form">
                            <div class="form-area">
                                <div class="form-item">
                                    <div class="heading">
                                        姓名
                                    </div>
                                    <div class="content">
                                        <el-form-item prop="name">
                                            <el-input v-model="newDoctorInfoForm.name" style="width: 420px"
                                                placeholder="请输入" />
                                        </el-form-item>
                                    </div>
                                </div>
                                <div class="form-item">
                                    <div class="heading">
                                        科室
                                    </div>
                                    <div class="content">
                                        <el-form-item prop="department">
                                            <el-input v-model="newDoctorInfoForm.department" style="width: 420px"
                                                placeholder="请输入" />
                                        </el-form-item>
                                    </div>
                                </div>
                                <div class="form-item">
                                    <div class="heading">
                                        职称
                                    </div>
                                    <div class="content">
                                        <el-form-item prop="title">
                                            <el-input v-model="newDoctorInfoForm.title" style="width: 420px"
                                                placeholder="请输入" />
                                        </el-form-item>
                                    </div>
                                </div>
                                <div class="form-item">
                                    <div class="heading">
                                        个人简介
                                    </div>
                                    <div class="content">
                                        <el-form-item prop="profile">
                                            <el-input v-model="newDoctorInfoForm.profile" style="width: 420px"
                                                :autosize="{ minRows: 1, maxRows: 5 }" type="textarea"
                                                placeholder="请输入" />
                                        </el-form-item>
                                    </div>
                                </div>
                                <div class="form-item">
                                    <div class="heading">
                                        头像URL
                                    </div>
                                    <div class="content">
                                        <el-form-item prop="image">
                                            <el-input v-model="newDoctorInfoForm.image" style="width: 420px"
                                                placeholder="请输入正确的图片URL" />
                                        </el-form-item>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="profile-picture">
                            <div class="heading">
                                照片
                            </div>
                            <img :src="newDoctorInfoForm.image" alt="请输入正确的图片URL">
                        </div>
                    </div>
                    <div class="permission-area">
                        <div class="form-item">
                            <div class="heading">
                                拒绝预约权限
                            </div>
                            <div class="content">
                                <el-form-item prop="refuseAppointment">
                                    <el-radio-group v-model="newDoctorInfoForm.refuseAppointment" class="ml-4">
                                        <el-radio value="1">是</el-radio>
                                        <el-radio value="0">否</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </div>
                        </div>
                        <div class="form-item">
                            <div class="heading">
                                修改参数权限
                            </div>
                            <div class="content">
                                <el-form-item prop="modifyInfo">
                                    <el-radio-group v-model="newDoctorInfoForm.modifyInfo" class="ml-4">
                                        <el-radio value="1">是</el-radio>
                                        <el-radio value="0">否</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </div>

                        </div>
                    </div>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-form-item>
                        <el-button @click="addDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleAddSubmit()">
                            提交
                        </el-button>
                    </el-form-item>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
.management-panel-container {
    height: 100%;
    min-width: 1400px;
    padding: 20px;
    background-color: #f5f6fa;
}

.table-container {
    height: 100%;
    width: 100%;
    background-color: #fff;
}

.dialog {
    .profile {
        display: grid;
        grid-template-columns: 7fr 3fr;
        width: 100%;
        background-color: #fff;
        padding: 20px;
        padding-top: 0;
    }

    .profile-picture {
        /* background-color: blue; */
        display: flex;
        /* justify-content: center; */
        /* align-items: center; */
        flex-direction: column;
    }

    .profile-picture img {
        height: 200px;
        width: 200px;
        border-radius: 12px
    }

    .title {
        font-size: 24px;
        font-weight: 700;
        padding-bottom: 10px;
        border-bottom: 1px solid #d0d7deb3;
    }

    .heading {
        margin-top: 15px;
        font-size: 18px;
        /* font-weight: 600; */
    }

    .account-area {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 20px;
        padding-top: 0;
        border-bottom: 1px solid #ebeef5;
        gap: 20px
    }

    .permission-area {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 20px;
        padding-top: 0;
        border-top: 1px solid #ebeef5;
        gap: 20px
    }
}
</style>