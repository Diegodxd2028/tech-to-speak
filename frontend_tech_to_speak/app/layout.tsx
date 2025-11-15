'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen bg-gray-100">
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <aside
            className={`fixed md:relative z-50 w-64 h-screen bg-gray-900 text-white transition-transform duration-300 transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } flex flex-col`}
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold">Talky</h1>
              <p className="text-gray-400 text-sm mt-1">Tu asistente de voz</p>
            </div>

            {/* Menu Options */}
            <nav className="flex-1 p-4">
              <div className="space-y-3">
                {/* Audio */}
                <Link href="/">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold ${
                    isActive('/')
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-gray-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                      <path d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"></path>
                    </svg>
                    Audio
                  </button>
                </Link>

                {/* Texto */}
                <Link href="/text">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold ${
                    isActive('/text')
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-gray-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4z"></path>
                    </svg>
                    Texto
                  </button>
                </Link>

                {/* Archivo */}
                <Link href="/file">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold ${
                    isActive('/file')
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-gray-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path>
                    </svg>
                    Archivo
                  </button>
                </Link>

                {/* Imagen */}
                <Link href="/image">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold ${
                    isActive('/image')
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-gray-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path>
                    </svg>
                    Imagen
                  </button>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM5.757 4.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z"></path>
                </svg>
                Configuración
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header con Hamburger */}
            <header className="bg-white shadow-sm p-4 flex items-center gap-4 md:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold">Tech to Talk</h1>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}