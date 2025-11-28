'use client';

import { useState } from 'react';
import { createCheck } from '@/app/actions/checks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

export function NewCheckDialog() {
    const [isCreating, setIsCreating] = useState(false);
    const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreateCheck = async () => {
        setIsCreating(true);
        try {
            const result = await createCheck();

            if (result.success) {
                setVerifyUrl(result.data.verifyUrl);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to create check');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = async () => {
        if (verifyUrl) {
            await navigator.clipboard.writeText(verifyUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (verifyUrl) {
        return (
            <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                    <CardTitle className="text-emerald-900">Verification Link Created</CardTitle>
                    <CardDescription className="text-emerald-700">
                        Share this link with your tenant to complete their right-to-rent verification
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={verifyUrl}
                            className="flex-1 px-3 py-2 text-sm border border-emerald-300 rounded-md bg-white"
                        />
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            size="icon"
                            className="border-emerald-300 hover:bg-emerald-100"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button
                        onClick={() => setVerifyUrl(null)}
                        variant="outline"
                        className="w-full"
                    >
                        Create Another Check
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Button
            onClick={handleCreateCheck}
            disabled={isCreating}
            size="lg"
            className="bg-slate-900 hover:bg-slate-800"
        >
            {isCreating ? 'Creating...' : 'New Check'}
        </Button>
    );
}
