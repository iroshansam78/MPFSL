import Spinner from '../ui/Spinner.jsx'

function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center text-muted">
      <Spinner className="size-8" label="Loading" />
    </div>
  )
}

export default FullPageSpinner
