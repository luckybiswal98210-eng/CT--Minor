# MICRO-PROJECT SYNOPSIS

**Topic:** Cloud-Based Online Complaint Management System  
**Subject:** Cloud Technology (Course Code: 22517 / Cloud Computing)  
**Semester:** 5th Semester  
**Candidate Name:** Lucky Biswal  
**GitHub Repository:** https://github.com/luckybiswal98210-eng/CT--Minor  

---

### 1. Title of the Project
**Cloud-Based Online Complaint Management and Grievance Redressal System (CloudResolve)**

### 2. Aim of the Micro-Project
To design, implement, and deploy an automated, cloud-native online complaint management system that utilizes cloud computing service models (SaaS, PaaS, DBaaS, and Cloud Object Storage) to provide transparent, scalable, and SLA-driven grievance redressal for educational campuses and public organizations.

### 3. Relevance to the Course (Cloud Technology)
This project directly implements core syllabus concepts of Cloud Computing:
1. **Cloud Service Models:** 
   - **SaaS:** Cloud grievance web application and admin management dashboard.
   - **PaaS:** Application runtime deployed on cloud platforms (Render / Vercel).
   - **IaaS / CaaS:** Container packaging via Docker.
2. **Database as a Service (DBaaS):** Multi-AZ cloud database cluster with MongoDB Atlas.
3. **Cloud Storage (Object Storage):** Media decoupling via Cloudinary/AWS S3 for file attachments.
4. **Cloud Observability:** Real-time SLA tracking, uptime telemetry, and health monitoring.

### 4. Proposed Methodology
1. **Requirement Analysis:** Identification of workflow states (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Rejected`) and SLA commitment times (6h to 72h).
2. **Cloud Architecture Design:** Separation of concerns into Client Tier (SaaS), API Gateway Tier (PaaS), Data Tier (DBaaS), Media Tier (Object Storage), and Messaging Tier (Cloud Notifications).
3. **API & Engine Implementation:** RESTful API development using Node.js and Express with failover handling.
4. **User Interface Engineering:** Glassmorphism UI with interactive step-by-step progress tracking and Chart.js analytics.
5. **Containerization & Deployment:** Building Docker images and deploying to cloud PaaS platforms.

### 5. Hardware and Software Requirements
- **Software Requirements:**
  - Operating System: macOS / Linux / Windows
  - Runtime Environment: Node.js (v20+)
  - Cloud Database: MongoDB Atlas (Free Tier Cluster)
  - Cloud Storage: Cloudinary / AWS S3
  - Container Engine: Docker Engine & Docker Compose
  - Web Browser: Google Chrome / Safari / Edge
- **Hardware Requirements:**
  - Standard development workstation with 4GB+ RAM and internet connectivity.

### 6. Action Plan & Timeline
| Week / Milestone | Planned Activity | Status |
| :--- | :--- | :--- |
| Milestone 1 | Topic selection, requirement gathering & synopsis preparation | Completed |
| Milestone 2 | Cloud architecture modeling and DBaaS schema design | Completed |
| Milestone 3 | Backend API development, file streaming, and notifications | Completed |
| Milestone 4 | Frontend UI design, tracking timeline, and admin triage console | Completed |
| Milestone 5 | Docker containerization, testing, and GitHub repository update | Completed |

### 7. Expected Outcomes
- Working cloud-based complaint management web application.
- Publicly accessible GitHub repository with complete source code.
- Auto-generation of unique tracking IDs and live step-by-step timeline visualization.
- Practical understanding of Cloud SPI models, DBaaS, Object Storage, and SLA observability.

---
**Candidate Signature:** Lucky Biswal  
**Date of Submission:** 06-October-2026
