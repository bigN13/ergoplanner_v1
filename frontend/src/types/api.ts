/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * User authentication
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyId?: string;
  companyName?: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = "Admin" | "Engineer" | "Designer" | "Viewer";

/**
 * Project model
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName: string;
  projectNumber: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  members: ProjectMember[];
  drawingsCount: number;
  boqItemsCount: number;
}

export type ProjectStatus = "Planning" | "Active" | "Review" | "Completed" | "Archived";

export interface ProjectMember {
  userId: string;
  userName: string;
  role: ProjectRole;
  joinedAt: string;
}

export type ProjectRole = "Owner" | "Manager" | "Contributor" | "Viewer";

/**
 * Bill of Quantities (BoQ) models
 */
export interface BoQItem {
  id: string;
  projectId: string;
  drawingId?: string;
  category: string;
  itemCode: string;
  description: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
  leadTime?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BoQSummary {
  projectId: string;
  totalItems: number;
  totalCost: number;
  categories: BoQCategory[];
  lastUpdated: string;
}

export interface BoQCategory {
  name: string;
  itemCount: number;
  totalCost: number;
  percentage: number;
}

/**
 * Real-time collaboration
 */
export interface CollaborationSession {
  drawingId: string;
  sessionId: string;
  participants: Participant[];
  startedAt: string;
}

export interface Participant {
  userId: string;
  userName: string;
  cursorPosition?: { x: number; y: number };
  selectedElement?: string;
  isActive: boolean;
  color: string;
}

/**
 * Comments and annotations
 */
export interface Comment {
  id: string;
  drawingId: string;
  userId: string;
  userName: string;
  content: string;
  position?: { x: number; y: number };
  elementId?: string;
  createdAt: string;
  updatedAt?: string;
  replies?: CommentReply[];
  resolved: boolean;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

/**
 * Notifications
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | "DrawingUpdated"
  | "CommentAdded"
  | "ProjectInvite"
  | "ApprovalRequired"
  | "SystemUpdate";
