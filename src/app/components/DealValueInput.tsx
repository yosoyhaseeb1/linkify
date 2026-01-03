import React, { useState, useEffect } from 'react';
import { DollarSign, Euro, PoundSterling, Check } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface DealValueInputProps {
  prospectId: string;
  initialValue?: number;
  initialCurrency?: string;
  onUpdate?: (value: number, currency: string) => void;
  compact?: boolean;
}

const currencies = [
  { code: 'USD', symbol: '$', icon: DollarSign },
  { code: 'EUR', symbol: '€', icon: Euro },
  { code: 'GBP', symbol: '£', icon: PoundSterling },
];

export function DealValueInput({ 
  prospectId, 
  initialValue = 0, 
  initialCurrency = 'USD',
  onUpdate,
  compact = false 
}: DealValueInputProps) {
  const { getToken } = useAuth();
  const [value, setValue] = useState(initialValue.toString());
  const [currency, setCurrency] = useState(initialCurrency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    setValue(initialValue.toString());
    setCurrency(initialCurrency);
  }, [initialValue, initialCurrency]);

  const saveDealValue = async () => {
    const numValue = parseFloat(value) || 0;
    setSaving(true);
    
    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/prospects/${prospectId}/deal`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dealValue: numValue,
            currency: currency,
          })
        }
      );
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onUpdate?.(numValue, currency);
      }
    } catch (error) {
      console.error('Error saving deal value:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(value) || 0;
    if (numValue !== initialValue || currency !== initialCurrency) {
      saveDealValue();
    }
  };

  const formatDisplayValue = () => {
    const numValue = parseFloat(value) || 0;
    const currencyData = currencies.find(c => c.code === currency) || currencies[0];
    return `${currencyData.symbol}${numValue.toLocaleString()}`;
  };

  const CurrencyIcon = currencies.find(c => c.code === currency)?.icon || DollarSign;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 text-green-400 font-medium">
        <CurrencyIcon className="w-4 h-4" />
        <span>{parseFloat(value).toLocaleString() || '0'}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-white/60 text-xs mb-1">Deal Value</label>
      <div className="flex items-center gap-2">
        {/* Currency Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
            className="flex items-center gap-1 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <CurrencyIcon className="w-4 h-4" />
            <span className="text-xs">{currency}</span>
          </button>
          
          {showCurrencyPicker && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setShowCurrencyPicker(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                    currency === curr.code ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                  }`}
                >
                  <curr.icon className="w-4 h-4" />
                  <span className="text-sm">{curr.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Value Input */}
        <div className="relative flex-1">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            placeholder="0"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-500/50 pr-8"
          />
          {saving && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {saved && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DealValueInput;