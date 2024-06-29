/*
* axios请求基本配置、请求拦截器、相应拦截器
* 创建请求实例 
*/

import axios from 'axios';
import qs from 'qs';

// 解决跨域问题，代理设置在`vite.config.js`
// const baseURL = '/api';

const instance = axios.create({
    // baseURL: baseURL, // 替换为你的后端API基础URL
    baseURL: 'http://114.116.250.107:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,  // 允许发送凭证
});

// 添加请求拦截器
instance.interceptors.request.use(
    config => {
        if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded;charset=UTF-8') {
            config.data = qs.stringify(config.data);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default instance;