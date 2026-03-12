import { useState } from 'react';
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
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'cadastre':
        return <CadastreModule />;
      case 'affectations':
        return <AffectationsModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'loyers':
        return <LoyersModule />;
      case 'inventaire':
        return <InventaireModule />;
      case 'vehicules':
        return <VehiculesModule />;
      case 'concessions':
        return <ConcessionsModule />;
      case 'cessions':
        return <CessionsModule />;
      case 'charges':
        return <ChargesModule />;
      case 'ia':
        return <AIAssistantModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeModule={activeModule} onModuleChange={setActiveModule}>
      {renderModule()}
    </Layout>
  );
}

export default App;
