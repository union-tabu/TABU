
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Timestamp } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, CreditCard, History, Languages, UserCircle, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

import { ProfileTab } from '@/components/dashboard/profile-tab-te';
import { SubscriptionTab } from '@/components/dashboard/subscription-tab-te';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { te } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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

export interface Payment {
    id: string;
    paymentDate: Timestamp;
    plan: string;
    amount: number;
}


export default function DashboardPageTe() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Clear previous listeners
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      listenersRef.current = [];

      if (currentUser) {
        setFirebaseUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
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
            signOut(auth);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user document:", error);
            setLoading(false);
        });

        const paymentsQuery = query(
            collection(db, "payments"), 
            where("userId", "==", currentUser.uid), 
            orderBy("paymentDate", "desc")
        );

        const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
            const paymentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Payment));
            setPayments(paymentsData);
            setPaymentsLoading(false);
        }, (error) => {
            console.error("Error fetching payments:", error);
            setPaymentsLoading(false);
        });

        listenersRef.current.push(unsubscribeUser, unsubscribePayments);

      } else {
        router.push('/te/login');
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        listenersRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [router]);

  const handleLogout = async () => {
    // First, detach all listeners to prevent permission errors
    listenersRef.current.forEach(unsubscribe => unsubscribe());
    listenersRef.current = [];

    try {
      await signOut(auth);
      localStorage.removeItem('isAuthenticated');
      toast({
        title: "లాగ్ అవుట్ చేయబడింది",
        description: "మీరు విజయవంతంగా లాగ్ అవుట్ చేసారు.",
      });
      // The onAuthStateChanged listener will handle the redirect
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "లోపం",
        description: "మిమ్మల్ని లాగ్ అవుట్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-3xl font-bold font-headline">మీ డాష్‌బోర్డ్</h1>
        {user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">సభ్యుని ID: {user.memberId}</p>
            </div>
          </div>
        )}
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit md:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="profile"><UserCircle className="w-4 h-4 mr-2"/>ప్రొఫైల్</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="w-4 h-4 mr-2"/>చందా</TabsTrigger>
          <TabsTrigger value="payment"><History className="w-4 h-4 mr-2"/>చెల్లింపు చరిత్ర</TabsTrigger>
          <TabsTrigger value="settings"><Languages className="w-4 h-4 mr-2"/>సెట్టింగ్‌లు</TabsTrigger>
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
              <CardTitle className="flex items-center gap-2"><History className="text-primary"/> చెల్లింపు చరిత్ర</CardTitle>
              <CardDescription>మీ గత లావాదేవీల రికార్డు.</CardDescription>
            </CardHeader>
            <CardContent>
               {paymentsLoading ? (
                 <Skeleton className="h-40 w-full" />
               ) : payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>లావాదేవీ ID</TableHead>
                      <TableHead>తేదీ</TableHead>
                      <TableHead>ప్రణాళిక</TableHead>
                      <TableHead>మొత్తం</TableHead>
                      <TableHead className="text-right">రసీదు</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id.substring(0,10)}...</TableCell>
                        <TableCell>{format(payment.paymentDate.toDate(), "MMMM d, yyyy", { locale: te })}</TableCell>
                        <TableCell className="capitalize">{payment.plan === 'yearly' ? 'వార్షిక' : 'నెలవారీ'}</TableCell>
                        <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">రసీదును డౌన్‌లోడ్ చేయండి</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               ) : (
                 <div className="text-center py-10">
                   <p className="text-muted-foreground">చెల్లింపు చరిత్ర కనుగొనబడలేదు.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Languages className="text-primary"/> సెట్టింగ్‌లు</CardTitle>
              <CardDescription>మీ భాషా ప్రాధాన్యతలు మరియు ఖాతాను నిర్వహించండి.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center space-x-2">
                 <p className="text-sm font-medium">భాషను ఎంచుకోండి:</p>
                <Button variant="ghost" asChild>
                    <Link href="/dashboard">English</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/te/dashboard">తెలుగు</Link>
                </Button>
              </div>
              <Separator />
               <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                లాగ్ అవుట్
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    