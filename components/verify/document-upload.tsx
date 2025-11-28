'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateUploadUrl } from '@/app/actions/checks';
import { inngest } from '@/lib/inngest';

interface DocumentUploadProps {
    checkId: string;
    onUploadComplete: () => void;
}

export function DocumentUpload({ checkId, onUploadComplete }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            // Get presigned URL
            const result = await generateUploadUrl(checkId, file.name, file.type);

            if (!result.success) {
                alert(result.error);
                return;
            }

            // Upload to R2
            const uploadResponse = await fetch(result.data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            // Trigger Inngest analysis (in production, this would be automatic via webhook)
            // For now, we'll just mark as complete
            onUploadComplete();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6">
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-slate-400'}
              ${file ? 'bg-slate-50' : ''}
            `}
                    >
                        <input {...getInputProps()} />

                        {file ? (
                            <div className="space-y-2">
                                <FileText className="h-12 w-12 mx-auto text-emerald-600" />
                                <p className="font-medium text-slate-900">{file.name}</p>
                                <p className="text-sm text-slate-600">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="h-12 w-12 mx-auto text-slate-400" />
                                <p className="font-medium text-slate-900">
                                    {isDragActive ? 'Drop your document here' : 'Upload your document'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Drag & drop or click to select
                                </p>
                                <p className="text-xs text-slate-500">
                                    Passport, ID card, or visa (PDF, JPG, PNG)
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {file && (
                <div className="flex gap-2">
                    <Button
                        onClick={() => setFile(null)}
                        variant="outline"
                        className="flex-1"
                        disabled={uploading}
                    >
                        Choose Different File
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Document'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
