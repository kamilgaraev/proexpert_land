interface FinancialCardProps {
  balance: number;
  credits: number;
  debits: number;
}

const FinancialCard: React.FC<FinancialCardProps> = ({ balance, credits, debits }) => {
  const format = (v: number) => v.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-medium text-steel-600 mb-3">Финансовый баланс</h3>
      <p className="text-4xl font-bold text-steel-900 mb-4">{format(balance)}</p>
      <div className="flex justify-between text-sm">
        <div className="text-earth-600">+ {format(credits)}
          <span className="block text-steel-500">Поступления за месяц</span>
        </div>
        <div className="text-construction-600">- {format(debits)}
          <span className="block text-steel-500">Списания за месяц</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialCard; 