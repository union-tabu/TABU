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
import { hi } from 'date-fns/locale';
import type { UserData } from '@/types/user';
import { ScrollArea } from '@/components/ui/scroll-area';

type UserWithId = UserData & { id: string };

const USERS_PER_PAGE = 25;

const maskPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
        return `******${phone.substring(6)}`;
    }
    return phone;
};

export default function UnionMembersPageHi() {
    const [users, setUsers] = useState<UserWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const statusMap: { [key: string]: string } = {
        'active': 'सक्रिय',
        'inactive': 'निष्क्रिय',
        'pending': 'लंबित'
    };
    
    const filterMap: { [key: string]: string } = {
        'all': 'सभी',
        'active': 'सक्रिय',
        'inactive': 'निष्क्रिय',
        'pending': 'लंबित'
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
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = `${user.fullName}`.toLowerCase().includes(lowercasedSearchTerm) || 
                                  user.phone.includes(searchTerm) ||
                                  (user.unionId && user.unionId.toLowerCase().includes(lowercasedSearchTerm));
            const status = user.subscription?.status || 'pending';
            const matchesStatus = filterStatus === 'all' || status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };
    
    const renderMobileSkeleton = (key: number) => (
        <Card key={key} className="mb-4">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-2/3" />
            </CardContent>
        </Card>
    );

    const renderDesktopSkeleton = (key: number) => (
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
            <h1 className="text-3xl font-bold tracking-tight">यूनियन सदस्य</h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <Tabs defaultValue="all" onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }} className="w-full md:w-auto">
                            <ScrollArea className="w-full md:w-auto whitespace-nowrap">
                                <TabsList>
                                    <TabsTrigger value="all">{filterMap['all']}</TabsTrigger>
                                    <TabsTrigger value="active">{filterMap['active']}</TabsTrigger>
                                    <TabsTrigger value="inactive">{filterMap['inactive']}</TabsTrigger>
                                    <TabsTrigger value="pending">{filterMap['pending']}</TabsTrigger>
                                </TabsList>
                            </ScrollArea>
                        </Tabs>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                             <Input 
                                placeholder="नाम, फ़ोन, या आईडी से खोजें..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 flex-grow"
                            />
                            <Button type="submit">खोजें</Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {loading ? (
                             Array.from({ length: 5 }).map((_, i) => renderMobileSkeleton(i))
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <Card key={user.id} className="mb-4">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                                                <CardDescription className="font-mono">{maskPhoneNumber(user.phone)}</CardDescription>
                                            </div>
                                            <Badge variant={user.subscription?.status === 'active' ? 'default' : 'destructive'} 
                                                className={`${user.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} shrink-0`}>
                                                {statusMap[user.subscription?.status || 'pending'] || user.subscription?.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground space-y-2">
                                        <p><span className="font-semibold">ID:</span> <span className="font-mono text-xs">{user.unionId || 'N/A'}</span></p>
                                        <p><span className="font-semibold">पेशा:</span> {user.profession || 'N/A'}</p>
                                        <p><span className="font-semibold">शामिल हुए:</span> {user.createdAt?.seconds 
                                                ? format(new Date(user.createdAt.seconds * 1000), "MMMM yyyy", { locale: hi }) 
                                                : 'N/A'}</p>
                                        <p><span className="font-semibold">स्थान:</span> {user.city}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <div className="text-center py-8">
                                <p>चयनित फ़िल्टर के लिए कोई सदस्य नहीं मिला।</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>नाम</TableHead>
                                    <TableHead>फ़ोन</TableHead>
                                    <TableHead>पेशा</TableHead>
                                    <TableHead>स्थिति</TableHead>
                                    <TableHead>शामिल हुए</TableHead>
                                    <TableHead>स्थान</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: USERS_PER_PAGE }).map((_, i) => renderDesktopSkeleton(i))
                                ) : paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-mono text-sm">{user.unionId || 'N/A'}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell className="font-mono">{maskPhoneNumber(user.phone)}</TableCell>
                                            <TableCell>{user.profession || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.subscription?.status === 'active' ? 'default' : 'destructive'} 
                                                    className={user.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {statusMap[user.subscription?.status || 'pending'] || user.subscription?.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.createdAt?.seconds 
                                                    ? format(new Date(user.createdAt.seconds * 1000), "MMMM yyyy", { locale: hi }) 
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>{user.city}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            चयनित फ़िल्टर के लिए कोई सदस्य नहीं मिला।
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>पिछला</Button>
                    <div className="hidden sm:flex items-center gap-2">
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
                    </div>
                     <div className="sm:hidden">
                        <span className="text-sm text-muted-foreground px-4">
                            पृष्ठ {currentPage} / {totalPages}
                        </span>
                    </div>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>अगला</Button>
                </div>
            )}
        </div>
    );
}
