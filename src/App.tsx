import { App as AntApp, ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router';
import { AppInner } from './AppInner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6c5ce7',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntApp>
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </AntApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
