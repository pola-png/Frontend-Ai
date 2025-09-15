'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">AI</span> Football Prediction
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
