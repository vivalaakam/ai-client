import { PromptView } from '../components/PromptView';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.ts';
import { useParams } from 'react-router';
import { useCallback, useState } from 'react';
import type { PromptRecord } from '../types.ts';

export function PromptViewPage() {
  let params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: prompt, isPending } = useQuery({
    queryKey: [`prompt`, params.id],
    queryFn: () => (params.id ? api.promptsGet(params.id) : Promise.resolve(null)),
  });

  const onSave = useCallback(
    async (nextPrompt: Partial<PromptRecord>) => {
      if (!prompt?.id) {
        setError('Prompt is required');
        return;
      }

      if (!nextPrompt.content?.trim()) {
        setError('Prompt content is required');
        return;
      }
      setIsSaving(true);
      try {
        await api.promptsUpdate(prompt.id, nextPrompt.content, nextPrompt.tags ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save prompt');
      } finally {
        setIsSaving(false);
      }
    },
    [prompt]
  );

  if (isPending) {
    return <div>Loading prompt...</div>;
  }

  return <PromptView prompt={prompt} onSave={onSave} isSaving={isSaving} error={error} />;
}
