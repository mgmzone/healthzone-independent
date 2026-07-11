
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';
import QuickLogSheet from './QuickLogSheet';
import { useAuth } from '@/lib/auth';
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
  const { user } = useAuth();

  return (
    // pb-16 clears the fixed mobile tab bar; md:pb-0 because the bar is md:hidden
    <div className={cn('min-h-screen flex flex-col', user && 'pb-16 md:pb-0')}>
      <Header transparent={transparentHeader} />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      {user && (
        <>
          <MobileTabBar />
          <QuickLogSheet />
        </>
      )}
    </div>
  );
};

export default Layout;
