import Link from 'next/link';
import { Users, Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-foreground">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl font-headline">
              <Users className="h-7 w-7 text-primary" />
              Sanghika Samakhya
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">United for a better tomorrow.</p>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#benefits" className="hover:text-primary transition-colors">Benefits</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="#contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Contact</h3>
            <address className="mt-4 space-y-2 text-sm not-italic text-muted-foreground">
              <p>123 Union Lane, Worker's City, 500001</p>
              <p>Email: <a href="mailto:contact@sanghika.org" className="hover:text-primary transition-colors">contact@sanghika.org</a></p>
              <p>Phone: <a href="tel:+911234567890" className="hover:text-primary transition-colors">+91 123 456 7890</a></p>
            </address>
          </div>
           <div>
            <h3 className="font-semibold tracking-wider uppercase">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sanghika Samakhya. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
