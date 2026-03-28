import { User } from '@supabase/supabase-js';
import { useAppKitAccount } from '@reown/appkit/react';

interface UserIdentity {
  displayName: string;
  initials: string;
  isWallet: boolean;
}

export const getUserIdentity = (user: User | null, walletAddress?: string): UserIdentity => {
  // 1. Display name from metadata
  const metaName = user?.user_metadata?.display_name || user?.user_metadata?.full_name;
  if (metaName) {
    return {
      displayName: metaName,
      initials: metaName.slice(0, 2).toUpperCase(),
      isWallet: false,
    };
  }

  // 2. Email
  if (user?.email) {
    return {
      displayName: user.email,
      initials: user.email.split('@')[0].slice(0, 2).toUpperCase(),
      isWallet: false,
    };
  }

  // 3. Wallet address — from AppKit or Supabase identity
  const addr =
    walletAddress ||
    user?.user_metadata?.address ||
    user?.identities?.find((i) => i.provider === 'web3' || i.provider === 'solana')
      ?.identity_data?.address;

  if (addr) {
    const truncated = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return {
      displayName: truncated,
      initials: addr.slice(0, 2).toUpperCase(),
      isWallet: true,
    };
  }

  // 4. Fallback
  return { displayName: 'Anon Degen', initials: 'AD', isWallet: false };
};

export const useUserIdentity = (user: User | null): UserIdentity => {
  const { address } = useAppKitAccount();
  return getUserIdentity(user, address || undefined);
};
