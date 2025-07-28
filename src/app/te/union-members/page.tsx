

"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { te } from 'date-fns/locale';
import type { UserData } from '@/types/user';

type UserWithId = UserData & { id: string };

const USERS_PER_PAGE = 10;

export default function UnionMembersPageTe() {
    const [users, setUsers] = useState<UserWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const statusMap: { [key: string]: string } = {
        'active': 'క్రియాశీలం',
        'inactive': 'నిష్క్రియం',
        'not subscribed': 'సభ్యత్వం లేదు'
    };
    
    const filterMap: { [key: string]: string } = {
        'all': 'అన్నీ',
        'active': 'క్రియాశీలం',
        'inactive': 'నిష్క్రియం',
        'not subscribed': 'సభ్యత్వం లేదు'
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as UserData,
                }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone.includes(searchTerm);
            const status = user.subscription?.status || 'not subscribed';
            const matchesStatus = filterStatus === 'all' || status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };
    
    const renderSkeleton = (key: number) => (
        <TableRow key={key}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        </TableRow>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">యూనియన్ సభ్యులు</h1>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <Tabs defaultValue="all" onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
                            <TabsList>
                                <TabsTrigger value="all">{filterMap['all']}</TabsTrigger>
                                <TabsTrigger value="active">{filterMap['active']}</TabsTrigger>
                                <TabsTrigger value="inactive">{filterMap['inactive']}</TabsTrigger>
                                <TabsTrigger value="not subscribed">{filterMap['not subscribed']}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <form onSubmit={handleSearch} className="flex gap-2">
                             <Input 
                                placeholder="సభ్యుడిని కనుగొనండి..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                            <Button type="submit">వెతకండి</Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>పేరు</TableHead>
                                <TableHead>ఫోన్</TableHead>
                                <TableHead>స్థితి</TableHead>
                                <TableHead>చేరారు</TableHead>
                                <TableHead>చిరునామా</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: USERS_PER_PAGE }).map((_, i) => renderSkeleton(i))
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-mono text-xs">{user.id.substring(0, 6)}...</TableCell>
                                        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.subscription?.status === 'active' ? 'default' : 'destructive'} 
                                                className={user.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {statusMap[user.subscription?.status || 'not subscribed'] || user.subscription?.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.createdAt?.seconds 
                                                ? format(new Date(user.createdAt.seconds * 1000), "MMMM yyyy", { locale: te }) 
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>{user.address}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        ఎంచుకున్న ఫిల్టర్ కోసం సభ్యులు కనుగొనబడలేదు.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>మునుపటి</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button 
                            key={page} 
                            variant={currentPage === page ? 'default' : 'outline'} 
                            onClick={() => setCurrentPage(page)}
                            className="h-9 w-9"
                        >
                            {page}
                        </Button>
                    ))}
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>తదుపరి</Button>
                </div>
            )}
        </div>
    );
}
