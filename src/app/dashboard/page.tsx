import { getUserChecks } from '@/app/actions/checks';
import { UserButton } from '@clerk/nextjs';
import { NewCheckDialog } from '@/components/dashboard/new-check-dialog';
import { ChecksTable } from '@/components/dashboard/checks-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Shield, Clock } from 'lucide-react';

export default async function DashboardPage() {
    const result = await getUserChecks();
    const checks = result.success ? result.data : [];

    const stats = {
        total: checks.length,
        clear: checks.filter(c => c.status === 'clear').length,
        pending: checks.filter(c => c.status === 'pending').length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Tenure</h1>
                            <p className="text-sm text-slate-600 mt-1">Right-to-Rent Verification</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NewCheckDialog />
                            <UserButton afterSignOutUrl="/sign-in" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All verification requests
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Verified</CardTitle>
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.clear}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Passed verification
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Awaiting tenant upload
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Checks Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Checks</CardTitle>
                        <CardDescription>
                            View and manage all right-to-rent verification checks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChecksTable checks={checks} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
