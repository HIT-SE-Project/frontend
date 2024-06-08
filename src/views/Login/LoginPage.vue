<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { loginService, registerService } from '@/api/api';

const router = useRouter(); // 获取路由器实例

// 1: 登陆  2: 注册
const pageFlag = ref(1);

const form = reactive({
    account: '',
    password: '',
});

const rules = {
    account: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { max: 16, message: '账号长度不可以超过16字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { max: 20, message: '密码长度不可以超过20字符', trigger: 'blur' },
    ],
};

const loginForm = ref(null);

const onSubmit = async () => {
    loginForm.value.validate(async (valid) => {
        if (valid) {
            try {
                if (pageFlag.value == 1) {
                    const value = await loginService(form);
                    handleLogin(value);
                } else if (pageFlag.value == 2) {
                    const response = await registerService(form);
                    if (response.code == 200) {
                        ElMessage({
                            message: '注册成功',
                            type: 'success',
                        });
                        const loginValue = await loginService(form);
                        handleLogin(loginValue);
                    } else if (response.code == 400 || response.code == 401) {
                        ElMessage({
                            message: '注册失败',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                ElMessage({
                    message: '操作失败',
                    type: 'error',
                });
                console.error(error);
            }
        } else {
            ElMessage({
                message: '请输入正确的账号和密码',
                type: 'error',
            });
            return false;
        }
    });
};


const handleLogin = (response) => {
    console.log(response)
    if (response.code == 200) {
        ElMessage({
            message: '登录成功',
            type: 'success',
        });
        if (response.data == 1) {
            router.push('/user');
        } else if (response.data == 2) {
            router.push('/doctor');
        } else if (response.data == 3) {
            router.push('/admin');
        }

    }
    else if (response.code == 400 || response.code == 401) {
        ElMessage({
            message: '用户名或密码错误',
            type: 'error',
        });
    }
}

</script>
<template>
    <div class="login-page-container">
        <!-- 登陆 -->
        <div class="login-page-card border shadow" v-if="pageFlag == 1">
            <div class="heading">
                <span>登 陆</span>
            </div>
            <div class="form-container">
                <div class="login-form ">
                    <el-form :model="form" ref="loginForm" :rules="rules" label-width="50px"
                        style="margin-left: -50px;">
                        <el-form-item label="账号" prop="account">
                            <el-input v-model="form.account" maxlength="16" placeholder="请输入账号"
                                style="width: 320px"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input type="password" v-model="form.password" maxlength="20" placeholder="请输入密码"
                                style="width: 320px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit" style="width: 320px">登录</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="nav">
                <span @click="pageFlag = 2">去注册</span>
            </div>
        </div>

        <!-- 注册 -->
        <div class="login-page-card border shadow" v-if="pageFlag == 2">
            <div class="heading">
                <span>注 册</span>
            </div>
            <div class="form-container">
                <div class="login-form ">
                    <el-form :model="form" ref="loginForm" :rules="rules" label-width="50px"
                        style="margin-left: -50px;">
                        <el-form-item label="账号" prop="account">
                            <el-input v-model="form.account" maxlength="16" placeholder="请输入账号"
                                style="width: 320px"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input type="password" v-model="form.password" maxlength="20" placeholder="请输入密码"
                                style="width: 320px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit" style="width: 320px">注册</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="nav">
                <span @click="pageFlag = 1">去登陆</span>
            </div>
        </div>
    </div>
</template>



<style scoped>
.login-page-container {
    height: 100%;
    width: 100%;
    background: no-repeat url('@/assets/loginBg.jpg');
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-page-card {
    width: 500px;
    height: 300px;
    background-color: #2b252561;
    backdrop-filter: blur(5px);
    display: flex;
    flex-direction: column;

    .heading {
        color: #fff;
        font-size: 26px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
    }

    .login-form {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nav {
        display: flex;
        align-items: center;
        justify-content: right;
        padding-right: 50px;
    }
}



:deep(.el-form-item__label) {
    color: #fff !important;
}
</style>