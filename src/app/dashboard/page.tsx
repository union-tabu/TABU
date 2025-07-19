
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Timestamp } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, CreditCard, History, Languages } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

import { ProfileTab } from '@/components/dashboard/profile-tab';
import { SubscriptionTab } from '@/components/dashboard/subscription-tab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// NOTE: Payment history is still static as we don't have a payments collection yet.
const paymentHistory = [
  { id: 'TRN001', date: '2024-06-01', plan: 'Yearly', amount: '₹600.00' },
  { id: 'TRN002', date: '2023-06-01', plan: 'Yearly', amount: '₹600.00' },
  { id: 'TRN003', date: '2022-05-15', plan: 'Monthly', amount: '₹50.00' },
  { id: 'TRN004', date: '2022-04-15', plan: 'Monthly', amount: '₹50.00' },
];

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  memberId: string;
  subscription: {
    plan: string;
    status: 'active' | 'inactive';
    renewalDate: Timestamp;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUser({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone || 'N/A',
              address: data.address || 'N/A',
              memberId: `SANG-${currentUser.uid.substring(0, 5).toUpperCase()}`,
              subscription: data.subscription
            });
          } else {
            console.error("No user document found in Firestore!");
            router.push('/login');
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        router.push('/login');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-9 w-1/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-full md:w-1/2 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
        {user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">Member ID: {user.memberId}</p>
            </div>
          </div>
        )}
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit md:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {user && firebaseUser && (
          <>
            <TabsContent value="profile">
              <ProfileTab user={user} userId={firebaseUser.uid} />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionTab user={user} />
            </TabsContent>
          </>
        )}

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="text-primary"/> Payment History</CardTitle>
              <CardDescription>A record of all your past transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download receipt</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Languages className="text-primary"/> Language Preferences</CardTitle>
              <CardDescription>Choose your preferred language for the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center space-x-2">
                 <p className="text-sm font-medium">Select Language:</p>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">English</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/te/dashboard">తెలుగు</Link>
                </Button>
              </div>
              <Separator />
               <p className="text-sm text-muted-foreground">More settings will be available here in the future.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
