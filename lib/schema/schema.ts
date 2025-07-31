import { z } from "zod";

export type ErrorResponse = { error: string | z.ZodError["errors"] };

export const personalInfoSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username can only contain lowercase letters, numbers, underscores and hyphens"
    ),
  firstname: z
    .string()
    .min(3, "firstname must be at least 2 characters")
    .max(20),
  lastname: z
    .string()
    .min(3, "lasttname must be at least 2 characters")
    .max(20),
  // password: z
  //   .string()
  //   .min(12, "password must be at least 12 characters")
  //   .max(20),
  profilePicture: z.string().max(300).optional(),
  // jobtitle: z.string().optional(),
  // department: z.string().optional(),
  bio: z.string().optional(),
  // phoneNumber: z.string().optional(),
});

export const workspaceSchema = z.object({
  workspacename: z
    .string()
    .min(1, "Workspace name is required")
    .max(255, "Workspace name must be 255 characters or less"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid URL format").optional(),
  type: z.enum(["PERSONAL", "PROFESSIONAL"]).default("PERSONAL"),
  organizationName: z.string().optional(),
  workspaceSize: z
    .number()
    .int()
    .min(1, "Workspace size must be at least 1")
    .default(1),
  organizationDomain: z.string().optional(),
  isPro: z.boolean().default(false),
  subscriptionEndsAt: z
    .string()
    .datetime({ message: "Invalid date-time format" })
    .optional(),
  ownerId: z.string().uuid("Invalid user ID"),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
});

export const signupSchema = z.object({
  email: z.string().min(3).max(100),
  password: z.string().min(8).max(100),
  name: z.string().min(3).max(30),
});

export const tasksSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  completed: z.boolean().default(false),
  priority: z.enum(["no_priority", "low", "medium", "high"]),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? val : null))
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date-time format",
    }),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
  workspaceId: z.string().uuid("Invalid workspace ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3).max(20).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  profilePicture: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  isPro: z.boolean().optional(),
});

export const AddMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z
    .enum(["OWNER", "ADMIN", "MEMBER", "GUEST"])
    .optional()
    .default("MEMBER"),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "GUEST"]),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const AttachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  mimeType: z.string(),
  fileSize: z.number().min(1),
  attachmentType: z.enum(["IMAGE", "DOCUMENT", "AUDIO", "VIDEO"]),
});

const AttachmentsArraySchema = z.array(AttachmentSchema);

export const RequestBodySchema = z.object({
  description: z.string().min(1),
  attachments: AttachmentsArraySchema.optional(),
});

export const AttachmentSchemaforpost = z.object({
  url: z.string().url(),
  filename: z.string(),
  mimeType: z.string(),
  fileSize: z.number().min(1),
  taskVersionId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  attachmentType: z.enum(["IMAGE", "DOCUMENT", "AUDIO", "VIDEO"]),
});

export const UserPreferenceSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  receiveEmailNotifications: z.boolean().optional(),
  defaultWorkspaceView: z.enum(["KANBAN", "LIST", "CALENDAR"]).optional(),
  enableTaskAutoSave: z.boolean().optional(),
  language: z.string().min(2).optional(),
});

export const NotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  userId: z.string(),
});

export const ActivityLogSchema = z.object({
  userId: z.string(),
  taskId: z.string().optional(),
  action: z.string().min(1),
});

export const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty."),
  userId: z.string(),
  taskId: z.string(),
});

export type WorkspaceContextType = {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
};

export const reminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  body: z.string().optional(),
  reminderDate: z.string().datetime({ message: "Invalid date-time format" }),
  taskId: z.string().uuid("Invalid task ID").optional(),
  userId: z.string().uuid("Invalid user ID"),
  workspaceId: z.string().uuid("Invalid workspace ID"),
});

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less"),
  workspaceId: z.string().uuid("Invalid workspace ID").optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code")
    .default("#3b82f6"),
});

export const tagUpdateSchema = z.object({
  tagId: z.string().uuid("Invalid tag ID"),
  workspaceId: z.string().uuid("Invalid workspace ID").optional().nullable(),
});
