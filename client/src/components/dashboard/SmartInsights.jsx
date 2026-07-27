import React from 'react';
import { PieChart } from 'lucide-react';
import { formatValue } from '../../utils/formatters';

export default function SmartInsights({ netFlow, currency }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.2 }}>
        <PieChart size={120} />
      </div>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '8px' }}>Smart Insights</h4>
      <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5 }}>
        {netFlow > 0
          ? `You're doing great! You saved ${currency}${formatValue(netFlow, currency)} this month.`
          : `You spent ${currency}${formatValue(Math.abs(netFlow), currency)} more than you earned. Review your categories!`}
      </p>
    </div>
  );
}
