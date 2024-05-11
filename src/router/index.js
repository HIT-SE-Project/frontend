import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/Home/HomePage.vue';
import LoginPage from '@/views/Login/LoginPage.vue';
import UserDashboard from '@/views/User/UserDashboard.vue';
import AdminDashboard from '@/views/Admin/AdminDashboard.vue';
import DoctorDashboard from '@/views/Doctor/DoctorDashboard.vue';

const router = createRouter({
  history: createWebHistory({
    base: import.meta.env.BASE_URL
  }),
  routes: [
    { path: '/', component: HomePage },
    { path: '/home', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/user', component: UserDashboard },
    { path: '/admin', component: AdminDashboard },
    { path: '/doctor', component: DoctorDashboard },
  ]
});

export default router;
