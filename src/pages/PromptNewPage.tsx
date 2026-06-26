import { PromptView } from '../components/PromptView';
import { useCallback, useState } from 'react';
import { api } from '../api.ts';
import type { PromptRecord } from '../types.ts';

export function PromptNewPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = useCallback(
    async (nextPrompt: Partial<PromptRecord>) => {
      if (!nextPrompt.content?.trim()) {
        setError('Prompt content is required');
        return;
      }
      setIsSaving(true);
      try {
        await api.promptsCreate(nextPrompt.content, nextPrompt.tags ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save prompt');
      } finally {
        setIsSaving(false);
      }
    },
    [prompt]
  );

  return <PromptView prompt={null} onSave={onSave} isSaving={isSaving} error={error} />;
}
