
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { Toaster as HotToaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TABU',
  description: 'Workers\' Union for a better future.',
  icons: {
    icon: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white' rx='10' ry='10'></rect><path fill='black' d='M50,25a25,25,0,0,0-25,25v10h50v-10a25,25,0,0,0-25-25zm12.5,40h-25a2.5,2.5,0,0,0,0,5h25a2.5,2.5,0,0,0,0-5z'/></svg>`,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
          <HotToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
