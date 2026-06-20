import { createRouter, createWebHistory } from 'vue-router';
import LandingView from './views/LandingView.vue';
import BlogView from './views/BlogView.vue';
import BlogDetailView from './views/BlogDetailView.vue';
import ProgramDetailView from './views/ProgramDetailView.vue';
import GalleryView from './views/GalleryView.vue';
import GalleryDetailView from './views/GalleryDetailView.vue';
import TestimonialsView from './views/TestimonialsView.vue';
import LoginView from './views/LoginView.vue';
import AdminView from './views/AdminView.vue';
import OfferView from './views/OfferView.vue';
import SuperAdminRecoveryView from './views/SuperAdminRecoveryView.vue';
import { api } from './api.js';
import { updateRouteSeo } from './seo.js';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 72, behavior: 'smooth' };
    return { top: 0 };
  },
  routes: [
    { path: '/', component: LandingView },
    { path: '/about', component: () => import('./views/AboutView.vue') },
    { path: '/services', component: () => import('./views/ServicesView.vue') },
    { path: '/programs', component: () => import('./views/ProgramsView.vue') },
    { path: '/blog', component: BlogView },
    { path: '/blog/:slug', component: BlogDetailView },
    { path: '/program/:slug', component: ProgramDetailView },
    { path: '/gallery', component: GalleryView },
    { path: '/gallery/:slug', component: GalleryDetailView },
    { path: '/testimonials', component: TestimonialsView },
    { path: '/penawaran', component: OfferView },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/superadmin', component: SuperAdminRecoveryView, meta: { guest: true } },
    { path: '/admin', component: AdminView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  try {
    await api('/auth/me');
    return true;
  } catch {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

router.afterEach((to) => {
  updateRouteSeo(to.path);
});

export default router;
