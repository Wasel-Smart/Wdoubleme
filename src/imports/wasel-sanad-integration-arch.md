🚀 Figma Agent Prompt — Sanad Backend Integration Architecture (Wasel)

Design a technical system architecture diagram showing how Wasel securely integrates with Sanad Digital Identity for authentication and verification.

🎯 Objective

Create an enterprise-grade backend architecture that embeds Sanad as a trusted identity provider inside Wasel’s AI-optimized long-distance ride-sharing ecosystem.

🏗️ Architecture Components to Include
1️⃣ Client Layer

Wasel Mobile App (Rider / Ride-Sharer)

Web Admin Dashboard

2️⃣ API Gateway Layer

Secure API Gateway

Rate limiting

Request validation

JWT token verification

3️⃣ Authentication & Identity Layer

Wasel Auth Service

Sanad OAuth2 / OpenID Connect Integration

Token exchange mechanism

Identity verification microservice

KYC status flag (Verified / Pending / Rejected)

Flow:
User → Wasel → Redirect to Sanad → Sanad authenticates → Returns secure token → Wasel validates → User marked “Sanad Verified”

4️⃣ Core Services Layer

User Service

Ride Service

Seat Marketplace Service

Dynamic Pricing Engine (AI Route Optimization Engine)

Trust & Safety Service

Dispute Resolution Service

Sanad verification should:

Attach verified National ID hash (NOT raw ID)

Update trust score

Unlock high-value intercity rides

Reduce fraud risk scoring

5️⃣ Data Layer

Encrypted User Database

Verification Status Table

Audit Log Table

Token Storage (secure, short-lived)

Security:

End-to-end encryption

No raw national ID stored

Store only verification reference ID

GDPR-style privacy compliance structure

6️⃣ Trust & Safety Logic

If Sanad Verified:

Higher booking limit

Priority listing visibility

Reduced manual verification

If Not Verified:

Limited booking capability

Restricted seat selling

🔐 Security Requirements

OAuth2 authorization flow

PKCE support

Signed token validation

API throttling

Fraud detection layer

Activity logging

🎨 Diagram Style Requirements

Enterprise clean architecture diagram

Use clear layer separation

Show arrows for request flow

Mark secure communication with lock icon

Highlight “Sanad Integration” as Trust Anchor

Use modern fintech/system architecture design style

🧠 Strategic Positioning Note (include as diagram annotation)

“Wasel integrates national digital identity infrastructure to build the first AI-powered, trust-centric, long-distance ride-sharing ecosystem in the region.”

This will make your system look:

Investor-ready

Government-aligned

Scalable

Enterprise secure

Regulation-friendly