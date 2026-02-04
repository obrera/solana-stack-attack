declare module '@tanstack/router-core' {
  export interface FileRoutesByPath {}
  export interface FileRoutesById {}
  export interface Register {}

  export type AnyRoute = unknown
  export type AnyRouter = unknown
  export type AnyContext = unknown
  export type RouteConstraints = {
    TId: string
    TPath: string
    TFullPath: string
  }
  export type ResolveParams<T> = unknown
  export type FileBaseRouteOptions<
    TRegister = unknown,
    TParentRoute = unknown,
    TId = unknown,
    TPath = unknown,
    TSearchValidator = unknown,
    TParams = unknown,
    TLoaderDeps = unknown,
    TLoaderFn = unknown,
    TRouterContext = unknown,
    TRouteContextFn = unknown,
    TBeforeLoadFn = unknown,
    TRouteContext = unknown,
    TSSR = unknown,
    TMiddlewares = unknown,
    THandlers = unknown,
  > = unknown
  export type UpdatableRouteOptions<
    TParentRoute = unknown,
    TId = unknown,
    TFullPath = unknown,
    TParams = unknown,
    TSearchValidator = unknown,
    TLoaderFn = unknown,
    TLoaderDeps = unknown,
    TRouterContext = unknown,
    TRouteContextFn = unknown,
    TBeforeLoadFn = unknown,
  > = unknown
  export type Route<
    TRegister = unknown,
    TParentRoute = unknown,
    TPath = unknown,
    TFullPath = unknown,
    TFilePath = unknown,
    TId = unknown,
    TSearchValidator = unknown,
    TParams = unknown,
    TRouterContext = unknown,
    TRouteContextFn = unknown,
    TBeforeLoadFn = unknown,
    TLoaderDeps = unknown,
    TLoaderFn = unknown,
    TChildren = unknown,
    TContext = unknown,
    TSSR = unknown,
    TMiddlewares = unknown,
    THandlers = unknown,
  > = unknown
  export type LazyRouteOptions = unknown
  export type RegisterRoute = unknown
  export type RegisteredRouter = unknown
  export type RouteById<TRouteTree = unknown, TId = unknown> = unknown
  export type RouteIds<TRouteTree = unknown> = unknown
  export type RouteLoaderFn<
    TRegister = unknown,
    TParentRoute = unknown,
    TId = unknown,
    TParams = unknown,
    TLoaderDeps = unknown,
    TRouterContext = unknown,
    TRouteContextFn = unknown,
    TBeforeLoadFn = unknown,
  > = unknown
  export type Constrain<T = unknown, TConstraint = unknown> = T
  export type ConstrainLiteral<T = unknown, TConstraint = unknown> = T
}
