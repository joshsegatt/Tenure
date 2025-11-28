import { getCheckByToken } from '@/app/actions/checks';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUpload } from '@/components/verify/document-upload';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Clock, Upload as UploadIcon } from 'lucide-react';

interface VerifyPageProps {
    params: {
        token: string;
    };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const result = await getCheckByToken(params.token);

    if (!result.success) {
        notFound();
    }

    const { id, status } = result.data;

    const getStatusDisplay = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: <UploadIcon className="h-12 w-12 text-slate-600" />,
                    title: 'Upload Your Document',
                    description: 'Please upload a valid proof of right-to-rent document',
                    badge: <Badge variant="pending">Pending Upload</Badge>,
                    showUpload: true
                };
            case 'analyzing':
                return {
                    icon: <Clock className="h-12 w-12 text-yellow-600 animate-pulse" />,
                    title: 'Analyzing Document',
                    description: 'We\'re verifying your document. This usually takes a few moments.',
                    badge: <Badge variant="warning">Analyzing</Badge>,
                    showUpload: false
                };
            case 'clear':
                return {
                    icon: <CheckCircle className="h-12 w-12 text-emerald-600" />,
                    title: 'Verification Complete',
                    description: 'Your right-to-rent status has been verified successfully.',
                    badge: <Badge variant="success">Verified</Badge>,
                    showUpload: false
                };
            case 'rejected':
                return {
                    icon: <XCircle className="h-12 w-12 text-red-600" />,
                    title: 'Verification Failed',
                    description: 'We couldn\'t verify your document. Please contact your landlord.',
                    badge: <Badge variant="destructive">Rejected</Badge>,
                    showUpload: false
                };
            default:
                return {
                    icon: <Shield className="h-12 w-12 text-slate-600" />,
                    title: 'Verification',
                    description: 'Right-to-rent verification',
                    badge: <Badge variant="outline">{status}</Badge>,
                    showUpload: false
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Tenure</h1>
                    <p className="text-slate-600">Right-to-Rent Verification</p>
                </div>

                {/* Status Card */}
                <Card className="mb-6">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            {statusDisplay.icon}
                        </div>
                        <div className="flex justify-center mb-2">
                            {statusDisplay.badge}
                        </div>
                        <CardTitle className="text-2xl">{statusDisplay.title}</CardTitle>
                        <CardDescription className="text-base">
                            {statusDisplay.description}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Upload Section */}
                {statusDisplay.showUpload && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Requirements</CardTitle>
                            <CardDescription>
                                Please upload one of the following documents:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm text-slate-700 mb-6">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Valid UK or Irish passport</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Biometric Residence Permit (BRP)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Valid visa with right-to-rent endorsement</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Share code from gov.uk (screenshot accepted)</span>
                                </li>
                            </ul>

                            <DocumentUpload
                                checkId={id}
                                onUploadComplete={() => window.location.reload()}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-slate-600">
                    <p>Your data is encrypted and handled securely</p>
                    <p className="mt-1">Powered by Tenure</p>
                </div>
            </div>
        </div>
    );
}
