import { useState } from 'react';
import RouteAdvisoryForm, { RouteAdvisoryResult } from '../components/RouteAdvisoryForm';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';

export default function RouteAdvisory() {
  const [result, setResult] = useState(null);

  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Decision support"
        title="Route Advisory"
        description="Intelligent voyage risk assessment combining weather, hazards, and vessel characteristics."
      />
      <RouteAdvisoryForm onResult={setResult} />
      <RouteAdvisoryResult result={result} />
    </PageLayout>
  );
}
