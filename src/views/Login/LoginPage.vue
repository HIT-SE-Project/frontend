<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { loginService, registerService } from '@/api/api';

const router = useRouter(); // 获取路由器实例

// 同意条款
const isAgreed = ref(false)
const dialogVisible = ref(false)


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
        if (!isAgreed.value) {
            ElMessage({
                message: '请先同意用户条款',
                type: 'error',
            });
        }
        else {
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
            setTimeout(() => {
                window.location.reload();
            }, 500);
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
        <div class="card-warpper border" v-if="pageFlag == 1">
            <div class="login-page-card border shadow">
                <div class="form-area">
                    <div class="heading">
                        <span>登 陆</span>
                    </div>
                    <div class="form-container">
                        <div class="login-form ">
                            <el-form :model="form" ref="loginForm" :rules="rules" label-width="50px">
                                <el-form-item label="账号" prop="account">
                                    <el-input v-model="form.account" maxlength="16" placeholder="请输入账号"
                                        style="width: 240px"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password" style="color: #000;">
                                    <el-input type="password" v-model="form.password" maxlength="20" placeholder="请输入密码"
                                        style="width: 240px"></el-input>
                                </el-form-item>

                                <div style="margin: -10px 0 10px 50px">
                                    <el-checkbox v-model="isAgreed"></el-checkbox>
                                    我已阅读
                                    <div @click="dialogVisible = true; isAgreed = true"
                                        style="cursor: pointer; color: #409eff; text-decoration: underline; display: inline;">
                                        <span>《用户条款》</span>
                                    </div>
                                </div>
                                <el-form-item>
                                    <el-button type="primary" @click="onSubmit" style="width: 150px">登录</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="nav">
                        没有账号？
                        <span @click="pageFlag = 2" style="cursor: pointer; color: #409eff;">
                            <el-icon style="vertical-align: middle">
                                <Promotion />
                            </el-icon>去注册
                        </span>
                    </div>
                </div>
                <div class="svg-area">
                    <div class="login-svg">
                    </div>
                </div>
            </div>
        </div>


        <!-- 注册 -->
        <div class="card-warpper border" v-if="pageFlag == 2">
            <div class="register-page-card border shadow">
                <div class="svg-area">
                    <div class="register-svg">
                    </div>
                </div>
                <div class="form-area">
                    <div class="heading">
                        <span>注 册</span>
                    </div>
                    <div class="form-container">
                        <div class="login-form ">
                            <el-form :model="form" ref="loginForm" :rules="rules" label-width="50px">
                                <el-form-item label="账号" prop="account">
                                    <el-input v-model="form.account" maxlength="16" placeholder="请输入账号"
                                        style="width: 240px"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password" style="color: #000;">
                                    <el-input type="password" v-model="form.password" maxlength="20" placeholder="请输入密码"
                                        style="width: 240px"></el-input>
                                </el-form-item>

                                <div style="margin: -10px 0 10px 50px">
                                    <el-checkbox v-model="isAgreed"></el-checkbox>
                                    我已阅读
                                    <div @click="dialogVisible = true; isAgreed = true"
                                        style="cursor: pointer; color: #409eff; text-decoration: underline; display: inline;">
                                        <span>《用户条款》</span>
                                    </div>
                                </div>
                                <el-form-item>
                                    <el-button type="primary" @click="onSubmit" style="width: 150px">注册</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <div class="nav">
                        已有账号？
                        <span @click="pageFlag = 1" style="cursor: pointer; color: #409eff;">
                            <el-icon style="vertical-align: middle">
                                <Promotion />
                            </el-icon>去登录
                        </span>
                    </div>
                </div>

            </div>
        </div>
    </div>



    <!-- Element Plus Dialog 组件 -->
    <el-dialog v-model="dialogVisible" title="用户条款" width="500">
        <span>此网站仅用作软件工程大项目。</span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">关闭</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>



<style scoped>
.login-page-container {
    height: 100%;
    width: 100%;
    background: no-repeat url('@/assets/wallhaven-43l8d3.jpg');
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    /* 确保容器是相对定位的 */
    overflow: hidden;
    /* 防止模糊效果溢出容器边界 */
}

.login-page-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    z-index: 1;
    filter: blur(5px);
    transition: filter 0.3s;
    /* 为模糊效果添加过渡动画 */
}

.card-warpper {
    background-color: #d1f3fc;
    width: 810px;
    height: 490px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease-in-out;
    z-index: 2;

}

.card-warpper:hover {
    box-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;
}




.login-page-card {
    /* background: linear-gradient(to top right, #fafcfe 0%, #eef6fa 60%, #e8d7fc 90%, #eef6fa 100%); */
    background: linear-gradient(to top right, #fafcfe 0%, #dde9f5 60%, #5cd4e4 90%, #43cddf 100%);

    color: #000;
    width: 800px;
    height: 480px;
    display: grid;
    grid-template-columns: 4fr 6fr;

    .form-area {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .heading {
            font-size: 30px;
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
        }
    }
}

.register-page-card {
    background: linear-gradient(to top left, #fafcfe 0%, #eef6fa 60%, #e8d7fc 90%, #eef6fa 100%);
    color: #000;
    width: 800px;
    height: 480px;
    display: grid;
    grid-template-columns: 6fr 4fr;


    .form-area {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-right: 20px;

        .heading {
            font-size: 30px;
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
        }
    }
}



.svg-area {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-svg {
        height: 100%;
        width: 100%;
        background-size: auto;
        background-image: url('@/assets/login_svg.svg');
        background-position: 50% 50%;
        background-repeat: no-repeat;
    }


    .register-svg {
        height: 100%;
        width: 100%;
        background-size: auto;
        background-image: url('@/assets/register_svg.svg');
        background-position: 50% 50%;
        background-repeat: no-repeat;

    }
}


:deep(.el-form-item__label) {
    color: #000 !important;
}
</style>