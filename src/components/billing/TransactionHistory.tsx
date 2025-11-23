import { useState, useEffect, useCallback } from 'react';
import { billingService, BalanceTransaction, PaginatedBalanceTransactions, ErrorResponse, OrganizationBalance } from '@/utils/api';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
  balance?: OrganizationBalance | null;
}

const TransactionHistory = ({ balance }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedBalanceTransactions['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await billingService.getBalanceTransactions(page, 10);
      if (response.status === 200) {
        const paginatedData = response.data as PaginatedBalanceTransactions;
        setTransactions(paginatedData.data);
        setPagination(paginatedData.meta);
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        throw new Error(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить историю транзакций.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpIcon className="w-4 h-4 text-emerald-600" />;
      case 'debit':
        return <ArrowDownIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
      case 'debit':
        return 'bg-orange-50 text-orange-700 hover:bg-orange-100';
      default:
        return 'bg-slate-50 text-slate-700 hover:bg-slate-100';
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">История транзакций</CardTitle>
          <CardDescription>Последние операции по счету</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
           <ReceiptRefundIcon className="w-5 h-5 text-muted-foreground" />
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-orange-400 mx-auto mb-3" />
            <p className="text-orange-600">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <ReceiptRefundIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Транзакции не найдены</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="group">
                      <TableCell>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getTransactionColor(transaction.type).split(' ')[0])}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description || 'Транзакция'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-bold",
                          transaction.type === 'credit' ? 'text-emerald-600' : 'text-foreground'
                        )}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {transaction.amount_formatted} {balance?.currency || 'RUB'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */} 
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2 bg-secondary/50 p-1 rounded-xl">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        page === currentPage
                          ? "bg-white text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

