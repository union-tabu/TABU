
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { hi } from 'date-fns/locale';
import type { Payment } from '@/types/payment';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

const PAYMENTS_PER_PAGE = 25;
type PaymentStatus = 'success' | 'pending' | 'failed';

const planMap: { [key: string]: string } = {
    'monthly': 'मासिक',
    'yearly': 'वार्षिक'
};

const statusMap: { [key in PaymentStatus]: { text: string; className: string } } = {
  success: { text: "भुगतान किया गया", className: "bg-green-100 text-green-800" },
  pending: { text: "लंबित", className: "bg-amber-100 text-amber-800" },
  failed: { text: "भुगतान नहीं किया गया", className: "bg-red-100 text-red-800" },
};


export default function PaymentsPageHi() {
    const { firebaseUser, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    
    useEffect(() => {
        const fetchPayments = async () => {
            if (firebaseUser) {
                try {
                    const q = query(
                        collection(db, "payments"), 
                        where("userId", "==", firebaseUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const paymentsData = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            paymentDate: data.paymentDate?.toDate(),
                            createdAt: data.createdAt?.toDate()
                        } as Payment;
                    });
                    const sortedPayments = paymentsData.sort((a, b) => {
                        if (!a.createdAt) return 1;
                        if (!b.createdAt) return -1;
                        return b.createdAt.getTime() - a.createdAt.getTime();
                    });
                    setPayments(sortedPayments);
                } catch (error) {
                    console.error("Error fetching payments:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [firebaseUser, authLoading]);

    const filteredPayments = useMemo(() => {
        if (filterStatus === 'all') {
            return payments;
        }
        return payments.filter(p => p.status === filterStatus);
    }, [payments, filterStatus]);

    const totalPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * PAYMENTS_PER_PAGE,
        currentPage * PAYMENTS_PER_PAGE
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    const renderDesktopSkeleton = (key: number) => (
        <TableRow key={key}>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-9 w-24" /></TableCell>
        </TableRow>
    );

    const renderMobileSkeleton = (key: number) => (
         <Card key={key} className="mb-4">
            <CardHeader className='p-4'>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/5" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                </div>
                 <Skeleton className="h-9 w-full" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>भुगतान</CardTitle>
                    <CardDescription>संघ के साथ अपने लेनदेन का इतिहास देखें।</CardDescription>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)} className="w-full mb-4">
                        <TabsList>
                            <TabsTrigger value="all">सभी</TabsTrigger>
                            <TabsTrigger value="success">भुगतान किया गया</TabsTrigger>
                            <TabsTrigger value="pending">लंबित</TabsTrigger>
                            <TabsTrigger value="failed">भुगतान नहीं किया गया</TabsTrigger>
                        </TabsList>
                    </Tabs>

                     {/* Mobile Card View */}
                    <div className="md:hidden">
                         {loading ? (
                             Array.from({ length: 5 }).map((_, i) => renderMobileSkeleton(i))
                        ) : paginatedPayments.length > 0 ? (
                            paginatedPayments.map((payment) => (
                                <Card key={payment.id} className="mb-4">
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">{planMap[payment.plan] || payment.plan}</CardTitle>
                                            <p className="font-bold text-lg">₹{payment.amount}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                             <p className="text-muted-foreground">
                                                {payment.paymentDate 
                                                    ? format(payment.paymentDate, "MMMM dd, yyyy", { locale: hi }) 
                                                    : (payment.createdAt ? format(payment.createdAt, "MMMM dd, yyyy", { locale: hi }) : 'N/A')}
                                            </p>
                                            <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}
                                                   className={statusMap[payment.status].className}>
                                                {statusMap[payment.status].text}
                                            </Badge>
                                        </div>
                                         {payment.status === 'failed' && (
                                            <Button asChild className="w-full">
                                                <Link href="/hi/subscribe">अभी भुगतान करें</Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                इस फ़िल्टर के लिए कोई भुगतान इतिहास नहीं मिला।
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>योजना</TableHead>
                                    <TableHead>दिनांक</TableHead>
                                    <TableHead>राशि</TableHead>
                                    <TableHead>स्थिति</TableHead>
                                    <TableHead>कार्रवाई</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => renderDesktopSkeleton(i))
                                ) : paginatedPayments.length > 0 ? (
                                    paginatedPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{planMap[payment.plan] || payment.plan}</TableCell>
                                            <TableCell>
                                                {payment.paymentDate 
                                                    ? format(payment.paymentDate, "MMMM dd, yyyy", { locale: hi }) 
                                                    : (payment.createdAt ? format(payment.createdAt, "MMMM dd, yyyy", { locale: hi }) : 'N/A')}
                                            </TableCell>
                                            <TableCell>₹{payment.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}
                                                    className={statusMap[payment.status].className}>
                                                    {statusMap[payment.status].text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.status === 'failed' && (
                                                    <Button asChild size="sm">
                                                        <Link href="/hi/subscribe">अभी भुगतान करें</Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            इस फ़िल्टर के लिए कोई भुगतान इतिहास नहीं मिला।
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
             {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                        पिछला
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        पृष्ठ {currentPage} / {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        अगला
                    </Button>
                </div>
            )}
        </div>
    );
}
