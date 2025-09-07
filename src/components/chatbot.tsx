
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { answerDocumentQuestion } from "@/ai/flows/document-qa-flow";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  documentName: string;
}

export function Chatbot({ isOpen, onClose, documentText, documentName }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { id: "initial", text: `Hello! How can I help you with the document "${documentName}"?`, sender: "ai" }
      ]);
    }
  }, [isOpen, documentName]);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await answerDocumentQuestion({ documentText, query: input });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: result.answer, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting answer from AI:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
      });
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I ran into an error. Please try again.", sender: "ai" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Document Assistant</DialogTitle>
          <DialogDescription>
            Ask questions about the document: <span className="font-medium">{documentName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg px-4 py-2 max-w-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                   {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 max-w-sm bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
