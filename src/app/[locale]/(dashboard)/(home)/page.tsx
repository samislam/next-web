import { getTranslate } from '@/lib/tolgee/tolgee-server'
import { HomeDescription } from '../../composables/home-description'
import { DataTableExample } from './composables/datatable-example'

const Page = async () => {
  const t = await getTranslate()

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-bold">{t('@t<home-title>')}</h1>
        <HomeDescription />
      </div>

      {/* Delete this once you have real pages — it exists to show how the datatable is wired. */}
      <DataTableExample />
    </div>
  )
}
export default Page
