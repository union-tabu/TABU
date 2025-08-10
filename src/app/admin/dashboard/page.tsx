
"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import type { UserData } from '@/types/user';
import type { Payment } from '@/types/payment';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Users, IndianRupee, Activity, Wallet } from 'lucide-react';

type UserWithId = UserData & { id: string };

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<UserWithId[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all users
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as UserData }));
                const totalUsers = usersSnapshot.size;
                const activeSubscriptions = allUsers.filter(u => u.subscription?.status === 'active').length;
                
                // Fetch all payments for revenue calculation
                const paymentsSnapshot = await getDocs(collection(db, 'payments'));
                const allPayments = paymentsSnapshot.docs.map(doc => doc.data() as Payment);

                // Calculate monthly revenue
                const currentMonthStart = startOfMonth(new Date());
                const monthlyRevenue = allPayments
                    .filter(p => p.paymentDate && p.paymentDate.toDate() >= currentMonthStart)
                    .reduce((acc, p) => acc + p.amount, 0);
                
                // Calculate total revenue
                const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);

                setStats({ totalUsers, activeSubscriptions, monthlyRevenue, totalRevenue });
                
                // Process revenue chart data
                const monthlyRevenueData: { [key: string]: number } = {};
                for (let i = 0; i < 12; i++) {
                    const month = subMonths(new Date(), i);
                    const monthKey = format(month, 'MMM yyyy');
                    monthlyRevenueData[monthKey] = 0;
                }

                allPayments.forEach(p => {
                    if (p.paymentDate) {
                        const monthKey = format(p.paymentDate.toDate(), 'MMM yyyy');
                        if (monthlyRevenueData.hasOwnProperty(monthKey)) {
                            monthlyRevenueData[monthKey] += p.amount;
                        }
                    }
                });

                const chartData = Object.entries(monthlyRevenueData)
                    .map(([name, total]) => ({ name, total }))
                    .reverse(); // To show oldest month first

                setRevenueData(chartData);

                // Fetch recent users
                const recentUsersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
                const recentUsersSnapshot = await getDocs(recentUsersQuery);
                const recentUsersData = recentUsersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as UserData,
                }));
                setRecentUsers(recentUsersData);

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStatCardSkeleton = (key: number) => (
        <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
            </CardContent>
        </Card>
    );
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    Array.from({length: 4}).map((_, i) => renderStatCardSkeleton(i))
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                <p className="text-xs text-muted-foreground">All registered members</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                                <p className="text-xs text-muted-foreground">Currently active and paid members</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground">All-time revenue collected</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
                                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground">Since the start of {format(new Date(), 'MMMM')}</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Last 12 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                       {loading ? <Skeleton className="w-full h-[350px]" /> : (
                         <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                  Month
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                  {payload[0].payload.name}
                                                </span>
                                              </div>
                                              <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                  Revenue
                                                </span>
                                                <span className="font-bold">
                                                  ₹{payload[0].value?.toLocaleString('en-IN') ?? 0}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      }
                                      return null
                                    }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                       )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sign-ups</CardTitle>
                        <CardDescription>The 5 most recently joined members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                             <div className="space-y-4">
                                {Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}
                             </div>
                         ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="font-medium">{user.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{user.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.subscription?.status === 'active' ? 'default' : 'destructive'} 
                                                    className={`${user.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} capitalize`}>
                                                    {user.subscription?.status || 'pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.createdAt?.seconds ? format(user.createdAt.seconds * 1000, 'dd MMM, yyyy') : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    