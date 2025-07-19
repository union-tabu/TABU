import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileDown, UserCircle, CreditCard, History, Languages } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const paymentHistory = [
  { id: 'TRN001', date: '2024-06-01', plan: 'Yearly', amount: '₹600.00' },
  { id: 'TRN002', date: '2023-06-01', plan: 'Yearly', amount: '₹600.00' },
  { id: 'TRN003', date: '2022-05-15', plan: 'Monthly', amount: '₹50.00' },
  { id: 'TRN004', date: '2022-04-15', plan: 'Monthly', amount: '₹50.00' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
        <div className="flex items-center gap-2">
           <UserCircle className="h-10 w-10 text-muted-foreground" />
           <div>
             <p className="font-semibold">Ravi Kumar</p>
             <p className="text-sm text-muted-foreground">Member ID: SANG-12345</p>
           </div>
        </div>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit md:grid-cols-4 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary"/> Personal Information</CardTitle>
              <CardDescription>View and manage your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">First Name:</span> Ravi</div>
                <div><span className="font-semibold text-muted-foreground">Last Name:</span> Kumar</div>
                <div><span className="font-semibold text-muted-foreground">Email:</span> r.kumar@example.com</div>
                <div><span className="font-semibold text-muted-foreground">Phone:</span> +91 9876543210</div>
                <div><span className="font-semibold text-muted-foreground">Address:</span> 42 Main St, Worker's City</div>
              </div>
              <Button>Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/> Subscription Status</CardTitle>
              <CardDescription>Your current membership plan and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold">Current Plan: Yearly</p>
                  <p className="text-sm text-muted-foreground">Renews on: June 1, 2025</p>
                </div>
                <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
              </div>
              <Button>Manage Subscription</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="text-primary"/> Payment History</CardTitle>
              <CardDescription>A record of all your past transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
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
                          <span className="sr-only">Download receipt</span>
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
              <CardTitle className="flex items-center gap-2"><Languages className="text-primary"/> Language Preferences</CardTitle>
              <CardDescription>Choose your preferred language for the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center space-x-2">
                 <p className="text-sm font-medium">Select Language:</p>
                <Button variant="outline">English</Button>
                <Button variant="ghost">తెలుగు</Button>
              </div>
              <Separator />
               <p className="text-sm text-muted-foreground">More settings will be available here in the future.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
