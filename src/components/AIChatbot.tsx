import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { calculateSafeToSpend, calculateActualBurn } from "@/utils/financialPhysics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BudgetGoal, Transaction, formatCurrency } from "@/lib/data";
import ReactMarkdown from 'react-markdown';
import { SpendingChart } from "./SpendingChart";

interface AIChatbotProps {
  budgets: BudgetGoal[];
  transactions: Transaction[];
  income: number;
  totalExpenses: number;
  remainingBalance: number;
  currencySymbol?: string;
  savingsTarget?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot({ budgets, transactions, income, totalExpenses, remainingBalance, currencySymbol = "₹", savingsTarget }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your financial assistant. I can help you understand your spending, check budgets, and answer questions about your finances. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]); // Trigger on messages or open

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // --- EMERALD ADVISOR: LOCAL THINKING ENGINE ---
      const lowerInput = userMessage.content.toLowerCase();

      if (lowerInput.includes("afford") || lowerInput.includes("buy")) {
        const amountMatch = userMessage.content.match(/(\d+[,.]?\d*)/);

        if (amountMatch) {
          const cost = Number(amountMatch[0].replace(/,/g, ''));
          await new Promise(r => setTimeout(r, 800));

          const target = savingsTarget || 10000; // Force fallback
          const projectedBalance = remainingBalance - cost;
          const surplus = income - totalExpenses - target; // Surplus logic from Prompt

          let responseText = "";

          // Strict Logic: Can I afford it? (Surplus - Cost >= 0)
          if (surplus >= cost) {
            responseText = `✅ **Green Light**: You can afford this! You have a surplus of ${currencySymbol}${surplus} after meeting your goals.`;
          } else {
            const deficit = cost - surplus;
            responseText = `Analysis: Buying this item for ${currencySymbol}${cost} is risky.\n\n` +
              `⚠️ **Warning**: You only have a surplus of ${currencySymbol}${Math.max(0, surplus)}.\n\n` +
              `**Advisor Tip**: You would need to free up ${currencySymbol}${deficit} from your other budgets to stay safe.`;
          }

          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responseText
          }]);
          setIsLoading(false);
          return;
        }
      }

      // Calculate Metrics using Shared Utility
      const { dailySafeAmount } = calculateSafeToSpend(income, savingsTarget || 0, totalExpenses);
      const { actualBurnRate } = calculateActualBurn(totalExpenses);
      const dailyBurnRate = actualBurnRate;

      // Forensics: Get last 20 transactions
      const recentActivity = transactions
        .slice(0, 20)
        .map(t => ({
          date: t.date,
          amount: t.amount,
          category: t.category,
          name: t.merchant || t.category // Fallback if name missing
        }));

      // Validation
      if (!userMessage.content.trim()) return;

      // Data Sanitization
      const sanitizedSnapshot = {
        income: income, // Use real income
        totalExpenses: totalExpenses,
        savingsTarget: savingsTarget || 0,
        remainingBalance: remainingBalance,
        dailyBurnRate: Math.round(dailyBurnRate) || 0,
        safeDailySpend: Math.round(dailySafeAmount) || 0,
        recentTransactions: recentActivity.length > 0 ? recentActivity : [{ date: new Date().toISOString(), amount: 0, category: "Info", name: "No recent transactions" }]
      };

      // Call Vercel API
      const payload = {
        message: userMessage.content,
        context: {
          ...sanitizedSnapshot,
          systemStatus: `User Context: Income: ${currencySymbol}${sanitizedSnapshot.income}, Expenses: ${currencySymbol}${sanitizedSnapshot.totalExpenses}`
        }
      };

      console.log("Sending to AI:", payload);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown API Error" }));
        throw new Error(errorData.details || errorData.error || "API_ERROR");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Error Details:", error.message || error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Connection Error: ${error.message || "Unknown Error"}. (Check console for details)`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button Glow */}
      <div
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full -z-10 blur-xl transition-all duration-500 ${isOpen ? "opacity-0" : "opacity-100"}`}
        style={{
          background: 'radial-gradient(circle, rgba(66,133,244,0.8) 0%, rgba(219,68,55,0.8) 30%, rgba(244,180,0,0.8) 60%, rgba(15,157,88,0.8) 80%, transparent 100%)',
        }}
      />

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300 ${isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-black border border-white/10 hover:scale-105"
          }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[550px] z-50 flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">BachatBuddy AI</h3>
                <p className="text-xs text-muted-foreground">Always active</p>
                <p className="text-[10px] text-emerald-500/80 mt-0.5">Advisor has analyzed 20 recent transactions</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[450px] scroll-smooth custom-scrollbar" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  <div
                    className={`p-2 rounded-full shrink-0 ${message.role === "user"
                      ? "bg-primary/20"
                      : "bg-secondary"
                      }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                      }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            strong: ({ node, ...props }) => <span className="text-emerald-400 font-bold" {...props} />,
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isChart = match && match[1] === 'chart';

                              if (!inline && isChart) {
                                try {
                                  const data = JSON.parse(String(children).replace(/\n/g, ''));
                                  return <SpendingChart data={data} />;
                                } catch (e) {
                                  return <code className={className} {...props}>{children}</code>;
                                }
                              }

                              return <code className={className} {...props}>{children}</code>;
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-secondary shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-secondary flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">The Advisor is analyzing...</span>
                  </div>
                </div>
              )}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Try: "How much did I spend on food?" or "Can I afford {currencySymbol}5000 dinner?"
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
