import { ConfigView } from '../components/ConfigView';
import { useCallback, useState } from 'react';
import { api } from '../api.ts';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import type { AppConfigEntry } from '../types.ts';

export function ConfigNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = useCallback(
    async (next: Partial<AppConfigEntry>) => {
      if (!next.slug?.trim()) {
        setError('Config slug is required');
        return;
      }
      setIsSaving(true);
      try {
        const saved = await api.configSet(next.slug, next.value ?? '');
        await queryClient.invalidateQueries({ queryKey: ['config'] });
        navigate(`/config/${saved.slug}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save config');
      } finally {
        setIsSaving(false);
      }
    },
    [navigate, queryClient]
  );

  return <ConfigView entry={null} onSave={onSave} isSaving={isSaving} error={error} />;
}
