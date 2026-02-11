export const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum Gender {
    male
    female
  }

  enum AppointmentStatus {
    scheduled
    completed
    cancelled
  }

  type Patient {
    id: ID!
    name: String!
    email: String
    phone: String
    dateOfBirth: DateTime
    gender: Gender
    address: String
    createdAt: DateTime!
    updatedAt: DateTime!
    appointments: [Appointment!]!
  }

  type Appointment {
    id: ID!
    patientId: ID!
    title: String!
    description: String
    startTime: DateTime!
    endTime: DateTime!
    status: AppointmentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    patient: Patient!
  }

  type WorkflowStep {
    id: ID!
    label: String!
    order: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PaginatedPatients {
    data: [Patient!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreatePatientInput {
    name: String!
    email: String
    phone: String
    dateOfBirth: DateTime
    gender: Gender
    address: String
  }

  input UpdatePatientInput {
    name: String
    email: String
    phone: String
    dateOfBirth: DateTime
    gender: Gender
    address: String
  }

  input CreateAppointmentInput {
    patientId: ID!
    title: String!
    description: String
    startTime: DateTime!
    endTime: DateTime!
    status: AppointmentStatus
  }

  input UpdateAppointmentInput {
    title: String
    description: String
    startTime: DateTime
    endTime: DateTime
    status: AppointmentStatus
  }

  input SaveWorkflowInput {
    steps: [WorkflowStepInput!]!
  }

  input WorkflowStepInput {
    id: ID
    label: String!
    order: Int!
  }

  type Query {
    patients(page: Int, limit: Int, search: String): PaginatedPatients!
    patient(id: ID!): Patient
    appointments(startDate: DateTime, endDate: DateTime, patientId: ID): [Appointment!]!
    appointment(id: ID!): Appointment
    workflowSteps: [WorkflowStep!]!
  }

  type Mutation {
    createPatient(input: CreatePatientInput!): Patient!
    updatePatient(id: ID!, input: UpdatePatientInput!): Patient!
    deletePatient(id: ID!): Boolean!
    createAppointment(input: CreateAppointmentInput!): Appointment!
    updateAppointment(id: ID!, input: UpdateAppointmentInput!): Appointment!
    deleteAppointment(id: ID!): Boolean!
    saveWorkflow(input: SaveWorkflowInput!): [WorkflowStep!]!
  }
`;
