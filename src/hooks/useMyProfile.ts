import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyProfile, type ProfileRow } from '@/lib/db/profiles';

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: () => fetchMyProfile(user!.id) as Promise<ProfileRow>,
    enabled: Boolean(user?.id),
  });
}
