'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import styles from './Header.module.css';


export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSidebarOpen(false); // cierra el sidebar al cambiar de ruta
  }, [router.pathname]);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    localStorage.clear();
    router.push('/');
  };

  return (
    <>
      <div className="header">
        <h3 className="header-title">Hermaprove Panel</h3>
        <div className="header-actions">
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} />
    </>
  );
}
