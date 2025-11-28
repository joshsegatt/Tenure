export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                <p className="text-xl text-slate-600 mb-2">Verification link not found</p>
                <p className="text-sm text-slate-500">
                    This link may have expired or is invalid
                </p>
            </div>
        </div>
    );
}
