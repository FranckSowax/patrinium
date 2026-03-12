import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { CadastreModule } from '@/components/CadastreModule';
import { AffectationsModule } from '@/components/AffectationsModule';
import { MaintenanceModule } from '@/components/MaintenanceModule';
import { LoyersModule } from '@/components/LoyersModule';
import { InventaireModule } from '@/components/InventaireModule';
import { ChargesModule } from '@/components/ChargesModule';
import { AIAssistantModule } from '@/components/AIAssistantModule';
import { VehiculesModule } from '@/components/VehiculesModule';
import { ConcessionsModule } from '@/components/ConcessionsModule';
import { CessionsModule } from '@/components/CessionsModule';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="biens-immobiliers" element={<CadastreModule />} />
        <Route path="biens-mobiliers" element={<InventaireModule />} />
        <Route path="vehicules" element={<VehiculesModule />} />
        <Route path="concessions" element={<ConcessionsModule />} />
        <Route path="affectations" element={<AffectationsModule />} />
        <Route path="maintenance" element={<MaintenanceModule />} />
        <Route path="loyers" element={<LoyersModule />} />
        <Route path="cessions" element={<CessionsModule />} />
        <Route path="charges" element={<ChargesModule />} />
        <Route path="assistant-ia" element={<AIAssistantModule />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
