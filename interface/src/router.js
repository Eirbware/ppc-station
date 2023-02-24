import {createRouter, createWebHashHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Start',
        component: () => import('./components/Greet.vue')
    },
    {
        path: '/badge-scan',
        name: 'Badge Scan',
        component: () => import('./components/Scan.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;