'use client';

import { Download, Printer } from 'lucide-react';
import { AnalysisResult } from '@/lib/domain/AnalysisTypes';

interface ExportButtonsProps {
  result: AnalysisResult;
}

export function ExportButtons({ result }: ExportButtonsProps) {
  const handleDownloadJSON = () => {
    if (!result) {
      return;
    }

    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-analysis-${result?.ticker ?? 'stock'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window?.print?.();
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-4 py-2 bg-ai-card hover:bg-gray-800 border border-gray-700 text-ai-text rounded-lg transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Download JSON</span>
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-ai-card hover:bg-gray-800 border border-gray-700 text-ai-text rounded-lg transition-colors"
      >
        <Printer className="h-4 w-4" />
        <span>Print Report</span>
      </button>
    </div>
  );
}
