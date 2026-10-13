//import {useRouter} from "next/navigation"
import Link from "next/link"

const Navbar = () => {

    // const router = useRouter()


  return (
    <header className="flex w-full border-b">
      <nav className="bg-mauve-950 text-white flex items-center justify-between w-full px-5">
        <h1 className="text-2xl font-semibold py-3">YourDesk</h1>
        <ul className="hidden gap-3 md:flex">
          <li className="cursor-pointer"><Link href={"/login"}>login</Link></li>
          <li className="cursor-pointer"><Link href={"/register"}>register</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar