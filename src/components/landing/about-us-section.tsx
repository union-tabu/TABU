
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutUsSection() {
  return (
    <section id="about" className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">About Us</h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground">
              Telangana All Building Workers Union is a collective of daily wage workers, construction laborers, and skilled tradespeople across Telangana, united to protect their rights and well-being.
            </p>
            <p className="text-muted-foreground">
              We are committed to empowering every worker with identity, dignity, and access to essential benefits like insurance and financial support. By registering with the union, workers receive official recognition, a support system for wage recovery, and protection for their families in case of emergencies.
            </p>
            <p className="text-muted-foreground">
              Whether you’re working on a site in a village or in a city, this union is your voice, your strength, and your safety net.
            </p>
            <div>
                <Button asChild>
                    <Link href="/signup">Register</Link>
                </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
