import logoDark from '../../../assets/images/logo-dark.png'
import logoLight from '../../../assets/images/logo-light.png'

// Navy-lettered logo in light mode, white-lettered logo in dark mode.
function Logo({ className = 'h-11' }) {
  return (
    <span className="inline-flex">
      <img src={logoLight} alt="Modern Pentathlon Sri Lanka" className={`${className} w-auto dark:hidden`} />
      <img src={logoDark} alt="Modern Pentathlon Sri Lanka" className={`${className} hidden w-auto dark:block`} />
    </span>
  )
}

export default Logo
