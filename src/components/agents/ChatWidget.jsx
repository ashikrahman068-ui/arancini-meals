import React, { useState, useEffect, useRef } from 'react';
import { agentSDK } from "@/agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./ChatBubble";
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ChatWidget({ isOpen, onClose, agentName = "order_assistant", title = "Arancini AI Assistant" }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    // Reset conversation when the agent changes so a fresh one is created
    setConversation(null);
    setMessages([]);
  }, [agentName]);

  useEffect(() => {
    if (isOpen && !conversation) {
      const initConversation = async () => {
        setIsLoading(true);
        const conv = await agentSDK.createConversation({ agent_name: agentName });
        setConversation(conv);
        setMessages(conv.messages);
        setIsLoading(false);
      };
      initConversation();
    }
  }, [isOpen, conversation, agentName]); // Added 'conversation' and 'agentName' to dependencies

  useEffect(() => {
    if (conversation) {
      const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
        // Updated logic for isLoading
        const isAgentReplying = data.messages.length > 0 && data.messages[data.messages.length - 1]?.role === 'assistant' && data.messages[data.messages.length - 1]?.status !== 'completed';
        const isUserLastMessage = data.messages.length > 0 && data.messages[data.messages.length - 1]?.role === 'user';
        
        // Set loading if the agent is replying or if the user just sent a message
        setIsLoading(isAgentReplying || isUserLastMessage);
      });
      return () => unsubscribe();
    }
  }, [conversation]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversation) return;
    
    const messageContent = inputValue;
    setInputValue('');
    setIsLoading(true);

    await agentSDK.addMessage(conversation, {
      role: 'user',
      content: messageContent,
    });
  };

  return (
    <div className={cn(
      "fixed bottom-20 right-5 w-80 h-[28rem] bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 origin-bottom-right",
      isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </header>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))
            )}
            {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
               <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
          <Input 
            placeholder="Ask about meals..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}