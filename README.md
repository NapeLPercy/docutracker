DocuTracker

DocuTracker is a WIL prototype task efficiency and workflow tracking system designed for document digitization environments. 
Developed as part of my WIL at the DHA Digitization Hub, it improves visibility, accountability, and operational performance by automating task assignment, 
tracking progress, and providing AI-powered user guidance.



PROBLEM STATEMENT

During my WIL at the DHA Digitization Hub, I observed that tasks move through multiple stages such as batch creation, indexing, scanning, assembly, and quality checks.
Errors occurred frequently, and managers relied on verbal interventions to correct mistakes.

There was no centralized system to track task progress, staff performance, or efficiency metrics, making accountability and operational visibility difficult.
DocuTracker was designed as a prototype for this specific hub.



SOLUTION OVERVIEW

DocuTracker addresses these challenges by providing:

 -Task CRUD with status updates visible to both managers and assigned staff
 -Automated task assignment via n8n workflows using manager text input
 -Efficiency and performance tracking for each staff member, including error rates, average completion time, and availability
 -AI-powered ChatGPT assistant to help users with guidance and questions



CORE FEATURES

Task Management
 -Create, update, and track tasks
 -Role-based interaction between managers and staff
 -Live dashboards
 -Status updates trigger notifications to managers

Task Assignment Automation (n8n)
 -Assigns tasks automatically based on efficiency, error rates, and availability
 -Reduces manual administrative workload

Efficiency & Performance Tracking
 -Measures task completion time, error rates, and overall efficiency
 -Provides actionable insights for managers

AI Assistance (ChatGPT)
 -Guides users through workflows and system navigation
 -Answers task-related questions
 -Optional support layer for staff and managers



 TARGET USERS
 
-Managers overseeing document digitization workflows
-Staff performing document processing tasks


SYSTEM ARCHITECTURE(high level)

Manager
→ Task Input
→ n8n Automation
→ Assigned Staff
→ Task Completion
→ Efficiency Metrics
→ Manager Dashboard
→ (Optional) ChatGPT Assistant

Decoupled layers for task logic, automation, AI, and performance tracking
Modular and extensible design

TECH STACK

frontend: html, css, JavaScript, bootstrap
Backend: Express.js, Node.js
Automation: n8n workflows, JavaScript & Python scripts
AI / Chatbot: ChatGPT API
Database: MySql 



FUTURE IMPROVEMENTS

1 Expand efficiency scoring algorithms for more accurate task assignment
2 Enhance AI assistant with contextual guidance and dynamic suggestions
4 Modularize architecture for multi-hub deployments
5 Add automated unit and integration tests
6 Improve automation rules for adaptive task distribution

PROJECT STATUS

-WIL prototype for DHA Digitization Hub
-Demonstrates workflow analysis, automation, and AI integration
-Not yet deployed in production


AUTHOR

Developed by Lekoloane Nape Percy
Computer Science Graduate
