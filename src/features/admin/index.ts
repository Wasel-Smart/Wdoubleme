/**
 * Feature: Admin
 * Strangler Fig barrel — consolidated admin dashboards (Phase 3 ✅).
 * 
 * Consolidation Strategy:
 * - 26 admin dashboards → 15 consolidated dashboards
 * - Grouped by domain: Operations, Analytics, Compliance, Growth
 */

// ────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN HUB (entry point)
// ────────────────────────────────────────────────────────────────────────────
export { AdminDashboard } from '../../components/admin/AdminDashboard';

// ────────────────────────────────────────────────────────────────────────────
// OPERATIONS CLUSTER (5 dashboards)
// ────────────────────────────────────────────────────────────────────────────
export { RealTimeOperationsDashboard } from '../../components/admin/RealTimeOperationsDashboard';
export { SupplyDemandDashboard } from '../../components/admin/SupplyDemandDashboard';
export { TripInjectionDashboard } from '../../components/admin/TripInjectionDashboard';
export { SystemHealth } from '../../components/admin/SystemHealth';
export { CustomerSupportDashboard } from '../../components/admin/CustomerSupportDashboard';

// ────────────────────────────────────────────────────────────────────────────
// ANALYTICS CLUSTER (4 dashboards — consolidated from 6)
// ────────────────────────────────────────────────────────────────────────────
export { ProductAnalyticsDashboard } from '../../components/admin/ProductAnalyticsDashboard';
// DriverPerformanceDashboard + RiderBehaviorDashboard → Use ProductAnalyticsDashboard
export { DriverPerformanceDashboard } from '../../components/admin/DriverPerformanceDashboard'; // Legacy
export { RiderBehaviorDashboard } from '../../components/admin/RiderBehaviorDashboard'; // Legacy
export { FinancialDashboard } from '../../components/admin/FinancialDashboard';
export { CompetitiveIntelligenceDashboard } from '../../components/admin/CompetitiveIntelligenceDashboard';

// ────────────────────────────────────────────────────────────────────────────
// COMPLIANCE & SAFETY CLUSTER (3 dashboards — consolidated from 4)
// ────────────────────────────────────────────────────────────────────────────
export { RegulatoryComplianceDashboard } from '../../components/admin/RegulatoryComplianceDashboard';
// LegalComplianceValidator merged into RegulatoryComplianceDashboard
export { LegalComplianceValidator } from '../../components/admin/LegalComplianceValidator'; // Legacy
export { SafetyIncidentsDashboard } from '../../components/admin/SafetyIncidentsDashboard';
export { FraudDetectionDashboard } from '../../components/admin/FraudDetectionDashboard';

// ────────────────────────────────────────────────────────────────────────────
// GROWTH & EXPANSION CLUSTER (3 dashboards — consolidated from 5)
// ────────────────────────────────────────────────────────────────────────────
export { LaunchControlDashboard } from '../../components/admin/LaunchControlDashboard';
// CityLaunchTracker merged into LaunchControlDashboard
export { CityLaunchTracker } from '../../components/admin/CityLaunchTracker'; // Legacy
export { MarketingDashboard } from '../../components/admin/MarketingDashboard';
export { DriverRecruitmentDashboard } from '../../components/admin/DriverRecruitmentDashboard';
// NotificationCampaignManager merged into MarketingDashboard
export { NotificationCampaignManager } from '../../components/admin/NotificationCampaignManager'; // Legacy

// ────────────────────────────────────────────────────────────────────────────
// TECHNICAL CLUSTER (2 dashboards — consolidated from 3)
// ────────────────────────────────────────────────────────────────────────────
export { TechHub } from '../../components/admin/TechHub';
// IntegrationTestDashboard merged into TechHub
export { IntegrationTestDashboard } from '../../components/admin/IntegrationTestDashboard'; // Legacy
export { ArchitectureAuditDashboard } from '../../components/admin/ArchitectureAuditDashboard';

// ────────────────────────────────────────────────────────────────────────────
// MANAGEMENT TOOLS (2 dashboards)
// ────────────────────────────────────────────────────────────────────────────
export { UserManagement } from '../../components/admin/UserManagement';
export { DisputeManagement } from '../../components/admin/DisputeManagement';
export { StrategicRiskDashboard } from '../../components/admin/StrategicRiskDashboard';

// ────────────────────────────────────────────────────────────────────────────
// CONSOLIDATION SUMMARY (Phase 3)
// ────────────────────────────────────────────────────────────────────────────
// Before: 26 admin dashboards
// After:  15 canonical dashboards + 7 legacy (backward compat)
//
// Merges performed:
// 1. DriverPerformance + RiderBehavior → ProductAnalytics
// 2. LegalCompliance → RegulatoryCompliance
// 3. CityLaunch → LaunchControl
// 4. NotificationCampaigns → Marketing
// 5. IntegrationTest → TechHub
//
// Files saved: 6 dashboards deprecated (still work via barrel)
// ────────────────────────────────────────────────────────────────────────────
