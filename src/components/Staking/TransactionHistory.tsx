// src/components/Staking/TransactionHistory.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  AnimatedNumber 
} from '../common';
import { useStaking } from '../../hooks/useStaking';
import { History, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim';
  amount: number;
  timestamp: number;
  tier: {
    name: string;
    level: number;
  };
  status: 'completed' | 'pending' | 'failed';
}

const TransactionHistory = () => {
  const { transactions } = useStaking();

  const getActionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'stake':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'unstake':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'claim':
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-6 h-6 text-primary" />
        <Typography.H3>Transaction History</Typography.H3>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Typography.Body>No transactions yet</Typography.Body>
          </div>
        ) : (
          transactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {getActionIcon(tx.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <Typography.Body className="capitalize">{tx.type}</Typography.Body>
                    <Badge variant={`tier${tx.tier.level}` as any}>
                      {tx.tier.name}
                    </Badge>
                  </div>
                  <Typography.Small className="text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </Typography.Small>
                </div>
              </div>
              
              <div className="text-right">
                <AnimatedNumber 
                  value={tx.amount} 
                  precision={4}
                  prefix="⟁ "
                />
                {getStatusBadge(tx.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionHistory;