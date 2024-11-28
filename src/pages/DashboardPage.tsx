import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { PinScheduler } from '../components/Scheduler/PinScheduler';

function DashboardPage() {
  return (
    <DashboardLayout>
      <PinScheduler />
    </DashboardLayout>
  );
}

export default DashboardPage;