import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              {/* TODO: 用户需要替换为自己的 Logo */}
              <BookOpen className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                Web3 Tushan University
              </span>
              <span className="text-xs text-gray-500">web3 涂山大学</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              首页
            </Link>
            <Link
              href="/market"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              课程市场
            </Link>
            <Link
              href="/create-course"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              创建课程
            </Link>
            <Link
              href="/exchange"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              兑换中心
            </Link>
            <Link
              href="/aave"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              理财
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              个人中心
            </Link>
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ConnectButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              首页
            </Link>
            <Link
              href="/market"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              课程市场
            </Link>
            <Link
              href="/create-course"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              创建课程
            </Link>
            <Link
              href="/exchange"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              兑换中心
            </Link>
            <Link
              href="/aave"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              理财
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              个人中心
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
