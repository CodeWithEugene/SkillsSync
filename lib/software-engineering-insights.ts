/**
 * Predefined insights for software-engineering.docx (Option A).
 * Based on verification and validation techniques across the software lifecycle.
 */

export const SOFTWARE_ENGINEERING_FILENAME = "software-engineering.docx"

export type PredefinedSkill = {
  skillName: string
  category: string
  skillType: "technical" | "soft" | "transferable"
  confidenceScore: number
  evidenceText: string
}

export const SOFTWARE_ENGINEERING_INSIGHTS: PredefinedSkill[] = [
  // Requirements Analysis
  {
    skillName: "Requirements verification through reviews and inspections",
    category: "Requirements Analysis",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Conduct reviews and inspections of the requirements document to ensure completeness, correctness, and consistency.",
  },
  {
    skillName: "Requirement traceability",
    category: "Requirements Analysis",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Use tools for requirement traceability to verify that each requirement has a corresponding test.",
  },
  {
    skillName: "Requirements validation with stakeholders",
    category: "Requirements Analysis",
    skillType: "soft",
    confidenceScore: 1,
    evidenceText: "Validate requirements through discussions with stakeholders, prototypes, and feasibility studies.",
  },
  // System Design
  {
    skillName: "Design verification through reviews",
    category: "System Design",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Perform design reviews and inspections to verify that the system design adheres to the specified requirements.",
  },
  {
    skillName: "Modeling and simulation for design verification",
    category: "System Design",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Use modeling tools to simulate and verify the behavior of the system.",
  },
  {
    skillName: "Design validation with prototypes",
    category: "System Design",
    skillType: "transferable",
    confidenceScore: 1,
    evidenceText: "Create prototypes or conduct UI mock-ups to validate the design with end-users and stakeholders.",
  },
  // Implementation
  {
    skillName: "Code reviews and static analysis",
    category: "Implementation",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Conduct code reviews, static code analysis, and unit testing to verify adherence to coding standards.",
  },
  {
    skillName: "Unit testing for verification",
    category: "Implementation",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Verify that the code is error-free and meets the design specifications through unit testing.",
  },
  {
    skillName: "Integration testing and TDD",
    category: "Implementation",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Perform integration testing to validate that individual components work together. Use test-driven development (TDD) to validate functional requirements.",
  },
  // Testing
  {
    skillName: "System and regression testing",
    category: "Testing",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Execute unit, integration, system, and regression testing to verify that the software functions correctly.",
  },
  {
    skillName: "User acceptance testing (UAT)",
    category: "Testing",
    skillType: "transferable",
    confidenceScore: 1,
    evidenceText: "Conduct UAT with real end-users to validate that the software meets their expectations and requirements.",
  },
  {
    skillName: "Automated testing",
    category: "Testing",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Use automated testing tools to improve efficiency in verification.",
  },
  // Deployment
  {
    skillName: "Deployment verification with checklists",
    category: "Deployment",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Ensure the deployment process is well-documented. Use deployment scripts and checklists to verify correct installation and configuration.",
  },
  {
    skillName: "Production monitoring and validation",
    category: "Deployment",
    skillType: "technical",
    confidenceScore: 1,
    evidenceText: "Monitor the software in the production environment to validate performance, reliability, and security under real-world conditions.",
  },
  // Maintenance
  {
    skillName: "Maintenance verification through documentation",
    category: "Maintenance",
    skillType: "transferable",
    confidenceScore: 1,
    evidenceText: "Regularly review and update documentation to reflect changes. Conduct code reviews for patches and updates.",
  },
  {
    skillName: "User feedback for maintenance validation",
    category: "Maintenance",
    skillType: "soft",
    confidenceScore: 1,
    evidenceText: "Collect and analyze feedback from users to validate that the software continues to meet their needs. Address issues through timely patches.",
  },
  // Documentation
  {
    skillName: "Documentation verification",
    category: "Documentation",
    skillType: "transferable",
    confidenceScore: 1,
    evidenceText: "Verify that all documentation, including user manuals and technical documents, is accurate, complete, and up to date.",
  },
  {
    skillName: "Documentation validation with user feedback",
    category: "Documentation",
    skillType: "soft",
    confidenceScore: 1,
    evidenceText: "Seek feedback from users on the clarity and usefulness of documentation. Make necessary updates based on user input.",
  },
]
