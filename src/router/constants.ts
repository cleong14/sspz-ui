export enum RouteIds {
  ROOT = 'root',
  PROTECTED = 'app',
  DASHBOARD = 'dashboard',
  PROJECTS = 'projects',
  PROJECT_DETAIL = 'project-detail',
  PROJECT_EDIT = 'project-edit',
  CONTROLS = 'controls',
  CONTROL_DETAIL = 'control-detail',
  TOOLS = 'tools',
  SETTINGS = 'settings',
  AUTH = 'auth',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum RouteNames {
  DASHBOARD = 'Dashboard',
  PROJECTS = 'Projects',
  CONTROLS = 'Control Catalog',
  TOOLS = 'Tool Library',
  SETTINGS = 'Settings',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
}

export enum Routes {
  ROOT = '/',
  DASHBOARD = `/${RouteIds.PROTECTED}`,
  PROJECTS = `/${RouteIds.PROTECTED}/${RouteIds.PROJECTS}`,
  PROJECT_DETAIL = `/${RouteIds.PROTECTED}/${RouteIds.PROJECTS}/:id`,
  PROJECT_EDIT = `/${RouteIds.PROTECTED}/${RouteIds.PROJECTS}/:id/edit`,
  CONTROLS = `/${RouteIds.PROTECTED}/${RouteIds.CONTROLS}`,
  CONTROL_DETAIL = `/${RouteIds.PROTECTED}/${RouteIds.CONTROLS}/:id`,
  TOOLS = `/${RouteIds.PROTECTED}/${RouteIds.TOOLS}`,
  SETTINGS = `/${RouteIds.PROTECTED}/${RouteIds.SETTINGS}`,
  AUTH = `/${RouteIds.AUTH}/*`,
  AUTH_LOGIN = `/${RouteIds.AUTH}/${RouteIds.LOGIN}`,
  AUTH_LOGOUT = `/${RouteIds.AUTH}/${RouteIds.LOGOUT}`,
}
