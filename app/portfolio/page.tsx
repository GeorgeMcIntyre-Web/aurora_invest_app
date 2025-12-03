import Link from 'next/link';
import { Sparkles, Wallet } from 'lucide-react';
import { PortfolioDashboard } from '@/components/portfolio-dashboard';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-ai-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ai-card/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-ai-primary to-ai-accent rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ai-text">AuroraInvest</h1>
                <p className="text-sm text-ai-muted">Stock Analyzer</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ai-text hover:text-ai-accent bg-ai-background/50 rounded-lg border border-gray-700 hover:border-ai-accent transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Analysis
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ai-text hover:text-ai-accent transition-colors"
              >
                <Wallet className="h-4 w-4" />
                Portfolio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PortfolioDashboard />
      </main>
    </div>
  );
}
