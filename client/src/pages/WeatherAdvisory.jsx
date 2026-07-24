import WeatherPanel from '../components/WeatherPanel';
import PageLayout from '../components/ui/PageLayout';
import PageHeader from '../components/ui/PageHeader';

export default function WeatherAdvisory() {
  return (
    <PageLayout size="md">
      <PageHeader
        eyebrow="Environmental data"
        title="Weather Advisory"
        description="Live meteorological conditions for the Niger–Benue corridor, sourced from Open-Meteo."
      />
      <WeatherPanel />
    </PageLayout>
  );
}
