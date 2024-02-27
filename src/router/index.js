import Browse from '../views/Browse.vue';
import StacBrowser from "@/StacBrowser.vue";
import ListProjectsView from "@/_Hub/views/ListProjectsView.vue";
import Search from "@/views/Search.vue";
import Home from "@/views/Home.vue";
import LoginView from "@/_Hub/views/LoginView.vue";

export function getRoutes() {
  let routes = [];

  routes = [
     {
      path: "/login",
      name:"Login",
      component: LoginView,
    },
    {
      path: "/",
      name:"Home",
      component: Home,
    },

    {
      path: "/search/*",
      name: "Search",
      component: Search
    },
    {
      path: "/stac/*",
      component: StacBrowser,
      name:"Stac",
      children: [
        {
          path: "/",
          name: "FeatureItems",
          component: Browse
        }
      ]
    },
    {
      path: "/*",
      name: "DynamicListSTAC",
      component: ListProjectsView,
    },
  ];
  return routes;
}

export default getRoutes;

