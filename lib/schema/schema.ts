import { z } from "zod";

export type ErrorResponse = { error: string | z.core.$ZodIssue[] };

/* ----------------------------- shared fields ----------------------------- */

const uuid = (message = "Invalid ID") => z.uuid({ error: message });

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254)
  .pipe(z.email("Please enter a valid email address"));

/** ISO date string that also tolerates null / "" (cleared date inputs). */
const optionalDate = z
  .string()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), {
    message: "Invalid date-time format",
  });

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code");

/* --------------------------------- auth ---------------------------------- */

export const signupSchema = z.object({
  email: emailField,
  // bcrypt only uses the first 72 bytes, so cap the length there.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or less"),
});

export const signinSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(72),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().max(500).optional(),
  profilePicture: z.url().max(300).optional(),
});

/* ------------------------------- workspaces ------------------------------ */

// isPro / subscription / size are server-managed and never client-settable.
export const createWorkspaceSchema = z.object({
  workspacename: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(255, "Workspace name must be 255 characters or less"),
  description: z.string().max(1000).nullish(),
  imageUrl: z.url("Invalid URL format").nullish().or(z.literal("")),
  type: z.enum(["PERSONAL", "PROFESSIONAL"]).default("PERSONAL"),
  organizationName: z.string().max(255).nullish(),
  organizationDomain: z.string().max(255).nullish(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const onboardingSchema = z.object({
  workspacename: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(255, "Workspace name must be 255 characters or less"),
  description: z.string().max(1000).optional(),
  type: z.enum(["PERSONAL", "PROFESSIONAL"]).default("PERSONAL"),
});

export const AddMemberSchema = z.object({
  userId: uuid("Invalid user ID"),
  role: z.enum(["ADMIN", "MEMBER", "GUEST"]).optional().default("MEMBER"),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "GUEST"]),
});

/* --------------------------------- tasks --------------------------------- */

const priority = z.enum(["no_priority", "low", "medium", "high"]);

export const tasksSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  completed: z.boolean().default(false),
  priority: priority.default("no_priority"),
  dueDate: optionalDate,
  tagIds: z.array(uuid("Invalid tag ID")).optional(),
  workspaceId: uuid("Invalid workspace ID"),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  completed: z.boolean().optional(),
  priority: priority.optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine((v) => v == null || v === "" || !Number.isNaN(Date.parse(v)), {
      message: "Invalid date-time format",
    }),
  workspaceId: uuid().optional(),
  tagIds: z.array(uuid()).optional(),
});

/* ---------------------------------- tags --------------------------------- */

export const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less"),
  workspaceId: uuid("Invalid workspace ID"),
  color: hexColor.default("#3b82f6"),
});

export const tagUpdateSchema = z.object({
  tagId: uuid("Invalid tag ID"),
  workspaceId: uuid("Invalid workspace ID").optional().nullable(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: hexColor,
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: hexColor.optional(),
});

/* ------------------------- attachments & versions ------------------------ */

const attachmentType = z.enum(["IMAGE", "DOCUMENT", "AUDIO", "VIDEO"]);

export const AttachmentSchema = z.object({
  url: z.url(),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(127),
  fileSize: z.number().int().min(1),
  attachmentType,
});

export const RequestBodySchema = z.object({
  description: z.string().min(1),
  attachments: z.array(AttachmentSchema).optional(),
});

export const AttachmentSchemaforpost = AttachmentSchema.extend({
  taskVersionId: uuid().optional(),
  taskId: uuid().optional(),
});

/* ------------------------------ misc entities ---------------------------- */

export const UserPreferenceSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  receiveEmailNotifications: z.boolean().optional(),
  defaultWorkspaceView: z.enum(["KANBAN", "LIST", "CALENDAR"]).optional(),
  enableTaskAutoSave: z.boolean().optional(),
  language: z.string().min(2).optional(),
});

export const NotificationSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
});

export const ActivityLogSchema = z.object({
  taskId: uuid().optional(),
  action: z.string().min(1).max(500),
});

export const CommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty.").max(5000),
  taskId: uuid(),
});

export const reminderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  body: z.string().max(2000).nullish(),
  reminderDate: z.iso.datetime({ message: "Invalid date-time format" }),
  taskId: uuid("Invalid task ID").optional(),
  workspaceId: uuid("Invalid workspace ID"),
  completed: z.boolean().optional(),
});

export type WorkspaceContextType = {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
};
