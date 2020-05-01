import Vue from "vue";
import VueRouter from "vue-router";
import Upload from "../views/Upload.vue";
import Search from "../views/Search.vue";
import Embed from "../views/Embed.vue";
import Test from "../views/Test.vue";
import Insight from "../views/Insight.vue";
import UserManagement from "../views/UserManagement.vue";
import Report from "../views/Report.vue";
import Login from "../views/Login.vue";
import NotFound from "../views/NotFound.vue";
import Comments from "../views/Comments.vue";

import store from "../store/index";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Search",
    component: Search,
    meta: {
      onlyAdmin: false,
    },
  },
  {
    path: "/upload",
    name: "upload",
    component: Upload,
    meta: {
      onlyAdmin: true,
    },
  },
  {
    path: "/comments/:vid",
    name: "Comments",
    component: Comments,
    meta: {
      onlyAdmin: false,
    },
  },
  {
    path: "/embed/:vid/:uid",
    name: "Embed",
    component: Embed,
  },
  // {
  //   path: "/embed",
  //   name: "Embed",
  //   component: Embed
  // },

  {
    path: "/insight",
    name: "Insight",
    component: Insight,
    meta: {
      onlyAdmin: true,
    },
  },
  {
    path: "/userManagement",
    name: "UserManagement",
    component: UserManagement,
    meta: {
      onlyAdmin: true,
    },
  },
  {
    path: "/report",
    name: "Report",
    component: Report,
    meta: {
      onlyAdmin: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      hasAuth: true,
    },
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
  },
  { path: "/404", component: NotFound },
  { path: "*", redirect: "/404" },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  let { is_logged, role } = store.getters.getUser;

  if (to.matched.some((record) => record.meta.hasAuth)) {
    if (is_logged) {
      next("/");
      return;
    }
    next();
  }

  if (to.matched.some((record) => record.meta.onlyAdmin)) {
    if (is_logged && role == "admin") {
      next();
      return;
    }
    next("/");
  } else {
    next();
  }
});

export default router;
