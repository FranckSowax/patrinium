import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Wrench,
  DollarSign,
  Package,
  Receipt,
  Bot,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Car,
  Landmark,
  ArrowRightLeft
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Inventaire du Patrimoine',
    items: [
      { id: 'cadastre', label: 'Biens Immobiliers', icon: Map },
      { id: 'inventaire', label: 'Biens Mobiliers', icon: Package },
      { id: 'vehicules', label: 'Parc Automobile', icon: Car },
      { id: 'concessions', label: 'Concessions & Domaines', icon: Landmark },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'affectations', label: 'Affectations', icon: ClipboardList },
      { id: 'maintenance', label: 'GMAO Maintenance', icon: Wrench },
      { id: 'loyers', label: 'Valorisation & Loyers', icon: DollarSign },
      { id: 'cessions', label: 'Cessions', icon: ArrowRightLeft },
      { id: 'charges', label: 'Charges Admin.', icon: Receipt },
    ],
  },
  {
    title: 'Outils',
    items: [
      { id: 'ia', label: 'Assistant IA & BI', icon: Bot },
    ],
  },
];

export function Layout({ children, activeModule, onModuleChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState(5);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg leading-tight">PATRINIUM</h1>
                <p className="text-xs text-slate-400">Gabon Patrimoine Digital</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-4"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              {sidebarOpen && (
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 mb-1">
                  {section.title}
                </p>
              )}
              {section.items.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    } ${!sidebarOpen && 'justify-center px-2'}`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive && 'animate-pulse'}`} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium whitespace-nowrap">{module.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400">Direction Générale</p>
                <p className="text-xs font-medium">du Patrimoine de l'État</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Rechercher un bien, une référence..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {notifications}
                </Badge>
              )}
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-slate-100 rounded-lg p-2 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                      DK
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900">Dr. Koumba</p>
                    <p className="text-xs text-slate-500">Directeur Général</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
