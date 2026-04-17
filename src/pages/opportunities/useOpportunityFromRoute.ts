import { useMemo } from 'react';
import { useParams } from 'wouter';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';

export function useOpportunityFromRoute() {
  const { id } = useParams();
  const { user } = useAuth();
  const { opportunities, patchOpportunity } = useCrmData();
  const opp = opportunities.find(o => o.id === id);

  const canAccess = useMemo(() => {
    if (!user || !opp) return false;
    if (user.role === 'admin' || user.role === 'owner') return true;
    return opp.ownerId === user.id;
  }, [user, opp]);

  return { id, opp, patchOpportunity, user, canAccess };
}
