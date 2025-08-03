
"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import type { Payment } from '@/types/payment';
import type { UserData } from '@/types/user';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

type PaymentWithUser = Payment & { userName: string; userPhone: string };

const PAYMENTS_PER_PAGE = 25;

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                // Fetch all payments
                const paymentsQuery = query(collection(db, "payments"), orderBy("paymentDate", "desc"));
                const paymentsSnapshot = await getDocs(paymentsQuery);
                const paymentsData = paymentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    paymentDate: doc.data().paymentDate?.toDate()
                } as Payment));

                // Fetch user data for each payment
                const paymentsWithUsers = await Promise.all(paymentsData.map(async (payment) => {
                    const userDocRef = doc(db, "users", payment.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    const userData = userDocSnap.exists() ? userDocSnap.data() as UserData : null;
                    return {
                        ...payment,
                        userName: userData?.fullName || 'N/A',
                        userPhone: userData?.phone || 'N/A'
                    };
                }));

                setPayments(paymentsWithUsers);
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            return (
                payment.userName.toLowerCase().includes(lowercasedSearchTerm) ||
                payment.userPhone.includes(lowercasedSearchTerm) ||
                payment.razorpay_payment_id.toLowerCase().includes(lowercasedSearchTerm)
            );
        });
    }, [payments, searchTerm]);

    const totalPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice((currentPage - 1) * PAYMENTS_PER_PAGE, currentPage * PAYMENTS_PER_PAGE);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const renderDesktopSkeleton = (key: number) => (
        <TableRow key={key}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        </TableRow>
    );

    const renderMobileSkeleton = (key: number) => (
        <Card key={key} className="mb-4">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">All Payments</h1>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Transaction History</CardTitle>
                        <form onSubmit={handleSearch} className="flex gap-2">
                             <Input 
                                placeholder="Search Name, Phone, or Payment ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                            <Button type="submit">Search</Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => renderMobileSkeleton(i))
                        ) : paginatedPayments.length > 0 ? (
                            paginatedPayments.map((payment) => (
                                <Card key={payment.id} className="mb-4">
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-lg">{payment.userName}</CardTitle>
                                                <CardDescription>{payment.userPhone}</CardDescription>
                                            </div>
                                            <p className="font-bold text-lg">₹{payment.amount}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="text-muted-foreground">
                                                {payment.paymentDate ? format(payment.paymentDate, "MMMM dd, yyyy") : 'N/A'}
                                            </p>
                                            <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}
                                                   className={payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No payment history found.
                            </div>
                        )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 10 }).map((_, i) => renderDesktopSkeleton(i))
                                ) : paginatedPayments.length > 0 ? (
                                    paginatedPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="font-medium">{payment.userName}</div>
                                                <div className="text-sm text-muted-foreground">{payment.userPhone}</div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.paymentDate ? format(payment.paymentDate, "MMMM dd, yyyy") : 'N/A'}
                                            </TableCell>
                                            <TableCell className="capitalize">{payment.plan}</TableCell>
                                            <TableCell>₹{payment.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}
                                                       className={payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No payment history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
            )}
        </div>
    );
}
