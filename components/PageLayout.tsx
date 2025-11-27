import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  hasBottomBar?: boolean;
}

export function PageLayout({ children, hasBottomBar = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2347b0]/5 via-white to-[#8eb6dc]/15">
      {children}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  hasBottomBar?: boolean;
}

export function PageContent({ children, hasBottomBar = true }: PageContentProps) {
  return (
    <main className={`max-w-4xl mx-auto px-6 py-8 ${hasBottomBar ? 'pb-32' : ''}`}>
      {children}
    </main>
  );
}
