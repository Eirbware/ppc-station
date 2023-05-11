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
    },
    {
        path: '/ppc-choice',
        name: 'PPC Choice',
        component: () => import('./components/PPCChoice.vue')
    },
    {
        path: '/confirmation',
        name: 'Confirmation',
        component: () => import('./components/Confirmation.vue')
    },
    {
        path: '/end',
        name: 'End',
        component: () => import('./components/End.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;