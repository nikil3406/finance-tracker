import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Edit3, Trash2 } from 'lucide-react';
import { formatValue } from '../../utils/formatters';

export default function RecentTransactions({
  data,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  currency,
  loading,
  onEdit,
  onDelete,
}) {
  const incomeItems = Array.isArray(data?.income) ? data.income.map((i) => ({ ...i, type: 'income' })) : [];
  const expenseItems = Array.isArray(data?.expense) ? data.expense.map((e) => ({ ...e, type: 'expense' })) : [];
  
  const allTransactions = [...incomeItems, ...expenseItems]
    .sort((a, b) => {
      const dateA = new Date(String(a.date).replace(' ', 'T'));
      const dateB = new Date(String(b.date).replace(' ', 'T'));
      return (isNaN(dateB.getTime()) ? 0 : dateB.getTime()) - (isNaN(dateA.getTime()) ? 0 : dateA.getTime());
    })
    .filter((item) =>
      String(item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="glass-card" style={{ padding: '32px', minWidth: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Transactions</h3>
        <div style={{ position: 'relative', width: '240px' }}>
          <input
            className="input-field"
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading transactions...
        </div>
      ) : allTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No transactions found
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
            {paginatedTransactions.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.03)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '0' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.type === 'income' ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {item.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div style={{ minWidth: '0' }}>
                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {String(item.date).split(' ')[0]} • {item.category || 'Uncategorized'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div
                    style={{
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      color: item.type === 'income' ? 'var(--success)' : 'white',
                    }}
                  >
                    {item.type === 'income' ? '+' : '-'}
                    {currency}
                    {formatValue(Number(item.amount) || 0, currency)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onEdit(item.type, item)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => prev - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="input-field"
                style={{
                  width: 'auto',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                Prev
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="input-field"
                style={{
                  width: 'auto',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
