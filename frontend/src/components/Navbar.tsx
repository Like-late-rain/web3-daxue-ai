import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/market", label: "课程市场" },
    { href: "/create-course", label: "创建课程" },
    { href: "/exchange", label: "兑换中心" },
    { href: "/aave", label: "理财" },
    { href: "/profile", label: "个人中心" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan to-cyber-blue rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-blue rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold gradient-text">
                Web3 University
              </span>
              <span className="text-xs text-gray-400">涂山大学</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  isActive(link.href)
                    ? "text-cyber-cyan"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {isActive(link.href) && (
                  <div className="absolute inset-0 bg-cyber-cyan/10 rounded-lg border border-cyber-cyan/30"></div>
                )}
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Connect Button */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple rounded-lg blur opacity-30 group-hover:opacity-70 transition"></div>
              <div className="relative">
                <ConnectButton />
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ConnectButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyber-cyan transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive(link.href)
                    ? "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
