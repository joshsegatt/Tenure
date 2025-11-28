/**
 * Inngest API Route Handler
 * 
 * Serves Inngest functions via Vercel serverless
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { analyzeDocument } from '@/inngest/functions/analyze';

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        analyzeDocument,
    ],
});
