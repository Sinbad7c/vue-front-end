import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Checkout from './components/Checkout.vue';

// Define routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/checkout', name: 'Checkout', component: Checkout },
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Create app and use router
const app = createApp(App);
app.use(router);
app.mount('#app');
