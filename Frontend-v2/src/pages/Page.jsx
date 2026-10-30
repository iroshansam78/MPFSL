import PageHeader from '../components/layout/PageHeader/PageHeader.jsx'
import { findPage } from '../data/pages.js'

// An inner page: its banner (breadcrumbs + h1, from data/pages.js) followed by its sections.
function Page({ path, children }) {
  return (
    <>
      <PageHeader page={findPage(path)} />
      {children}
    </>
  )
}

export default Page
