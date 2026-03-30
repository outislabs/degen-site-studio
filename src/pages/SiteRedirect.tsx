import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSiteUrl } from '@/lib/siteUrl';

const SiteRedirect = () => {
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      window.location.replace(getSiteUrl(id));
    }
  }, [id]);

  return (
    <div className="min-h-screen gradient-degen flex items-center justify-center">
      <div className="text-primary animate-pulse font-display text-sm">Redirecting…</div>
    </div>
  );
};

export default SiteRedirect;
