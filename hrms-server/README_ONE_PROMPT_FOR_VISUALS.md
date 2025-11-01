# HRMS Visuals: Single Prompt for Mindmap, Flowchart, and Infographics

Copy everything between the lines into your diagram/AI tool (Mermaid, Whimsical, Excalidraw, draw.io, Figma AI, Obsidian Canvas, or any AI diagram assistant). The tool should generate: 1) a hierarchical mindmap, 2) a cross-module flowchart, and 3) concise infographics.

---

You are a senior information architect and diagram generator. Based on the following authoritative HRMS specification, produce three deliverables in one session:

1) Mindmap: A hierarchical mindmap that captures the entire HRMS domain: domain groups → modules → features → key entities. Keep labels concise. Color-code domains consistently.
2) System Flowchart: An end-to-end flow across major cross-module workflows (Authentication → Onboarding → Attendance/Leave → Payroll → Reporting) including tenant isolation and RBAC checks. Show decision points, services, middleware, and data stores.
3) Infographics: 3–5 small cards/panels summarizing: module and endpoint counts; roles and capabilities; 2–3 KPIs (e.g., headcount, attendance compliance, leave utilization, payroll status).

Style & conventions:
- Use clean shapes, minimal text, and consistent colors by domain: Core, HR, Time & Attendance, Financial, Specialized, Support, Cross-Module.
- Distinguish processes vs. data stores (MongoDB collections/schemas) visually.
- Show multi-tenant boundaries and RBAC checks where relevant.
- Prefer containers/swimlanes for Client, Express API (routes/controllers/middleware), Services, Data Stores, External systems.
- If the tool supports multiple canvases/pages, place Mindmap, Flowchart, and Infographics separately.

Authoritative project specification:

High-level purpose and stack:
- Modular HRMS server with multi-tenancy, RBAC, and ~170+ REST endpoints.
- Tech: Node.js, Express, MongoDB (Mongoose), JWT auth; Swagger at `/api-docs`.
- Layers: Routes → Middleware (auth/authorize) → Controllers → Services (business logic) → Schemas/Models (Mongoose) → MongoDB.

Module taxonomy (15 modules), grouped by domain:
- Core Modules
  - Auth: registration; login/logout; JWT issue/validate.
  - User: profile CRUD; admin create/delete; list/filter.
  - Role: role definitions; permission rules; user-role assignment.
  - Organization: tenant CRUD; settings (HR/payroll); subscription; HR account manager assignment.
- Human Resources Modules
  - Employee: CRUD; personal/employment info; onboarding/offboarding; documents; status history.
  - Department: CRUD; budgets; headcount; managers; role assignment; employee assignment.
  - Recruitment: job openings; candidate pipeline; interview scheduling; offers; onboarding integration.
- Time & Attendance Modules
  - Attendance: clock in/out (with location); shifts; overtime calculation; reports; payroll integration.
  - Leave: requests; approvals; balances; policies; holiday calendar; analytics.
- Financial Modules
  - Payroll: payroll cycles; payslips; tax calculation; deductions; reports.
  - Finance: transactions; accounts; budgets; financial reports; multi-currency.
  - Expense: claims; approvals; reimbursements; policy enforcement; analytics.
- Specialized Modules
  - Healthcare: clinical HR features; credential tracking; HIPAA-sensitive flows; audit logs; shift-based payroll.
- Support Modules
  - Helpdesk: IT/support ticketing; agent assignment; priority/SLA; resolution tracking.
  - Asset: inventory; assignment; maintenance schedules; depreciation; disposal; QR/barcode.
- Cross-Module Features
  - Reporting, Analytics, Audit Logs.

Representative entities (MongoDB/Mongoose collections):
- Core: User, Role, Organization
- HR: Employee, Department
- Recruitment: Job, Candidate
- Attendance: AttendanceRecord, Shift, OvertimeRecord, AttendanceReport
- Leave: LeaveRequest, LeavePolicy, LeaveBalance, Holiday, LeaveType
- Payroll: PayrollCycle, Payslip, PayrollTax, PayrollReport
- Finance: Transaction, Account, Budget, FinancialReport
- Expense: ExpenseClaim, ExpensePolicy, Reimbursement
- Asset: Asset, AssetAssignmentHistory, AssetMaintenanceSchedule, AssetDisposal, AssetReport
- Helpdesk: Ticket (and related Category/Comment if needed)
- Analytics/Reporting: ReportDefinition, AuditLog

Roles and access (RBAC):
- Super Admin (full system), Client Admin (per-organization), HR Account Manager, Payroll Specialist, Recruitment Specialist, Employee.
- Permissions follow `resource:action` (e.g., `user:read`, `payroll:export`) and are enforced in route handlers via middleware.

Key flows to depict in the system flowchart:
1) Authentication & Session
   - Register/Login → JWT issued → Protected routes require `Authorization: Bearer <token>` → Token validation middleware.
2) Tenant & RBAC Gate (applies to all protected routes)
   - Resolve organization (tenant) → Resolve user roles → Check permissions → Proceed or 403.
3) Employee Onboarding
   - Create Employee (HR) → Assign Department/Manager → Upload documents → Provision access/assets → Notify stakeholders → Audit log.
4) Time & Attendance
   - Employee Clock In/Out → Shift validation → Overtime calculation → Attendance report generation → Feed to Payroll.
5) Leave Management
   - Employee submits LeaveRequest → Approval workflow (manager/HR) → Update LeaveBalance → Check Holiday calendar/conflicts → Notify.
6) Payroll Cycle
   - Initiate PayrollCycle (Payroll Specialist) → Aggregate Attendance/Leave/Deductions → Tax calculation → Generate Payslips → Approvals → Disbursement/export → Reports.
7) Reporting & Analytics
   - Scheduled/On-demand reports → Fetch multi-module data → RBAC-filtered output → Export (CSV/PDF) → Audit log.

Quantities to include in infographics (approximate):
- 15 modules; ~170+ API endpoints; 45+ schemas.
- JWT-based auth; multi-tenant isolation; role-based permissions.
- Swagger documentation available at `/api-docs`.

Output instructions:
- Provide:
  a) Mindmap (hierarchy): Root = HRMS; Children = Domain groups → Modules → Features → Entities.
  b) Flowchart (end-to-end): Use swimlanes/containers for Client, Express (Routes/Controllers/Middleware), Services, Data Stores; show decision diamonds for RBAC/tenant checks.
  c) Infographics: 3–5 compact cards summarizing counts (modules/endpoints/schemas), roles, and sample KPIs (headcount trend, attendance compliance %, leave utilization %, payroll run status).
- If supported, include a color legend by domain and a note for RBAC and tenant isolation.
- Optimize for readability over exhaustiveness; split large clusters into submaps if needed.

---

How to use:
- Paste this entire prompt into your diagramming AI/tool.
- Ask the tool to generate three separate artifacts (mindmap, flowchart, infographics) on separate pages/canvases if possible.
- Save exports (PNG/SVG) under `docs/diagrams/` and commit alongside this repository.


