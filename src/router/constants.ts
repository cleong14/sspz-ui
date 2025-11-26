export enum RouteIds {
  ROOT = 'root',
  PROTECTED = 'app',
  DASHBOARD = 'dashboard',
  AUTH = 'auth',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SSP_GENERATOR = 'ssp-generator',
}

export enum RouteNames {
  DASHBOARD = 'Dashboard',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  SSP_GENERATOR = 'SSP Generator',
}

export enum Routes {
  ROOT = '/',
  DASHBOARD = `/${RouteIds.PROTECTED}`,
  AUTH = `/${RouteIds.AUTH}/*`,
  AUTH_LOGIN = `/${RouteIds.AUTH}/${RouteIds.LOGIN}`,
  AUTH_LOGOUT = `/${RouteIds.AUTH}/${RouteIds.LOGOUT}`,
  SSP_GENERATOR = `/${RouteIds.SSP_GENERATOR}`,
}
