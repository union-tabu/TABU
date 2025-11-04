"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  writeBatch,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { Payment } from '@/types/payment';
import type { UserData } from '@/types/user';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarIcon, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";


type UserWithId = UserData & { id: string };
type PaymentStatus = 'paid' | 'not-paid';
type DisplayUser = {
  id: string;
  fullName: string;
  phone: string;
  photoURL?: string;
  status: PaymentStatus;
  paymentId?: string;
};

const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}


export default function AdminPaymentsManagerPage() {
    const [allUsers, setAllUsers] = useState<UserWithId[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
    const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all users
                const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
                const usersSnapshot = await getDocs(usersQuery);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as UserData,
                }));
                setAllUsers(usersData);

                // Fetch payments for the selected month
                await fetchPaymentsForMonth(selectedMonth);

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "Could not fetch data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchPaymentsForMonth = async (month: Date) => {
        setLoading(true);
        try {
            const start = startOfMonth(month);
            const end = endOfMonth(month);
            const paymentsQuery = query(
                collection(db, "payments"),
                where("paymentDate", ">=", Timestamp.fromDate(start)),
                where("paymentDate", "<=", Timestamp.fromDate(end))
            );
            const paymentsSnapshot = await getDocs(paymentsQuery);
            const paymentsData = paymentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Payment));
            setPayments(paymentsData);
        } catch (error) {
            console.error(`Error fetching payments for ${format(month, 'MMMM yyyy')}:`, error);
            toast({ title: "Error", description: "Could not fetch payments for the selected month.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPaymentsForMonth(selectedMonth);
        setSelectedUsers([]); // Reset selection on month change
    }, [selectedMonth]);

    const allDisplayUsers = useMemo<DisplayUser[]>(() => {
        const usersForMonth = allUsers
            .filter(user => user.createdAt && new Date(user.createdAt.seconds * 1000) <= endOfMonth(selectedMonth));

        return usersForMonth.map(user => {
            const userPayment = payments.find(p => p.userId === user.id && p.status === 'success');
            return {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone,
                photoURL: user.photoURL,
                status: userPayment ? 'paid' : 'not-paid',
                paymentId: userPayment?.id,
            };
        });
    }, [allUsers, payments, selectedMonth]);

    const displayUsers = useMemo<DisplayUser[]>(() => {
        if (filterStatus === 'all') {
            return allDisplayUsers;
        }
        return allDisplayUsers.filter(user => user.status === filterStatus);
    }, [allDisplayUsers, filterStatus]);


    const handleBulkUpdate = async (newStatus: PaymentStatus) => {
        if (selectedUsers.length === 0) return;
        setIsUpdating(true);
        
        try {
            const batch = writeBatch(db);
            const monthStr = format(selectedMonth, 'yyyy-MM');

            for (const userId of selectedUsers) {
                const user = allUsers.find(u => u.id === userId);
                if (!user) continue;

                // Unique ID for this user and month to avoid duplicates
                const paymentId = `monthly-${userId}-${monthStr}`;
                const paymentRef = doc(db, 'payments', paymentId);
                
                if (newStatus === 'paid') {
                     batch.set(paymentRef, {
                        userId: userId,
                        plan: 'monthly',
                        amount: 100,
                        status: 'success',
                        createdAt: serverTimestamp(),
                        paymentDate: Timestamp.fromDate(selectedMonth),
                        cf_order_id: `manual_${Date.now()}`,
                     }, { merge: true });
                } else { // 'not-paid'
                    // If a payment record exists, delete it to mark as not paid
                    batch.delete(paymentRef);
                }
            }

            await batch.commit();
            toast({
                title: 'Update Successful',
                description: `${selectedUsers.length} user(s) have been marked as ${newStatus}.`
            });
            
            // Refresh data
            await fetchPaymentsForMonth(selectedMonth);

        } catch (error) {
            console.error("Error updating statuses:", error);
            toast({ title: 'Update Failed', description: 'An error occurred during the bulk update.', variant: 'destructive' });
        } finally {
            setIsUpdating(false);
            setSelectedUsers([]);
        }
    };


    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedUsers(displayUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const isAllSelected = displayUsers.length > 0 && selectedUsers.length === displayUsers.length;
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                        <CardTitle>Monthly Payments</CardTitle>
                        <CardDescription>Manage member payment status for the selected month.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedMonth, 'MMMM yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedMonth}
                                    onSelect={(month) => setSelectedMonth(month || new Date())}
                                    captionLayout="dropdown-buttons"
                                    fromYear={2024}
                                    toYear={new Date().getFullYear() + 1}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)} className="w-full md:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All ({allDisplayUsers.length})</TabsTrigger>
                                <TabsTrigger value="paid">Paid ({allDisplayUsers.filter(u => u.status === 'paid').length})</TabsTrigger>
                                <TabsTrigger value="not-paid">Not Paid ({allDisplayUsers.filter(u => u.status === 'not-paid').length})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {selectedUsers.length > 0 && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={isUpdating}>
                                        Actions ({selectedUsers.length})
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleBulkUpdate('paid')}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Mark as Paid
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => handleBulkUpdate('not-paid')} className="text-red-600">
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Mark as Not Paid
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : displayUsers.length > 0 ? (
                                displayUsers.map((user) => (
                                    <TableRow key={user.id} data-state={selectedUsers.includes(user.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedUsers(
                                                        checked
                                                            ? [...selectedUsers, user.id]
                                                            : selectedUsers.filter((id) => id !== user.id)
                                                    );
                                                }}
                                                aria-label={`Select ${user.fullName}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.photoURL} alt={user.fullName} />
                                                    <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono">{user.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'paid' ? 'default' : 'destructive'}
                                                   className={user.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {user.status === 'paid' ? 'Paid' : 'Not Paid'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No members to display for this filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
