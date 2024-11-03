// src/components/Staking/index.tsx
import StakeForm from './StakeForm';
import UnstakeForm from './UnstakeForm';
import ClaimRewards from './ClaimRewards';
import TransactionHistory from './TransactionHistory';
import StakingOverview from './StakingOverview';
import StakingRewards from './StakingRewards';

const Staking = () => {
  return (
    <div className="space-y-6">
      <StakingOverview />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StakeForm />
        <UnstakeForm />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClaimRewards />
        <StakingRewards />
      </div>
      
      <TransactionHistory />
    </div>
  );
};

export default Staking;
export {
  StakeForm,
  UnstakeForm,
  ClaimRewards,
  TransactionHistory,
  StakingOverview,
  StakingRewards
};