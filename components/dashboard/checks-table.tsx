'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface Check {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    magicToken: string;
}

interface ChecksTableProps {
    checks: Check[];
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'clear':
            return <Badge variant="success">Clear</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'analyzing':
            return <Badge variant="warning">Analyzing</Badge>;
        case 'pending':
            return <Badge variant="pending">Pending Upload</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export function ChecksTable({ checks }: ChecksTableProps) {
    if (checks.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No checks yet</p>
                <p className="text-sm mt-1">Create your first right-to-rent check to get started</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Verification Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {checks.map((check) => (
                        <TableRow key={check.id}>
                            <TableCell>{getStatusBadge(check.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(check.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(check.updatedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                    /verify/{check.magicToken.slice(0, 8)}...
                                </code>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
