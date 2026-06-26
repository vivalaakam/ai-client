---
name: page-pattern
description: >
  Use when creating a new section/page in this app, or refactoring an existing page
  to match the project's established pattern. Triggers on: "create a page for X",
  "add a new section", "make X page like prompts/config", "refactor Y page".
---

# Page Pattern — ai-client

This project uses a consistent layout pattern for all sections with a list sidebar + detail view.
The canonical reference is **Prompts** (fully migrated) and **Config** (also migrated).

## Pattern overview

```
/section                   ← SectionListPage  (Sider + Outlet layout)
/section/new               ← SectionNewPage
/section/:id               ← SectionViewPage
```

Each section has **5 pieces**:

| File | Role | Reference |
|---|---|---|
| `src/pages/SectionListPage.tsx` | Layout: `Sider` with sidebar list + `<Outlet />` | `PromptsList.tsx`, `ConfigPage.tsx` |
| `src/pages/SectionViewPage.tsx` | Fetches one item by param, renders view component | `PromptViewPage.tsx`, `ConfigViewPage.tsx` |
| `src/pages/SectionNewPage.tsx` | No fetch, renders view with `null`, navigates after create | `PromptNewPage.tsx`, `ConfigNewPage.tsx` |
| `src/components/SectionView/index.tsx` | Editor UI: receives `item \| null`, `onSave`, `isSaving`, `error` | `PromptView/index.tsx`, `ConfigView.tsx` |
| `src/components/SectionsView/index.tsx` | Index placeholder ("Select …") | `PromptsView/index.tsx`, `ConfigsView/index.tsx` |

## 1. List layout page (Sider + Outlet)

```tsx
// src/pages/SectionListPage.tsx
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SidebarList, SectionListItem } from '../components/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.ts';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

export function SectionListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: items, isPending, error, refetch } = useQuery({
    queryKey: ['section'],
    queryFn: () => api.sectionList(),
  });

  return (
    <>
      <Sider width={300}>
        <SidebarList
          items={items ?? []}
          renderItem={(item) => (
            <SectionListItem
              item={item}
              active={location.pathname === `/section/${item.id}`}
              onClick={() => navigate(`/section/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          onNew={() => navigate('/section/new')}
          newLabel="New …"
          onRefresh={refetch}
          loading={isPending}
          error={error}
          emptyText="No items yet"
        />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </>
  );
}
```

## 2. View page (existing item)

```tsx
// src/pages/SectionViewPage.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api.ts';
import { useParams } from 'react-router';
import { useCallback, useState } from 'react';
import { SectionView } from '../components/SectionView';
import type { SectionRecord } from '../types.ts';

export function SectionViewPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: item, isPending } = useQuery({
    queryKey: ['section', params.id],
    queryFn: () => (params.id ? api.sectionGet(params.id) : Promise.resolve(null)),
  });

  const onSave = useCallback(
    async (next: Partial<SectionRecord>) => {
      if (!item?.id) return;
      setIsSaving(true);
      try {
        await api.sectionUpdate(item.id, next);
        await queryClient.invalidateQueries({ queryKey: ['section'] });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save');
      } finally {
        setIsSaving(false);
      }
    },
    [item, queryClient]
  );

  if (isPending) return <div>Loading…</div>;

  return <SectionView item={item} onSave={onSave} isSaving={isSaving} error={error} />;
}
```

## 3. New page (create)

```tsx
// src/pages/SectionNewPage.tsx
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api.ts';
import { SectionView } from '../components/SectionView';
import type { SectionRecord } from '../types.ts';

export function SectionNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = useCallback(
    async (next: Partial<SectionRecord>) => {
      setIsSaving(true);
      try {
        const saved = await api.sectionCreate(next);
        await queryClient.invalidateQueries({ queryKey: ['section'] });
        navigate(`/section/${saved.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create');
      } finally {
        setIsSaving(false);
      }
    },
    [navigate, queryClient]
  );

  return <SectionView item={null} onSave={onSave} isSaving={isSaving} error={error} />;
}
```

## 4. View component (editor UI)

```tsx
// src/components/SectionView/index.tsx
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Row, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { SectionRecord } from '../../types';

interface SectionViewProps {
  item: SectionRecord | null | undefined;
  isSaving: boolean;
  error: string | null;
  onSave: (params: Partial<SectionRecord>) => void;
}

export function SectionView({ item, onSave, isSaving, error }: SectionViewProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(item?.value ?? '');
  }, [item]);

  const save = useCallback(() => onSave({ value }), [value, onSave]);

  return (
    <>
      <Row justify="space-between">
        <Typography.Title level={3}>
          {item ? item.name : 'New …'}
        </Typography.Title>
        <Button icon={<SaveOutlined />} loading={isSaving} type="primary" onClick={save}>
          {item ? 'Save' : 'Create'}
        </Button>
      </Row>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {/* fields here */}
    </>
  );
}
```

## 5. Index placeholder

```tsx
// src/components/SectionsView/index.tsx
export function SectionsView() {
  return <div className="prompts-view">Select …</div>;
}
```

## 6. Sidebar list item

```tsx
// src/components/Sidebar/SectionListItem.tsx
import type { SectionRecord } from '../../types.ts';
import { RowItem } from '../ui/RowItem';
import { FC } from 'react';

export interface SectionListItemProps {
  item: SectionRecord;
  active: boolean;
  onClick: () => void;
}

export const SectionListItem: FC<SectionListItemProps> = ({ item, active, onClick }) => (
  <RowItem head={item.name} value={item.description} isActive={active} onClick={onClick} />
);
```

Export it from `src/components/Sidebar/index.ts`.

## 7. Wire up in AppInner

In `src/AppInner.tsx`:

```tsx
// imports
import { SectionListPage } from './pages/SectionListPage.tsx';
import { SectionViewPage } from './pages/SectionViewPage.tsx';
import { SectionNewPage } from './pages/SectionNewPage.tsx';
import { SectionsView } from './components/SectionsView';

// view detection (add to the chain)
: location.pathname.startsWith('/section')
  ? 'section'

// sidebar — return null for this view (sidebar is inside the nested route)
if (view === 'prompts' || view === 'config' || view === 'section') {
  return null;
}

// routes
<Route path="/section" Component={SectionListPage}>
  <Route index Component={SectionsView} />
  <Route path="new" Component={SectionNewPage} />
  <Route path=":id" Component={SectionViewPage} />
</Route>

// activity bar button
<Tooltip title="Section" placement="right">
  <Button
    className={`activity-item ${location.pathname.startsWith('/section') ? 'active' : ''}`}
    onClick={() => navigate('/section')}
    type="text"
  >
    <SomeOutlined className="activity-icon" />
  </Button>
</Tooltip>
```

## Rules

- **No prop-drilling through AppInner.** List data lives in `useQuery` inside the layout page, not in AppInner state.
- **`useQueryClient.invalidateQueries`** after every mutation — both view and new pages do this.
- **New page navigates after create** (`navigate(\`/section/${saved.id}\`)`); view page stays in place.
- **View component is dumb** — no API calls, only receives props. All async logic lives in the page.
- **`queryKey` shape:** list → `['section']`, single → `['section', id]`. Invalidating `['section']` refetches both.
- **Sidebar is self-contained** inside the layout page — AppInner just renders `null` for the sidebar slot when this view is active.
