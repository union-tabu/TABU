
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">లాగిన్</CardTitle>
          <CardDescription>మీ ఖాతాలోకి లాగిన్ అవ్వడానికి మీ ఇమెయిల్‌ను నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ఇమెయిల్</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">పాస్‌వర్డ్</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline hover:text-primary">
                  మీ పాస్‌వర్డ్ మర్చిపోయారా?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              లాగిన్
            </Button>
            <Button variant="outline" className="w-full">
              ఫోన్‌తో లాగిన్ అవ్వండి (OTP)
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ఖాతా లేదా?{' '}
            <Link href="/te/signup" className="underline hover:text-primary">
              నమోదు చేసుకోండి
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
