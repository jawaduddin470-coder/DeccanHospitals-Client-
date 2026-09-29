import React from 'react';
import { Container } from '../components/common/Container';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <PageTransition className="justify-center items-center py-20">
      <Container size="sm">
        <Card variant="default" padding="xl" className="text-center space-y-6 border border-[#D6EAF1] shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#E2F4F9] text-[#0879A5] flex items-center justify-center mx-auto">
            <span className="font-mono text-2xl font-bold">404</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-[#103A50]">
              Page Not Found
            </h1>
            <p className="text-sm text-[#617786] max-w-sm mx-auto leading-relaxed">
              The requested hospital page or resource does not exist or has been moved.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              to="/"
              variant="primary"
              size="md"
              icon={<Home className="w-4 h-4" />}
            >
              Return to Homepage
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="md"
            >
              Hospital Contact
            </Button>
          </div>
        </Card>
      </Container>
    </PageTransition>
  );
};
