import { ApiTestPage } from '@/app/_test-utils/ApiTestPage';

export default function ApiErrorTestPage() {
  return <ApiTestPage />;
}

// Add metadata for the page
export const metadata = {
  title: 'API Error Testing',
  description: 'Test API error handling and responses',
};
