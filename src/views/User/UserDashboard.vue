<script setup>
import TabBar from './components/TabBar.vue';

</script>


<template>
    <div class="user-dashboard-container">
        <div class="tab-bar-container">
            <TabBar></TabBar>
        </div>

        <div class="user-main-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<style scoped>
.user-dashboard-container {
    height: 100%;
    width: 100%;
}

.tab-bar-container {
    height: 70px;
    width: 100%;
}


.user-main-container {
    height: calc(100% - 70px);
    width: 100%;
}
</style>