"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "@/lib/api";

interface ChatResponse {
  message: string;
  conversationId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Art Advisor. I can help you discover artworks, learn about artists, understand art movements, and guide your collecting journey. What would you like to know about art today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !initialQueryProcessed) {
      setInitialQueryProcessed(true);
      const timer = setTimeout(() => {
        submitMessage(initialQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, initialQueryProcessed]);

  const getSimulatedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("abstract") || input.includes("contemporary")) {
      return "Abstract and contemporary art offer incredible diversity! I'd recommend exploring artists like Gerhard Richter, Julie Mehretu, or Mark Bradford. These artists work across different price points. What's your budget range, and are you drawn to colorful pieces or more monochromatic works?";
    }

    if (
      input.includes("budget") ||
      input.includes("price") ||
      input.includes("afford") ||
      input.includes("$10k") ||
      input.includes("under")
    ) {
      return "Great question! Art collecting is accessible at many price points. Emerging artists often have works from $500-$5,000, mid-career artists range from $5,000-$50,000, and established artists can be $50,000+. For contemporary artists under $10k, I'd recommend exploring works by emerging talents like Jordy Kerwick, Cristina BanBan, or Tidawhitney Lek. Prints and editions are also wonderful ways to collect iconic works affordably. Would you like specific recommendations in any style?";
    }

    if (
      input.includes("start") ||
      input.includes("beginner") ||
      input.includes("first") ||
      input.includes("buying")
    ) {
      return "Starting an art collection is exciting! Here are my top tips:\n\n1) **Buy what you love** - not what you think will appreciate\n2) **Visit galleries and museums** to train your eye\n3) **Start with emerging artists** or prints from established ones\n4) **Consider the artwork's scale** for your space\n5) **Ask for provenance** and authenticity certificates\n\nWould you like recommendations based on your taste, budget, or space?";
    }

    if (
      input.includes("invest") ||
      input.includes("value") ||
      input.includes("valuation")
    ) {
      return "Art valuations are influenced by several key factors:\n\n• **Artist's reputation** - exhibition history, institutional collections, critical reception\n• **Provenance** - ownership history and authenticity documentation\n• **Condition** - physical state and restoration history\n• **Rarity** - edition size, period of creation\n• **Market demand** - auction results, gallery sales\n\nBlue-chip artists tend to hold value, while emerging artists offer higher risk/reward. Should I suggest some artists with strong market performance?";
    }

    return "That's an interesting question about art! I can help you with recommendations based on style, budget, and space. I can also explain art movements, discuss specific artists, or guide you on authentication and provenance. What aspect of art collecting would you like to explore further?";
  };

  const getResponse = async (userInput: string): Promise<ChatResponse> => {
    const conversationId = sessionStorage.getItem("conversationId") || "";
    console.log("User input:", userInput);
    const res = await sendChatMessage(userInput, conversationId);

    console.log("AI response:", res);

    if (!conversationId) {
      sessionStorage.setItem("conversationId", res.conversationId || "");
    }

    return res;
  };

  const submitMessage = (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    getResponse(userMessage.content).then((response) => {
      console.log("Received response from API:", response);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };
      console.log("Simulated AI response:", aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  const suggestedQuestions = [
    "What should I know about buying my first artwork?",
    "Show me contemporary abstract artists under $10k",
    "How do I verify artwork authenticity?",
    "What are emerging art trends in 2024?",
  ];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Art Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Expert guidance for collectors
            </p>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <div
                    className={`flex h-full w-full items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                </Avatar>

                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <p className="text-pretty leading-relaxed">
                    {message.content}
                  </p>
                  <time className="mt-2 block text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Avatar className="h-10 w-10">
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
              </Avatar>
              <Card className="p-4">
                <div className="flex gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                </div>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="border-t bg-muted/30 px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(question)}
                  className="text-left"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t bg-card px-4 py-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about art, artists, or collecting advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
