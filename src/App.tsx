import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/layout/AppLayout';
import TopologyCanvas from './components/topology/TopologyCanvas';
import PowerEfficiency from './components/panels/PowerEfficiency';
import TestSuitePanel from './components/reserved/TestSuitePanel';
import OptimizationPanel from './components/reserved/OptimizationPanel';
import DesignCanvas from './components/design/DesignCanvas';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<TopologyCanvas />} />
            <Route path="/design" element={<DesignCanvas />} />
            <Route path="/efficiency" element={<PowerEfficiency />} />
            <Route path="/test" element={<TestSuitePanel />} />
            <Route path="/optimize" element={<OptimizationPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
