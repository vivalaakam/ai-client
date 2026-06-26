import { ConfigView } from '../components/ConfigView';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api.ts';
import { useParams } from 'react-router';
import { useCallback, useState } from 'react';
import type { AppConfigEntry } from '../types.ts';

export function ConfigViewPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: entry, isPending } = useQuery({
    queryKey: ['config', params.slug],
    queryFn: () => (params.slug ? api.configGet(params.slug) : Promise.resolve(null)),
  });

  const onSave = useCallback(
    async (next: Partial<AppConfigEntry>) => {
      if (!entry?.slug) return;
      setIsSaving(true);
      try {
        await api.configSet(entry.slug, next.value ?? '');
        await queryClient.invalidateQueries({ queryKey: ['config'] });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save config');
      } finally {
        setIsSaving(false);
      }
    },
    [entry, queryClient]
  );

  if (isPending) return <div>Loading config...</div>;

  return <ConfigView entry={entry} onSave={onSave} isSaving={isSaving} error={error} />;
}
