
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, addMonths, isBefore } from "date-fns";
import type { Payment } from '@/types/payment';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAYMENTS_PER_PAGE = 25;

type PaymentStatus = 'success' | 'pending' | 'failed';

const statusMap: { [key in PaymentStatus]: { text: string; className: string } } = {
  success: { text: "Paid", className: "bg-green-100 text-green-800" },
  pending: { text: "Pending", className: "bg-amber-100 text-amber-800" },
  failed: { text: "Not Paid", className: "bg-red-100 text-red-800" },
};

const UPI_LINK = "upi://pay?pa=ramchanndar987-1@okhdfcbank&pn=T.A.B.U&am=10&cu=INR";

export default function PaymentsPage() {
    const { userData, firebaseUser, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchPayments = async () => {
            if (firebaseUser && userData?.createdAt) {
                try {
                    const q = query(
                        collection(db, "payments"), 
                        where("userId", "==", firebaseUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const existingPayments = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            paymentDate: data.paymentDate?.toDate(),
                            createdAt: data.createdAt?.toDate()
                        } as Payment;
                    });

                    // --- Generate missing "not paid" records ---
                    const generatedPayments: Payment[] = [];
                    const joinDate = new Date(userData.createdAt.seconds * 1000);
                    let currentMonth = startOfMonth(joinDate);
                    const today = new Date();

                    while (isBefore(currentMonth, startOfMonth(addMonths(today,1)))) {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();

                        const hasPaymentForMonth = existingPayments.some(p => {
                            if (!p.createdAt && !p.paymentDate) return false;
                            const paymentDate = p.paymentDate || p.createdAt;
                            return paymentDate.getFullYear() === year && paymentDate.getMonth() === month && (p.status === 'success' || p.status === 'pending');
                        });

                        if (!hasPaymentForMonth) {
                           generatedPayments.push({
                                id: `gen-${year}-${month}`,
                                userId: firebaseUser.uid,
                                plan: userData.subscription?.plan || 'monthly',
                                amount: 100, // Default to monthly amount, as this is for dues
                                status: 'failed',
                                createdAt: currentMonth,
                                paymentDate: currentMonth, 
                           } as Payment);
                        }
                        currentMonth = addMonths(currentMonth, 1);
                    }
                    
                    const allPayments = [...existingPayments, ...generatedPayments];

                    const sortedPayments = allPayments.sort((a, b) => {
                        const dateA = a.paymentDate || a.createdAt;
                        const dateB = b.paymentDate || b.createdAt;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        return dateB.getTime() - dateA.getTime();
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
    }, [firebaseUser, authLoading, userData]);
    
    const handleMarkPaid = (paymentId: string) => {
        setPayments(prevPayments => 
            prevPayments.map(p => 
                p.id === paymentId ? { ...p, status: 'pending' } : p
            )
        );
    };

    const handleMarkUnpaid = (paymentId: string) => {
        setPayments(prevPayments => 
            prevPayments.map(p => 
                p.id === paymentId ? { ...p, status: 'failed' } : p
            )
        );
    };

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
                    <CardTitle>Payments</CardTitle>
                    <CardDescription>View your transaction history with the union.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)} className="w-full mb-4">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="failed">Not Paid</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="success">Paid</TabsTrigger>
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
                                            <CardTitle className="text-lg capitalize">{payment.plan}</CardTitle>
                                            <p className="font-bold text-lg">₹{payment.amount}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                             <p className="text-muted-foreground">
                                                {payment.paymentDate 
                                                    ? format(payment.paymentDate, "MMMM dd, yyyy") 
                                                    : (payment.createdAt ? format(payment.createdAt, "MMMM dd, yyyy") : 'N/A')}
                                            </p>
                                            <Badge variant={payment.status === 'success' ? 'default' : 'destructive'} 
                                                   className={statusMap[payment.status].className}>
                                                {statusMap[payment.status].text}
                                            </Badge>
                                        </div>
                                        {payment.status === 'failed' && (
                                            <div className="flex gap-2">
                                                <Button asChild className="flex-1">
                                                    <a href={UPI_LINK}>Pay</a>
                                                </Button>
                                                <Button variant="secondary" className="flex-1" onClick={() => handleMarkPaid(payment.id)}>
                                                    Mark Paid
                                                </Button>
                                            </div>
                                        )}
                                        {payment.status === 'pending' && (
                                            <Button variant="secondary" className="w-full" onClick={() => handleMarkUnpaid(payment.id)}>
                                                Mark Unpaid
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No payment history found for this filter.
                            </div>
                        )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => renderDesktopSkeleton(i))
                                ) : paginatedPayments.length > 0 ? (
                                    paginatedPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="capitalize">{payment.plan}</TableCell>
                                            <TableCell>
                                                {payment.paymentDate 
                                                    ? format(payment.paymentDate, "MMMM dd, yyyy") 
                                                    : (payment.createdAt ? format(payment.createdAt, "MMMM dd, yyyy") : 'N/A')}
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
                                                    <div className="flex gap-2">
                                                        <Button asChild size="sm">
                                                            <a href={UPI_LINK}>Pay</a>
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={() => handleMarkPaid(payment.id)}>
                                                            Mark Paid
                                                        </Button>
                                                    </div>
                                                )}
                                                {payment.status === 'pending' && (
                                                    <Button variant="secondary" size="sm" onClick={() => handleMarkUnpaid(payment.id)}>
                                                        Mark Unpaid
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No payment history found for this filter.
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
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

    
