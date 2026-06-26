import { App as AntApp, ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { AppInner } from './AppInner';

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
      <AntApp>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
