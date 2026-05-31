// import 'server-only'

// import { COOKIES } from '@/constants'
// import { headers, cookies } from 'next/headers'
// import { functional } from '@YOUR-ORG/packageName'
// import { createMainApiIConnection, type MainApiIConnection } from './iconnection'

// /**
//  * Builds a request-scoped main API connection for server code.
//  *
//  * The connection inherits the current request's user-agent and auth cookie so proxied calls from
//  * the Next.js app to the backend API preserve caller context.
//  */
// export async function getMainApiClient_server(): Promise<MainApiIConnection> {
//   const requestHeaders = await headers()
//   const cookieStore = await cookies()
//   const userAgent = requestHeaders.get('user-agent') ?? undefined
//   const authToken = cookieStore.get(COOKIES.MAIN_API__AUTH)?.value

//   return createMainApiIConnection({
//     headers: {
//       ...(userAgent ? { 'x-client-user-agent': userAgent } : {}),
//       ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
//     },
//   })
// }

// type MainApiServer<T> = T extends (
//   connection: MainApiIConnection,
//   ...args: infer TArgs
// ) => infer TReturn
//   ? (...args: TArgs) => TReturn
//   : T extends object
//     ? { [K in keyof T]: MainApiServer<T[K]> }
//     : T

// const mainApiServerProxyCache = new WeakMap<object, unknown>()

// /**
//  * Wraps the generated Nestia route tree so each invoked leaf function automatically receives the
//  * server-side main API connection as its first argument.
//  *
//  * This lets callers use `await mainApiServer.v1.auth.login(body)` instead of manually resolving and
//  * threading `IConnection` for every server-side request.
//  */
// function createMainApiServer<T extends object>(target: T): MainApiServer<T> {
//   const cached = mainApiServerProxyCache.get(target)
//   if (cached) return cached as MainApiServer<T>

//   const proxy = new Proxy(target, {
//     get(currentTarget, property, receiver) {
//       const value = Reflect.get(currentTarget, property, receiver)

//       if (value && (typeof value === 'object' || typeof value === 'function')) {
//         return createMainApiServer(value as object)
//       }

//       return value
//     },
//     async apply(currentTarget, _thisArg, argArray) {
//       const connection = await getMainApiClient_server()
//       return Reflect.apply(currentTarget as CallableFunction, undefined, [connection, ...argArray])
//     },
//   })

//   mainApiServerProxyCache.set(target, proxy)
//   return proxy as MainApiServer<T>
// }

// /**
//  * Server-side convenience wrapper around the generated Nestia API namespace.
//  *
//  * Use this in request-bound server code when you want the current request's backend connection to
//  * be injected automatically.
//  */
// export const mainApiServer = createMainApiServer(functional.api)
