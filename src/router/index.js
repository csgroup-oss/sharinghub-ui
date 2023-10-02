import Browse from '../views/Browse.vue';
import ListModelView from "@/_Hub/views/ListModelView.vue";
import StacBrowser from "@/StacBrowser.vue";
import ListDatasetView from "@/_Hub/views/ListDatasetView.vue";
import ListProcessorView from "@/_Hub/views/ListProcessorView.vue";
import SelectDataSource from "@/views/SelectDataSource.vue";

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


export function getRoutes_2(config) {
  let routes = [];

  routes = [
    {
      path: "/",
      name: "DataSource",
      component: SelectDataSource,
    },
    {
      path: "/processors",
      name: "listProcessor",
      component: ListProcessorView,
    },
    {
      path: "/models",
      name: "listModels",
      component: ListModelView,
    },
    {
      path: "/datasets",
      name: "listDataset",
      component: ListDatasetView,
    },
    {
      path: "/metadata",
      name: "model",
      component: StacBrowser,
      children: [
        {
          path: "/",
          component: Browse
        }
      ]
    }
  ];
  return routes;
}

export default getRoutes;

