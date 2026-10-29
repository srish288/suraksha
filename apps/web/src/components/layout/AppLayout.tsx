import React from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { SosButton } from '../sos/SosButton';
import { useAuth } from '../../context/AuthContext';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 bg-tactical-grid bg-radial-vignette selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <Footer />

      {/* Floating bottom-right SOS trigger for desktop */}
      {isAuthenticated && (
        <div className="hidden md:block">
          <SosButton variant="floating" />
        </div>
      )}

      {/* Mobile bottom thumb navigation */}
      {isAuthenticated && <MobileNav />}
    </div>
  );
};
