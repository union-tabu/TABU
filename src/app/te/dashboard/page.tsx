
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileDown, UserCircle, CreditCard, History, Languages } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const paymentHistory = [
  { id: 'TRN001', date: '2024-06-01', plan: 'వార్షిక', amount: '₹600.00' },
  { id: 'TRN002', date: '2023-06-01', plan: 'వార్షిక', amount: '₹600.00' },
  { id: 'TRN003', date: '2022-05-15', plan: 'నెలవారీ', amount: '₹50.00' },
  { id: 'TRN004', date: '2022-04-15', plan: 'నెలవారీ', amount: '₹50.00' },
];

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || 'N/A',
            memberId: `SANG-${currentUser.uid.substring(0, 5).toUpperCase()}`,
          });
        } else {
          console.error("No user document found in Firestore!");
          router.push('/te/login');
        }
      } else {
        router.push('/te/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">మీ డాష్‌బోర్డ్</h1>
        <div className="flex items-center gap-2">
           <UserCircle className="h-10 w-10 text-muted-foreground" />
           <div>
             <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
             <p className="text-sm text-muted-foreground">సభ్యుని ID: {user?.memberId}</p>
           </div>
        </div>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit md:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="profile">ప్రొఫైల్</TabsTrigger>
          <TabsTrigger value="subscription">చందా</TabsTrigger>
          <TabsTrigger value="payment">చెల్లింపు చరిత్ర</TabsTrigger>
          <TabsTrigger value="settings">సెట్టింగ్‌లు</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary"/> వ్యక్తిగత సమాచారం</CardTitle>
              <CardDescription>మీ వ్యక్తిగత వివరాలను వీక్షించండి మరియు నిర్వహించండి.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">మొదటి పేరు:</span> {user?.firstName}</div>
                <div><span className="font-semibold text-muted-foreground">ఇంటి పేరు:</span> {user?.lastName}</div>
                <div><span className="font-semibold text-muted-foreground">ఇమెయిల్:</span> {user?.email}</div>
                <div><span className="font-semibold text-muted-foreground">ఫోన్:</span> {user?.phone}</div>
                <div><span className="font-semibold text-muted-foreground">చిరునామా:</span> 42 మెయిన్ స్ట్రీట్, వర్కర్స్ సిటీ</div>
              </div>
              <Button>ప్రొఫైల్‌ను సవరించండి</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/> చందా స్థితి</CardTitle>
              <CardDescription>మీ ప్రస్తుత సభ్యత్వ ప్రణాళిక మరియు స్థితి.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold">ప్రస్తుత ప్రణాళిక: వార్షిక</p>
                  <p className="text-sm text-muted-foreground">నవీకరణ తేదీ: జూన్ 1, 2025</p>
                </div>
                <Badge variant="default" className="bg-green-600 text-white">క్రియాశీలం</Badge>
              </div>
              <Button>చందాను నిర్వహించండి</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="text-primary"/> చెల్లింపు చరిత్ర</CardTitle>
              <CardDescription>మీ గత లావాదేవీల రికార్డు.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Languages className="text-primary"/> భాషా ప్రాధాన్యతలు</CardTitle>
              <CardDescription>డాష్‌బోర్డ్ కోసం మీకు ఇష్టమైన భాషను ఎంచుకోండి.</CardDescription>
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
               <p className="text-sm text-muted-foreground">భవిష్యత్తులో మరిన్ని సెట్టింగ్‌లు ఇక్కడ అందుబాటులో ఉంటాయి.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
