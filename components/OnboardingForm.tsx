"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { Badge } from "@/components/ui/badge";

const personalInfoSchema = z.object({
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

const workspaceSchema = z.object({
  Workspacename: z.string().min(2, "Workspace name is required"),
  description: z.string().max(400).optional(),
  imageUrl: z.string().max(300).optional(),
  type: z.enum(["PERSONAL", "PROFESSIONAL"]),
  organizationName: z.string().min(3).max(30).optional(),

  // Professional workspace fields
  workspaceSize: z.string().optional(),
  organizationDomain: z.string().optional(),
});

type OnboardingFormProps = {
  userId: string;
  userEmail: string;
  userName: string | null;
};

const OnboardingForm = ({
  userId,
  userEmail,
  userName,
}: OnboardingFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState<"personal" | "workspace">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState(userName || "");
  const [workspaceType, setWorkspaceType] = useState<
    "PERSONAL" | "PROFESSIONAL"
  >("PERSONAL");

  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      username: (userName || "").replace(/\s+/g, "").toLowerCase() || "",
      firstname: "",
      lastname: "",
      // password: "",
      profilePicture: "",
      //   department: "",
      bio: "",
      //   phoneNumber: "",
    },
  });

  const workspaceForm = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      Workspacename: `${userName || ""}'s Workspace`,
      description: "",
      imageUrl: "",
      type: "PERSONAL",
      organizationName: "",
      workspaceSize: "",
      organizationDomain: "",
    },
  });

  async function onPersonalSubmit(values: z.infer<typeof personalInfoSchema>) {
    try {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setStep("workspace");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }

  async function onWorkspaceSubmit(values: z.infer<typeof workspaceSchema>) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleWorkspaceTypeChange = (value: "PERSONAL" | "PROFESSIONAL") => {
    setWorkspaceType(value);
    workspaceForm.setValue("type", value);
  };

  return (
    <div className="space-y-8">
      {step === "personal" ? (
        <AnimatedGradientBorder>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Tell us a bit about yourself. This information will be visible
                on your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <form
                  onSubmit={personalForm.handleSubmit(onPersonalSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={personalForm.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Name</FormLabel>
                        <FormControl>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="profilePicture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture Url (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue to Workspace Setup
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </AnimatedGradientBorder>
      ) : (
        <AnimatedGradientBorder>
          <Card>
            <CardHeader>
              <CardTitle>Create Your Workspace</CardTitle>
              <CardDescription>
                Set up your workspace to organize your tasks. You can create a
                personal workspace or a professional one for your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Workspace Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      workspaceType === "PERSONAL"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => {
                      setWorkspaceType("PERSONAL");
                      workspaceForm.setValue("type", "PERSONAL");
                    }}
                  >
                    <h4 className="font-medium">Personal</h4>
                    <p className="text-sm text-muted-foreground">
                      For individual use. Manage your personal tasks and
                      projects.
                    </p>
                    {workspaceType === "PERSONAL" && (
                      <Badge className="mt-2 bg-blue-500">Selected</Badge>
                    )}

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        workspaceType === "PROFESSIONAL"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => {
                        setWorkspaceType("PROFESSIONAL");
                        workspaceForm.setValue("type", "PROFESSIONAL");
                      }}
                    >
                      <h4 className="font-medium">Professional</h4>
                      <p className="text-sm text-muted-foreground">
                        For teams and businesses. Collaborate with others.
                      </p>
                      {workspaceType === "PROFESSIONAL" && (
                        <Badge className="mt-2 bg-purple-500">Selected</Badge>
                      )}
                    </div>
                  </div>
                  {workspaceType === "PERSONAL" && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm">
                        <strong>Free Tier:</strong> Personal workspaces include
                        basic features for individual task management. Upgrade
                        anytime to access advanced features.
                      </p>
                    </div>
                  )}
                  {workspaceType === "PROFESSIONAL" && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm">
                        <strong>Free Trial:</strong> Professional workspaces
                        include a 14-day trial of all premium features. After
                        the trial period, you'll need to subscribe to continue
                        using premium features.
                      </p>
                    </div>
                  )}

                  <Form {...workspaceForm}>
                    <form
                      onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={workspaceForm.control}
                        name="Workspacename"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workspace Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Workspace" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={workspaceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your workspace"
                                className="min-h-20 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={workspaceForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Photo Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Url" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {workspaceType === "PROFESSIONAL" && (
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <h3 className="text-lg font-medium">
                            Company Details
                          </h3>

                          <FormField
                            control={workspaceForm.control}
                            name="organizationName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organization/Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={workspaceForm.control}
                              name="workspaceSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Workspace Size</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select company size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1-10">
                                        1-10 employees
                                      </SelectItem>
                                      <SelectItem value="11-50">
                                        11-50 employees
                                      </SelectItem>
                                      <SelectItem value="51-200">
                                        51-200 employees
                                      </SelectItem>
                                      <SelectItem value="201-500">
                                        201-500 employees
                                      </SelectItem>
                                      <SelectItem value="501+">
                                        501+ employees
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={workspaceForm.control}
                              name="organizationDomain"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Domain</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Finance" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("personal")}
                        >
                          Back to Personal Info
                        </Button>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="sm:w-1/2"
                        >
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Creating Workspace..."
                              : "Create Workspace & Continue"}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedGradientBorder>
      )}
    </div>
  );
};

export default OnboardingForm;
