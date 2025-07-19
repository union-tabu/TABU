import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Check, HeartHandshake, Megaphone, ShieldCheck, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-secondary flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container px-4 md:px-6 z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl font-headline">
              Welcome to Sanghika Samakhya
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Standing together for better rights, better pay, and a better future. Your strength is in unity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform transform hover:scale-105">
                <Link href="/signup">Join The Union Today <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-headline">Why Join Us?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Membership in Sanghika Samakhya offers numerous benefits to protect and enhance your work life.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Legal Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access to legal advice and representation for work-related issues.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Collective Bargaining</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We negotiate for better wages, benefits, and working conditions on your behalf.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Join a network of fellow workers for solidarity and mutual support.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">A Stronger Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Together, we have a powerful voice to advocate for change and justice.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="w-full py-16 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-headline">Membership Plans</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose a plan that works for you. All plans offer full benefits.
            </p>
          </div>
          <div className="mt-16 mx-auto grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-2">
            <Card className="flex flex-col rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-headline">Monthly Plan</CardTitle>
                <CardDescription className="mt-2 text-4xl font-bold text-primary">₹50<span className="text-lg font-medium text-muted-foreground">/month</span></CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-8">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Full Membership Benefits</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Flexible Commitment</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Automatic Renewal</li>
                </ul>
              </CardContent>
              <CardFooter className="p-8">
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/signup">Choose Monthly</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col rounded-2xl border-2 border-accent shadow-2xl hover:scale-105 transition-transform duration-300 relative">
              <div className="absolute top-0 right-4 -mt-4">
                <div className="bg-accent text-accent-foreground text-sm font-semibold py-1 px-3 rounded-full">Most Popular</div>
              </div>
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-headline">Yearly Plan</CardTitle>
                <CardDescription className="mt-2 text-4xl font-bold text-primary">₹600<span className="text-lg font-medium text-muted-foreground">/year</span></CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-8">
                 <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Full Membership Benefits</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Save on yearly subscription</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />Set it and forget it</li>
                </ul>
              </CardContent>
              <CardFooter className="p-8">
                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/signup">Choose Yearly</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-headline">From Our Members</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hear what our members have to say about the impact of the union.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"The union gave me the confidence to speak up. With their support, we secured better safety equipment for everyone on site."</p>
                <div className="mt-4 flex items-center">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male worker" alt="Member photo" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">Ravi Kumar</p>
                    <p className="text-sm text-muted-foreground">Construction Worker</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"When my pay was unfairly docked, the union's legal team stepped in and resolved it within days. I'm so grateful."</p>
                <div className="mt-4 flex items-center">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="female worker" alt="Member photo" />
                    <AvatarFallback>SP</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">Sunita Patel</p>
                    <p className="text-sm text-muted-foreground">Garment Factory Employee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
             <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"Being part of the union means I'm not alone. It's a family that looks out for you, on and off the job."</p>
                <div className="mt-4 flex items-center">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male employee" alt="Member photo" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">Anil Joshi</p>
                    <p className="text-sm text-muted-foreground">Logistics Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-16 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-headline">Get In Touch</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              We are here to help. Contact us with any questions or concerns.
            </p>
            <div className="mt-8 text-lg text-foreground">
              <p><strong>Address:</strong> 123 Union Lane, Worker's City, 500001</p>
              <p className="mt-2"><strong>Phone:</strong> +91 123 456 7890</p>
              <p className="mt-2"><strong>Email:</strong> contact@sanghika.org</p>
            </div>
        </div>
      </section>
    </div>
  );
}