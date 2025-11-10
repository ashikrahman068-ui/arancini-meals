import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, BookOpen, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function ResearchAssistant({ onInsertContent }) {
  const [query, setQuery] = useState('');
  const [researching, setResearching] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleResearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a research query');
      return;
    }

    setResearching(true);
    try {
      const response = await base44.functions.invoke('perplexityResearch', {
        query: query
      });

      if (response.data.success) {
        setResult(response.data);
        toast.success('Research completed!');
      } else {
        toast.error(response.data.error || 'Research failed');
      }
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Failed to perform research');
    } finally {
      setResearching(false);
    }
  };

  const handleCopy = () => {
    if (result?.response) {
      navigator.clipboard.writeText(result.response);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (result?.response && onInsertContent) {
      onInsertContent(result.response);
      toast.success('Inserted into editor!');
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          AI Research Assistant
          <Badge className="bg-purple-100 text-purple-700">Powered by Perplexity</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What would you like to research? E.g., 'Latest nutrition trends in 2025' or 'Benefits of Mediterranean diet'"
            rows={3}
          />
        </div>

        <Button
          onClick={handleResearch}
          disabled={researching || !query.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {researching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Start Research
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Research Results</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                {onInsertContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInsert}
                  >
                    Insert
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result.response}</ReactMarkdown>
              </div>
            </div>

            {result.citations && result.citations.length > 0 && (
              <div className="text-xs text-gray-500">
                <p className="font-semibold mb-1">Sources:</p>
                <ul className="space-y-1">
                  {result.citations.map((citation, idx) => (
                    <li key={idx}>
                      <a
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        {citation}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.usage && (
              <div className="text-xs text-gray-400">
                Tokens used: {result.usage.total_tokens || 'N/A'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}