import type { ComponentType } from 'react';
import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/Login';
import OnboardingPage from '@/pages/Onboarding';
import AdminDashboard from '@/pages/AdminDashboard';
import OwnerDashboard from '@/pages/OwnerDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import LeadsPage from '@/pages/Leads';
import ContactDetailPage from '@/pages/ContactDetail';
import InboxPage from '@/pages/Inbox';
import MeetingBriefPage from '@/pages/MeetingBrief';
import MeetingNotesPage from '@/pages/MeetingNotes';
import IntelligencePage from '@/pages/Intelligence';
import PerformancePage from '@/pages/Performance';
import AdminUsersPage from '@/pages/AdminUsers';
import AdminAgentsPage from '@/pages/AdminAgents';
import AdminAgentsOverview from '@/pages/admin/AdminAgentsOverview';
import AdminAgentFollowUp from '@/pages/admin/AdminAgentFollowUp';
import AdminAgentChat from '@/pages/admin/AdminAgentChat';
import AdminAgentTracking from '@/pages/admin/AdminAgentTracking';
import AdminAgentRefund from '@/pages/admin/AdminAgentRefund';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminAutomationTriggers from '@/pages/admin/AdminAutomationTriggers';
import AdminAutomationIntervention from '@/pages/admin/AdminAutomationIntervention';
import AdminAutomationActivity from '@/pages/admin/AdminAutomationActivity';
import AdminChannelsPage from '@/pages/AdminChannels';
import AdminTemplatesPage from '@/pages/AdminTemplates';
import AdminRulesPage from '@/pages/AdminRules';
import AdminBillingPage from '@/pages/AdminBilling';
import OwnerAutomationOverview from '@/pages/owner/automation/OwnerAutomationOverview';
import OwnerAgentFollowUp from '@/pages/owner/automation/OwnerAgentFollowUp';
import OwnerAgentChat from '@/pages/owner/automation/OwnerAgentChat';
import OwnerAgentTracking from '@/pages/owner/automation/OwnerAgentTracking';
import OwnerAgentRefund from '@/pages/owner/automation/OwnerAgentRefund';

function ProtectedRoute({
  component: Component,
  roles,
}: {
  component: ComponentType;
  roles?: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center"><span className="text-[#9999AA] text-[14px]">Loading...</span></div>;
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role)) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Redirect to={dest} />;
  }
  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center"><span className="text-[#9999AA] text-[14px]">Loading...</span></div>;

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingPage} />

      {/* Root redirect */}
      <Route path="/">
        {user
          ? <Redirect to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />
          : <Redirect to="/login" />}
      </Route>

      {/* Admin-only routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} roles={['admin']} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} roles={['admin']} />
      </Route>
      <Route path="/admin/notifications">
        <ProtectedRoute component={AdminNotifications} roles={['admin']} />
      </Route>
      <Route path="/admin/automation/triggers">
        <ProtectedRoute component={AdminAutomationTriggers} roles={['admin']} />
      </Route>
      <Route path="/admin/automation/intervention">
        <ProtectedRoute component={AdminAutomationIntervention} roles={['admin']} />
      </Route>
      <Route path="/admin/automation/activity">
        <ProtectedRoute component={AdminAutomationActivity} roles={['admin']} />
      </Route>
      <Route path="/admin/agents/followup">
        <ProtectedRoute component={AdminAgentFollowUp} roles={['admin']} />
      </Route>
      <Route path="/admin/agents/chat">
        <ProtectedRoute component={AdminAgentChat} roles={['admin']} />
      </Route>
      <Route path="/admin/agents/tracking">
        <ProtectedRoute component={AdminAgentTracking} roles={['admin']} />
      </Route>
      <Route path="/admin/agents/refund">
        <ProtectedRoute component={AdminAgentRefund} roles={['admin']} />
      </Route>
      <Route path="/admin/agents/workspace">
        <ProtectedRoute component={AdminAgentsPage} roles={['admin']} />
      </Route>
      <Route path="/admin/agents">
        <ProtectedRoute component={AdminAgentsOverview} roles={['admin']} />
      </Route>
      <Route path="/admin/channels">
        <ProtectedRoute component={AdminChannelsPage} roles={['admin']} />
      </Route>
      <Route path="/admin/templates">
        <ProtectedRoute component={AdminTemplatesPage} roles={['admin']} />
      </Route>
      <Route path="/admin/rules">
        <ProtectedRoute component={AdminRulesPage} roles={['admin']} />
      </Route>
      <Route path="/admin/billing">
        <ProtectedRoute component={AdminBillingPage} roles={['admin']} />
      </Route>

      {/* Owner automation (business-level prompts & content) */}
      <Route path="/automation/followup">
        <ProtectedRoute component={OwnerAgentFollowUp} roles={['owner']} />
      </Route>
      <Route path="/automation/chat">
        <ProtectedRoute component={OwnerAgentChat} roles={['owner']} />
      </Route>
      <Route path="/automation/tracking">
        <ProtectedRoute component={OwnerAgentTracking} roles={['owner']} />
      </Route>
      <Route path="/automation/refund">
        <ProtectedRoute component={OwnerAgentRefund} roles={['owner']} />
      </Route>
      <Route path="/automation">
        <ProtectedRoute component={OwnerAutomationOverview} roles={['owner']} />
      </Route>

      {/* Owner/Agent shared routes */}
      <Route path="/dashboard">
        {() => {
          if (!user) return <Redirect to="/login" />;
          if (user.role === 'owner') return <OwnerDashboard />;
          if (user.role === 'agent') return <AgentDashboard />;
          return <Redirect to="/admin/dashboard" />;
        }}
      </Route>

      {/* Shared authenticated routes */}
      <Route path="/leads">
        <ProtectedRoute component={LeadsPage} />
      </Route>
      <Route path="/leads/:id">
        <ProtectedRoute component={ContactDetailPage} />
      </Route>
      <Route path="/inbox">
        <ProtectedRoute component={InboxPage} />
      </Route>
      <Route path="/meetings/brief/:id">
        <ProtectedRoute component={MeetingBriefPage} />
      </Route>
      <Route path="/meetings/notes/:id">
        <ProtectedRoute component={MeetingNotesPage} />
      </Route>

      {/* Intelligence & Performance (admin/owner) */}
      <Route path="/intelligence">
        <ProtectedRoute component={IntelligencePage} roles={['admin', 'owner']} />
      </Route>
      <Route path="/performance">
        <ProtectedRoute component={PerformancePage} roles={['admin', 'owner']} />
      </Route>

      {/* 404 fallback */}
      <Route>
        {() => <Redirect to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} />}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </AuthProvider>
  );
}
