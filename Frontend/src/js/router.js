import { Store } from './store.js';
import { renderNavbar } from './components/navbar.js';
import { renderLandingPage } from './pages/landing.js';
import { renderMapPage } from './pages/mapPage.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderProfilePage } from './pages/profile.js';
import { renderDashboardPage } from './pages/dashboard.js';

const routes = {
  '/': { render: renderLandingPage, public: true },
  '/map': { render: renderMapPage, public: true },
  '/login': { render: renderLoginPage, public: true },
  '/register': { render: renderRegisterPage, public: true },
  '/profile': { render: renderProfilePage, public: false },
  '/dashboard': { render: renderDashboardPage, public: false, operatorOnly: true },
};

export const Router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  navigate(path) {
    window.location.hash = `#${path}`;
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = routes[hash] || routes['/'];
    const container = document.getElementById('app-container');

    // Route Protection Guard
    if (!route.public && !Store.isLoggedIn()) {
      this.navigate('/login');
      return;
    }

    if (route.operatorOnly && !Store.isOperator()) {
      alert("Akses ditolak. Halaman ini hanya untuk Operator.");
      this.navigate('/map');
      return;
    }

    renderNavbar();
    route.render(container);
  }
};