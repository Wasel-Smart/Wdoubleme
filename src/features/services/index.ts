/**
 * Feature: Services
 * Strangler Fig barrel — re-exports from original locations.
 */
export { PackageDelivery } from '../../components/PackageDelivery';
export { MedicalTransport } from '../../components/MedicalTransport';
export { SchoolTransport } from '../../components/SchoolTransport';
export { SchoolTransportDashboard } from '../../components/school/SchoolTransportDashboard';
export { EnterpriseCommute } from '../../components/business/EnterpriseCommute';
export { HRManagerDashboard } from '../../components/enterprise/HRManagerDashboard';
export { PetTransport } from '../../components/PetTransport';
export { GiftTransport } from '../../components/GiftTransport';
export { FreightShipping } from '../../components/FreightShipping';

// 🆕 Phase 4: New specialized services (BlaBlaCar pivot)
export { SchoolCarpooling } from './SchoolCarpooling';
export { HospitalTransport } from './HospitalTransport';
export { CorporateCarpools } from './CorporateCarpools';

// 🆕 Phase 4: Smart School Mobility Network
export { SmartSchoolMobility } from './SmartSchoolMobility';