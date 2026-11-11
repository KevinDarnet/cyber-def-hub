import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomDock from './BottomDock';
import SubjectWorkspaceModal from '../views/SubjectWorkspaceModal';
import BackupSyncModal from '../views/BackupSyncModal';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="os-backdrop min-h-screen min-h-[100dvh] w-full">
      <div className="mx-auto flex items-start max-w-[1780px] gap-5 p-3 sm:p-4 lg:p-5">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        <main className="min-w-0 flex-1">
          <TopBar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <Outlet />
        </main>
      </div>

      {/* Modal de Espacio de Estudio por Materia */}
      <SubjectWorkspaceModal />

      {/* Modal de Almacenamiento y Backup */}
      <BackupSyncModal />

      {/* Dock Rápido Inferior OS */}
      <BottomDock />
    </div>
  );
};

export default DashboardLayout;
