import React from 'react';
import { Download, Award, ShieldCheck, FileCheck, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { User as FirebaseUser } from 'firebase/auth';
import { motion } from 'framer-motion';

interface CertificateProps {
  user: FirebaseUser | null;
  onExport: () => void;
}

export const Certificate = ({ user, onExport }: CertificateProps) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
        >
          <PartyPopper size={48} className="text-primary-600" />
        </motion.div>
        <h2 className="text-4xl font-semibold text-secondary-900 tracking-tight">You're Election Ready!</h2>
        <p className="text-gray-500 mt-2 font-medium">Thank you for preparing to participate in the world's largest democracy.</p>
      </div>

      <div id="certificate-node">
        <Card className="border-4 border-double border-primary-200 relative overflow-hidden bg-gradient-to-b from-white to-primary-50/30">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award size={160} />
          </div>
          
          <CardContent className="p-12 text-center relative z-10">
            <div className="flex justify-center mb-8">
              <ShieldCheck size={48} className="text-secondary-500" />
            </div>
            
            <p className="text-sm font-medium text-primary-600 uppercase tracking-[0.3em] mb-4">Certificate of Readiness</p>
            <h3 className="text-3xl font-semibold text-secondary-900 mb-8">CivicPath AI Scholar</h3>
            
            <p className="text-gray-600 mb-6 font-medium">This acknowledges that</p>
            <div className="border-b-2 border-dashed border-gray-300 mx-auto w-2/3 pb-2 mb-6">
              <span className="text-2xl font-medium text-gray-900">
                {user?.displayName || "Informed Citizen"}
              </span>
            </div>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
              has successfully completed their interactive voter education, demonstrating a commitment to informed voting in the Republic of India.
            </p>

            <div className="flex justify-between items-end border-t border-gray-100 pt-8 px-4">
              <div className="text-left">
                <FileCheck size={24} className="text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">{currentDate}</p>
                <p className="text-[10px] text-gray-400">Date of Completion</p>
              </div>
              <div className="text-right">
                <p className="font-title text-2xl font-medium text-secondary-500 signature mb-1" style={{ fontFamily: 'cursive' }}>CivicPath AI</p>
                <p className="text-[10px] bg-secondary-50 text-secondary-600 px-2 py-1 rounded font-medium uppercase tracking-wide">Verified Digital Issuer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center gap-6 print:hidden">
        <Button onClick={onExport} size="lg" className="gap-2">
          <Download size={20} />
          Download PDF
        </Button>
      </div>
    </div>
  );
};
