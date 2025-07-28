

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import type { Payment } from '@/types/payment';

const PAYMENTS_PER_PAGE = 10;

export default function PaymentsPage() {
    const { firebaseUser, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPayments = async () => {
            if (firebaseUser) {
                try {
                    const q = query(
                        collection(db, "payments"), 
                        where("userId", "==", firebaseUser.uid),
                        orderBy("paymentDate", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    const paymentsData = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            // Convert Firestore Timestamp to JS Date
                            paymentDate: data.paymentDate?.toDate()
                        } as Payment;
                    });
                    setPayments(paymentsData);
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

    const totalPages = Math.ceil(payments.length / PAYMENTS_PER_PAGE);
    const paginatedPayments = payments.slice(
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
    
    const renderSkeleton = (key: number) => (
        <TableRow key={key}>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        </TableRow>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payments</CardTitle>
                    <CardDescription>View your transaction history with the union.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => renderSkeleton(i))
                            ) : paginatedPayments.length > 0 ? (
                                paginatedPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="capitalize">{payment.plan}</TableCell>
                                        <TableCell>
                                            {payment.paymentDate 
                                                ? format(payment.paymentDate, "MMMM dd, yyyy") 
                                                : 'N/A'}
                                        </TableCell>
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
                                    <TableCell colSpan={4} className="text-center">
                                        No payment history found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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

