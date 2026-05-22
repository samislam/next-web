// import 'server-only'

// import axios from 'axios'
// import { COOKIES } from '@/constants'
// import { headers, cookies } from 'next/headers'
// import { clientEnv } from '@/server/client-env'
// import { getNestStarterAPIBackend } from '@/generated/orval/endpoints'

// export const getMainApiClient_server = async () => {
//   const requestHeaders = await headers()
//   const cookieStore = await cookies()
//   const userAgent = requestHeaders.get('user-agent') ?? undefined
//   const authCookieValue = cookieStore.get(COOKIES.MAIN_API__AUTH)?.value
//   const cookieHeader = authCookieValue
//     ? `${COOKIES.MAIN_API__AUTH}=${encodeURIComponent(authCookieValue)}`
//     : undefined

//   const axiosInstance = axios.create({
//     baseURL: clientEnv.NEXT_PUBLIC_MAIN_API_BASE_URL,
//     withCredentials: true,
//     headers: {
//       ...(userAgent ? { 'X-Client-User-Agent': userAgent } : null),
//       ...(cookieHeader ? { cookie: cookieHeader } : null),
//     },
//   })

//   return getNestStarterAPIBackend(axiosInstance)
// }
