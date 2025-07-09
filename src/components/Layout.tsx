import Header from './Header';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <div className="main-content">
        <main>{children}</main>
      </div>
    </div>
  );
}
