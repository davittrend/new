import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ScheduledPinsList } from '../components/Scheduler/ScheduledPinsList';

function ScheduledPinsPage() {
  return (
    <DashboardLayout>
      <ScheduledPinsList />
    </DashboardLayout>
  );
}

export default ScheduledPinsPage;