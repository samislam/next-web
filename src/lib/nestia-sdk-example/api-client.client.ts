// 'use client'

// import Cookies from 'js-cookie'
// import { COOKIES } from '@/constants'
// import { functional } from '@YOUR-ORG/packageName'
// import { createMainApiIConnection, type MainApiIConnection } from './iconnection'

// async function fetchWithMainApiAuth(
//   input: Parameters<typeof fetch>[0],
//   init?: Parameters<typeof fetch>[1]
// ) {
//   const headers = new Headers(init?.headers)
//   const authToken = Cookies.get(COOKIES.MAIN_API__AUTH)

//   if (authToken) {
//     headers.set('authorization', `Bearer ${authToken}`)
//   }

//   return fetch(input, {
//     ...init,
//     headers,
//   })
// }

// export function getMainApiClient_client(): MainApiIConnection {
//   return createMainApiIConnection({
//     fetch: fetchWithMainApiAuth,
//   })
// }

// type MainApiClient<T> = T extends (
//   connection: MainApiIConnection,
//   ...args: infer TArgs
// ) => infer TReturn
//   ? (...args: TArgs) => TReturn
//   : T extends object
//     ? { [K in keyof T]: MainApiClient<T[K]> }
//     : T

// const mainApiClientProxyCache = new WeakMap<object, unknown>()

// /**
//  * Browser-side convenience wrapper around the generated Nestia API namespace.
//  *
//  * Use this in client components when you want the browser main API connection to be injected
//  * automatically.
//  */
// function createMainApiClient<T extends object>(target: T): MainApiClient<T> {
//   const cached = mainApiClientProxyCache.get(target)
//   if (cached) return cached as MainApiClient<T>

//   const proxy = new Proxy(target, {
//     get(currentTarget, property, receiver) {
//       const value = Reflect.get(currentTarget, property, receiver)

//       if (value && (typeof value === 'object' || typeof value === 'function')) {
//         return createMainApiClient(value as object)
//       }

//       return value
//     },
//     apply(currentTarget, _thisArg, argArray) {
//       const connection = getMainApiClient_client()
//       return Reflect.apply(currentTarget as CallableFunction, undefined, [connection, ...argArray])
//     },
//   })

//   mainApiClientProxyCache.set(target, proxy)
//   return proxy as MainApiClient<T>
// }

// export const mainApi = functional.api
// export const mainApiClient = createMainApiClient(functional.api)
