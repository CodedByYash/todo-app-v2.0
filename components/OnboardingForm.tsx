"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { Badge } from "@/components/ui/badge";

import { personalInfoSchema, workspaceSchema } from "@/lib/schema/schema";

type OnboardingFormProps = {
  userId: string;
  userEmail: string;
  userName: string | null;
};

const OnboardingForm = ({
  // userId,
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
      workspacename: `${userName || ""}'s Workspace`,
      description: "",
      imageUrl: "",
      type: "PERSONAL",
      organizationName: "",
      workspaceSize: 1,
      organizationDomain: "",
    },
  });

  async function onPersonalSubmit(values: z.infer<typeof personalInfoSchema>) {
    try {
      const response = await fetch("/api/user/profile", {
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
                        name="workspacename"
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
                                  <FormControl>
                                    <Input
                                      placeholder="Workspace Size"
                                      {...field}
                                    />
                                  </FormControl>
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
