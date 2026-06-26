import { Outlet, useLocation, useNavigate } from 'react-router';
import { PromptListItem, SidebarList } from '../components/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.ts';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

export function PromptsList() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: prompts,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: [`prompts`],
    queryFn: () => api.promptsList(),
  });

  return (
    <>
      <Sider width={300}>
        <SidebarList
          items={prompts ?? []}
          renderItem={(prompt) => (
            <PromptListItem
              prompt={prompt}
              active={location.pathname === `/prompts/${prompt.id}`}
              onClick={() => {
                navigate(`/prompts/${prompt.id}`);
              }}
            />
          )}
          keyExtractor={(prompt) => prompt.id}
          onNew={() => {
            navigate('/prompts/new');
          }}
          newLabel="New prompt"
          onRefresh={refetch}
          loading={isPending}
          error={error}
          emptyText="No prompts yet"
        />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </>
  );
}
