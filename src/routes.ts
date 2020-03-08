import {ItemStatusPage} from "./item-status-page";
import {OverviewPage} from "./overview-page";

type RouteName = "itemStatus" | "overview";

export interface IRoute {
  name: RouteName;
  displayIndex: number;
  cssClass: string;
  path: string,
  menuImg: string
  component;
}

export const routes: IRoute[] = [
  {
    name: 'itemStatus',
    path: '/item_status',
    menuImg: '/menu-item-status.svg',
    cssClass: 'item-status',
    displayIndex: 1,
    component: ItemStatusPage
  },
  { // must be last
    name: 'overview',
    path: '/',
    menuImg: '/menu-overview.svg',
    cssClass: 'overview',
    displayIndex: 0,
    component: OverviewPage
  }
];


export function getCurrentRoute(): IRoute {
  return routes.find(r => r.path == window.location.hash.slice(1)) || routes[routes.length - 1];
}

export function getRoute(name: RouteName): IRoute {
  return routes.find(r => r.name == name);
}
