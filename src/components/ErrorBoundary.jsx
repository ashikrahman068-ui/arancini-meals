import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred while loading this page. Try reloading — your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-green-600 hover:bg-green-700" onClick={this.handleReload}>
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}