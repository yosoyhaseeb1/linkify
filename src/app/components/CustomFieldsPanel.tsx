import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useOrganizationContext } from '../contexts/OrganizationContext';
import { Plus, X, Check, Calendar, Hash, Type, ChevronDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface CustomField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'currency';
  options: string[];
  is_required: boolean;
}

interface FieldValue {
  id: string;
  field_id: string;
  value: string;
  field: CustomField;
}

interface CustomFieldsPanelProps {
  prospectId: string;
  onFieldUpdate?: () => void;
}

export function CustomFieldsPanel({ prospectId, onFieldUpdate }: CustomFieldsPanelProps) {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganizationContext();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadFieldsAndValues();
    }
  }, [currentOrg?.id, prospectId]);

  const loadFieldsAndValues = async () => {
    if (!currentOrg?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await getToken();
      const headers = {
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-clerk-token': token || '',
      };

      // Load field definitions
      const fieldsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/custom-fields/${currentOrg.id}`,
        { headers }
      );
      
      // Load field values for this prospect
      const valuesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/custom-fields/${currentOrg.id}/values/${prospectId}`,
        { headers }
      );

      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        setFields(fieldsData.fields || []);
      }

      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        const valuesMap: Record<string, string> = {};
        (valuesData.values || []).forEach((v: FieldValue) => {
          valuesMap[v.field_id] = v.value;
        });
        setValues(valuesMap);
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFieldValue = async (fieldId: string, value: string) => {
    if (!currentOrg?.id) {
      return;
    }
    
    setSavingField(fieldId);
    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/custom-fields/${currentOrg.id}/values/${prospectId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fieldId, value })
        }
      );

      if (response.ok) {
        setValues(prev => ({ ...prev, [fieldId]: value }));
        onFieldUpdate?.();
      }
    } catch (error) {
      console.error('Error saving field value:', error);
    } finally {
      setSavingField(null);
    }
  };

  const renderFieldInput = (field: CustomField) => {
    const value = values[field.id] || '';
    const isSaving = savingField === field.id;

    const baseInputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-500/50";

    switch (field.field_type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => saveFieldValue(field.id, e.target.value)}
              className={`${baseInputClass} appearance-none pr-8`}
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => saveFieldValue(field.id, e.target.value)}
            className={baseInputClass}
          />
        );

      case 'number':
      case 'currency':
        return (
          <div className="relative">
            {field.field_type === 'currency' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
            )}
            <input
              type="number"
              value={value}
              onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
              onBlur={(e) => saveFieldValue(field.id, e.target.value)}
              placeholder="0"
              className={`${baseInputClass} ${field.field_type === 'currency' ? 'pl-7' : ''}`}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            onBlur={(e) => saveFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}...`}
            className={baseInputClass}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-white/10 rounded w-1/4 mb-2" />
            <div className="h-10 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-6 text-white/40">
        <p className="text-sm">No custom fields defined</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="flex items-center gap-2 text-white/60 text-xs mb-1">
            {field.field_type === 'text' && <Type className="w-3 h-3" />}
            {field.field_type === 'number' && <Hash className="w-3 h-3" />}
            {field.field_type === 'currency' && <span className="text-xs">💰</span>}
            {field.field_type === 'date' && <Calendar className="w-3 h-3" />}
            {field.field_type === 'select' && <ChevronDown className="w-3 h-3" />}
            {field.field_label}
            {field.is_required && <span className="text-red-400">*</span>}
            {savingField === field.id && (
              <span className="ml-auto text-cyan-400 text-xs">Saving...</span>
            )}
          </label>
          {renderFieldInput(field)}
        </div>
      ))}
    </div>
  );
}

export default CustomFieldsPanel;