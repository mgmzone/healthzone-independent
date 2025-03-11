
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
  transparentHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  hideFooter = false,
  transparentHeader = false
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={transparentHeader} />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
