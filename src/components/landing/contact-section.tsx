
"use client";

interface ContactSectionProps {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
}

export function ContactSection({ title, subtitle, address, phone, email }: ContactSectionProps) {
  return (
    <section id="contact" className="w-full py-16 md:py-24 bg-secondary">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">{title}</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {subtitle}
        </p>
        <div className="mt-8 text-lg text-foreground">
          <p><strong>Address:</strong> {address}</p>
          <p className="mt-2"><strong>Phone:</strong> {phone}</p>
          <p className="mt-2"><strong>Email:</strong> {email}</p>
        </div>
      </div>
    </section>
  );
}
