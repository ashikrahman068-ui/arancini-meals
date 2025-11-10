import React from 'react';
import { Button } from "@/components/ui/button";
import { Bot, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ChatTrigger({ onClick, isOpen }) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
        "bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105",
        isOpen && "bg-gradient-to-r from-orange-500 to-orange-600"
      )}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
    </Button>
  );
}