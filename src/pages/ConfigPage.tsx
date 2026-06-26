import { Outlet, useLocation, useNavigate } from 'react-router';
import { ConfigListItem, SidebarList } from '../components/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.ts';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

export function ConfigPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: entries, isPending, error, refetch } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.configList(),
  });

  return (
    <>
      <Sider width={300}>
        <SidebarList
          items={entries ?? []}
          renderItem={(entry) => (
            <ConfigListItem
              entry={entry}
              active={location.pathname === `/config/${entry.slug}`}
              onClick={() => navigate(`/config/${entry.slug}`)}
            />
          )}
          keyExtractor={(entry) => entry.slug}
          onNew={() => navigate('/config/new')}
          newLabel="New config"
          onRefresh={refetch}
          loading={isPending}
          error={error}
          emptyText="No config entries yet"
        />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </>
  );
}
