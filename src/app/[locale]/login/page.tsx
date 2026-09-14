import { redirect } from 'next/navigation'
import { pageDefs } from '@/config/pages.config'

/** `/login` is the URL people type; the real page lives at `pageDefs.login.href`. */
const Page = () => redirect(pageDefs.login.href)

export default Page
