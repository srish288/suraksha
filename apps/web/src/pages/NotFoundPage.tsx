import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-4 py-12">
      <div className="max-w-md space-y-5">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-safety-600 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
          <p className="text-xs text-slate-500">
            The requested safety portal section does not exist or has been relocated.
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="primary" icon={<Home className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
