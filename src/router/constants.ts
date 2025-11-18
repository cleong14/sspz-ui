export enum RouteIds {
  ROOT = 'root',
  PROTECTED = 'app',
  DASHBOARD = 'dashboard',
  SSP_GENERATOR = 'ssp-generator',
  AUTH = 'auth',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum RouteNames {
  DASHBOARD = 'Dashboard',
  SSP_GENERATOR = 'SSP Generator',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
}

export enum Routes {
  ROOT = '/',
  DASHBOARD = `/${RouteIds.PROTECTED}`,
  SSP_GENERATOR = `/${RouteIds.PROTECTED}/${RouteIds.SSP_GENERATOR}`,
  AUTH = `/${RouteIds.AUTH}/*`,
  AUTH_LOGIN = `/${RouteIds.AUTH}/${RouteIds.LOGIN}`,
  AUTH_LOGOUT = `/${RouteIds.AUTH}/${RouteIds.LOGOUT}`,
}
