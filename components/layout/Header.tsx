import Link from 'next/link'
import { Users, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Political CRM</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Начало
            </Link>
            <Link 
              href="/directory" 
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Картотека
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
