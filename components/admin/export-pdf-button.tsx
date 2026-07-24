'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportPdfButtonProps {
  reportTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function ExportPdfButton({
  reportTitle = 'Management Report',
  className,
  variant = 'outline',
  size = 'sm',
}: ExportPdfButtonProps) {
  const handleExportPdf = () => {
    const originalTitle = document.title;
    const formattedDate = new Date().toISOString().split('T')[0];
    const pdfFileName = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${formattedDate}`;

    // Set document title so print-to-PDF output file defaults to pdfFileName
    document.title = pdfFileName;

    // Trigger browser print dialog (Export to PDF)
    window.print();

    // Restore original page title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  return (
    <Button
      type='button'
      variant={variant}
      size={size}
      onClick={handleExportPdf}
      className={cn('no-print flex items-center gap-2 font-medium transition-all', className)}
      title='Export report as PDF'
    >
      <FileDown className='h-4 w-4 text-primary' />
      <span>Export PDF</span>
    </Button>
  );
}
