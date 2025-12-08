'use client';

import { useState } from 'react';
import { Shield, TrendingUp, DollarSign, Clock, Target, Zap } from 'lucide-react';

export interface InvestmentProfile {
  riskTolerance: 'low' | 'moderate' | 'high';
  investmentHorizon: '1-3 years' | '5-10 years' | '10+ years';
  investmentObjective: 'growth' | 'income' | 'balanced';
}

interface InvestmentProfileSelectorProps {
  value: InvestmentProfile;
  onChange: (profile: InvestmentProfile) => void;
  disabled?: boolean;
}

const RISK_OPTIONS = [
  {
    value: 'low' as const,
    label: 'Conservative',
    description: 'Prefer stability, avoid volatility, preserve capital',
    icon: Shield,
    color: 'blue',
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    description: 'Balance growth and stability, tolerate some fluctuation',
    icon: Zap,
    color: 'yellow',
  },
  {
    value: 'high' as const,
    label: 'Aggressive',
    description: 'Maximize growth, comfortable with volatility',
    icon: TrendingUp,
    color: 'red',
  },
];

const HORIZON_OPTIONS = [
  {
    value: '1-3 years' as const,
    label: 'Short Term',
    description: '1-3 Years',
    detail: 'Need access to funds soon',
    icon: Clock,
  },
  {
    value: '5-10 years' as const,
    label: 'Medium Term',
    description: '5-10 Years',
    detail: 'Building wealth steadily',
    icon: Target,
  },
  {
    value: '10+ years' as const,
    label: 'Long Term',
    description: '10+ Years',
    detail: 'Retirement or distant goals',
    icon: DollarSign,
  },
];

const OBJECTIVE_OPTIONS = [
  {
    value: 'growth' as const,
    label: 'Growth',
    description: 'Capital appreciation, compound wealth',
    detail: 'Focus on stock price increases',
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    value: 'income' as const,
    label: 'Income',
    description: 'Generate regular dividends and cash flow',
    detail: 'Focus on dividend-paying stocks',
    icon: DollarSign,
    color: 'blue',
  },
  {
    value: 'balanced' as const,
    label: 'Balanced',
    description: 'Blend of growth and income strategies',
    detail: 'Mix of appreciation and dividends',
    icon: Target,
    color: 'purple',
  },
];

export function InvestmentProfileSelector({
  value,
  onChange,
  disabled = false,
}: InvestmentProfileSelectorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleChange = (field: keyof InvestmentProfile, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="space-y-6">
      {/* Risk Tolerance */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {RISK_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = value.riskTolerance === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('riskTolerance', option.value)}
                disabled={disabled}
                className={`relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isSelected ? 'text-emerald-400' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{option.description}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Investment Horizon */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Investment Horizon
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {HORIZON_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = value.investmentHorizon === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('investmentHorizon', option.value)}
                disabled={disabled}
                className={`relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isSelected ? 'text-emerald-400' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-300 mt-0.5">{option.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.detail}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Investment Objective */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Investment Objective
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {OBJECTIVE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = value.investmentObjective === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('investmentObjective', option.value)}
                disabled={disabled}
                className={`relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isSelected ? 'text-emerald-400' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{option.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{option.detail}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Presets (Optional Enhancement) */}
      <div className="pt-4 border-t border-slate-700">
        <div className="text-xs text-gray-500 mb-2">Quick Presets:</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                riskTolerance: 'low',
                investmentHorizon: '1-3 years',
                investmentObjective: 'income',
              })
            }
            disabled={disabled}
            className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛡️ Conservative Saver
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                riskTolerance: 'moderate',
                investmentHorizon: '5-10 years',
                investmentObjective: 'balanced',
              })
            }
            disabled={disabled}
            className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚖️ Balanced Investor
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                riskTolerance: 'high',
                investmentHorizon: '10+ years',
                investmentObjective: 'growth',
              })
            }
            disabled={disabled}
            className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Growth Seeker
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                riskTolerance: 'low',
                investmentHorizon: '10+ years',
                investmentObjective: 'income',
              })
            }
            disabled={disabled}
            className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💰 Dividend Hunter
          </button>
        </div>
      </div>
    </div>
  );
}
