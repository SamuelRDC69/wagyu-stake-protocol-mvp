// src/components/Settings/AccountSettings.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Badge,
  Tooltip 
} from '../common';
import { useSettings } from '../../hooks/useSettings';
import { 
  User, 
  Shield,
  Key,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';

const AccountSettings = () => {
  const { 
    accountInfo, 
    updateAccount,
    generateBackup,
    linkWallet
  } = useSettings();

  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const handleBackup = async () => {
    setIsGeneratingBackup(true);
    try {
      await generateBackup();
    } catch (error) {
      console.error('Failed to generate backup:', error);
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  const handleLinkWallet = async () => {
    setIsLinking(true);
    try {
      await linkWallet();
    } catch (error) {
      console.error('Failed to link wallet:', error);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <Typography.H3>Account Settings</Typography.H3>
        </div>
        <Badge variant={accountInfo.status === 'verified' ? 'success' : 'warning'}>
          {accountInfo.status === 'verified' ? 'Verified' : 'Unverified'}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="space-y-4">
          <div>
            <Typography.Label>Account ID</Typography.Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
                {accountInfo.accountId}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(accountInfo.accountId)}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <Typography.Label>Wallet Address</Typography.Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
                {accountInfo.walletAddress}
              </div>
              <Button
                variant={accountInfo.status === 'verified' ? 'ghost' : 'primary'}
                size="sm"
                onClick={handleLinkWallet}
                isLoading={isLinking}
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                {accountInfo.status === 'verified' ? 'Change' : 'Link Wallet'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <Typography.Label>Security Settings</Typography.Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-primary" />
                <div>
                  <Typography.Body>Two-Factor Authentication</Typography.Body>
                  <Typography.Small className="text-gray-500">
                    Additional security for your account
                  </Typography.Small>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {accountInfo.twoFactorEnabled ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Typography.Small className="text-green-500">Enabled</Typography.Small>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <Button
                      variant="warning"
                      size="sm"
                    >
                      Enable 2FA
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <Typography.Body>Account Backup</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Generate backup codes for account recovery
                </Typography.Small>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackup}
                isLoading={isGeneratingBackup}
              >
                Generate Backup
              </Button>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div>
          <Typography.Label className="mb-4">Connected Accounts</Typography.Label>
          <div className="space-y-3">
            {accountInfo.connectedAccounts.map((account, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {account.icon}
                  <div>
                    <Typography.Body>{account.name}</Typography.Body>
                    <Typography.Small className="text-gray-500">
                      Connected {account.connectedDate}
                    </Typography.Small>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 border border-red-500/20 rounded-lg">
          <Typography.Label className="text-red-500 mb-4">Danger Zone</Typography.Label>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Typography.Body>Deactivate Account</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Temporarily disable your account
                </Typography.Small>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
              >
                Deactivate
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <Typography.Body>Delete Account</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Permanently delete your account and data
                </Typography.Small>
              </div>
              <Tooltip content="Please deactivate your account first">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!accountInfo.canDelete}
                >
                  Delete
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountSettings;