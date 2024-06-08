import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },

    { path: '/home', component: () => import('@/views/Home/HomePage.vue') },
    { path: '/login', component: () => import('@/views/Login/LoginPage.vue') },
    {
      path: '/user',
      component: () => import('@/views/User/UserDashboard.vue'),
      redirect: '/user/appointment',
      children: [
        { path: 'appointment', component: () => import('@/views/User/components/AppointmentPanel.vue') },
        { path: 'profile', component: () => import('@/views/User/components/PersonalInfoPanel.vue') },
        { path: 'test', component: () => import('@/views/User/test/ApiTest.vue') },
      ]
    },
    {
      path: '/admin',
      component: () => import('@/views/Admin/AdminDashboard.vue'),
      redirect: '/admin/panel',
      children: [
        { path: 'panel', component: () => import('@/views/Admin/components/ManagementPanel.vue') },
        { path: 'test', component: () => import('@/views/Admin/test/ApiTest.vue') },
      ]
    },
    {
      path: '/doctor',
      component: () => import('@/views/Doctor/DoctorDashboard.vue'),
      redirect: '/doctor/appointment',
      children: [
        { path: 'appointment', component: () => import('@/views/Doctor/components/AppointmentPanel.vue') },
        { path: 'profile', component: () => import('@/views/Doctor/components/PersonalInfoPanel.vue') },
        { path: 'test', component: () => import('@/views/Doctor/test/ApiTest.vue') },
      ]
    },
  ]
});

export default router;
