
"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Contact Us</h1>
            <p className="mt-4 text-lg text-gray-600">
              We're here to help. Reach out to us with any questions or concerns.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:info@sanghikasamakhya.org" className="text-lg text-primary hover:underline">
                  info@sanghikasamakhya.org
                </a>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="tel:+910000000000" className="text-lg text-primary hover:underline">
                  +91 123-456-7890
                </a>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  123 Union Street, Worker's Colony<br/>
                  Hyderabad, Telangana, 500001
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
