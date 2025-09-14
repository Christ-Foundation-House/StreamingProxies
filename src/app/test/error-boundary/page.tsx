import { ErrorTestPage } from '@/app/_test-utils/ErrorTestPage';

export default function ErrorBoundaryTestPage() {
  return <ErrorTestPage />;
}

// Add metadata for the page
export const metadata = {
  title: 'Error Boundary Test',
  description: 'Test page for error boundaries and error handling',
};
