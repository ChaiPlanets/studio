
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJira } from "@/contexts/jira-context";
import { useToast } from "@/hooks/use-toast";
import type { JiraCredentials } from "@/types";

export function JiraConfigDialog() {
  const { credentials, saveCredentials, isDialogOpen, closeDialog } = useJira();
  const { toast } = useToast();
  
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");

  useEffect(() => {
    if (credentials) {
      setBaseUrl(credentials.baseUrl);
      setEmail(credentials.email);
      setApiToken(credentials.apiToken);
    }
  }, [credentials, isDialogOpen]);

  const handleSave = () => {
    if (!baseUrl || !email || !apiToken) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all Jira credential fields.",
      });
      return;
    }
    
    // Simple URL validation
    try {
        const url = new URL(baseUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
            throw new Error("Invalid protocol");
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Invalid URL",
            description: "Please enter a valid Jira base URL (e.g., https://your-domain.atlassian.net).",
        });
        return;
    }

    const newCredentials: JiraCredentials = { baseUrl, email, apiToken };
    saveCredentials(newCredentials);

    toast({
      title: "Jira Credentials Saved",
      description: "Your Jira configuration has been updated.",
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Jira Integration</DialogTitle>
          <DialogDescription>
            Enter your Jira credentials to log test cases. This information is
            saved securely in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="baseUrl" className="text-right">
              Base URL
            </Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-domain.atlassian.net"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiToken" className="text-right">
              API Token
            </Label>
            <Input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
