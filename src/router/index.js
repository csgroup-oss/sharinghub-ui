import Browse from '../views/Browse.vue';
import StacBrowser from "@/StacBrowser.vue";
import ListProjectsView from "@/_Hub/views/ListProjectsView.vue";
import ListProjectsSearchView from "@/_Hub/views/ListProjectsSearchView.vue";
import Search from "@/views/Search.vue";
import Home from "@/views/Home.vue";
import LoginView from "@/_Hub/views/LoginView.vue";
function getRoutes(config) {
  let routes = [];

  if (config.allowExternalAccess) {
    routes.push({
      path: "/external/(.*)",
      name: "browseExternal",
      component: Browse,
      props: route => {
        return {
          path: `/external/${route.params.pathMatch}`
        };
      }
    });
  }

  if (!config.catalogUrl) {
    routes.push({
      path: "/",
      name: "select",
      component: () => import("../views/SelectDataSource.vue")
    });
    routes.push({
      path: "/search/external/(.*)",
      name: "search",
      component: () => import("../views/Search.vue"),
      props: route => {
        return {
          loadParent: `/external/${route.params.pathMatch}`
        };
      }
    });
  } else {
    routes.push({
      path: "/search",
      name: "search",
      component: () => import("../views/Search.vue")
    });
  }

  routes.push({
    path: "/(.*)",
    name: "browse",
    component: Browse,
    props: route => {
      return {
        path: route.params.pathMatch
      };
    }
  });

  return routes;
}


export function getRoutes_2() {
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
      path: "/simple-search",
      name: "SimpleSearch",
      component: ListProjectsSearchView,
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

