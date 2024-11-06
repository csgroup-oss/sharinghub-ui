import Browse from '../views/Browse.vue';
import StacBrowser from '@/StacBrowser.vue';
import ListProjectsView from '@/_Hub/views/ListProjectsView.vue';
import Search from '@/views/Search.vue';
import Home from '@/views/Home.vue';
import LoginView from '@/_Hub/views/LoginView.vue';
import {get} from '@/_Hub/tools/https';
import {CONFIG_URL} from '@/_Hub/Endpoint';


export const getServerConfig = () => {
  return get(CONFIG_URL).then((response) => {
    if (response.data) {
      return response.data;
    }
  });
};

export function getRoutes(config = {}) {
  let routes = [];

  routes = [

      {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/search/*',
      name: 'Search',
      component: Search
    }
  ];

  const items_routes = [
    {
      path: '/*',
      component: StacBrowser,
      name: 'Stac',
      children: [
        {
          path: '/',
          name: 'FeatureItems',
          component: Browse
        }
      ]
    }];

  const {provideConfig : {categories}} = config;

  if (categories){
    const _dynamicRoutes = Object.keys(categories).map((e) =>({
      path: '/'.concat(e),
      meta: { category : e },
      name: e.toUpperCase().concat('_DynamicListSTAC'),
      component: ListProjectsView
    }));
    routes = [...routes, ..._dynamicRoutes];
  }

  routes = [...routes, ...items_routes];

  return routes;
}

export default getRoutes;
