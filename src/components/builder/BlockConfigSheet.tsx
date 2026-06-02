import { CoinData } from '@/types/coin';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import StepCoinBasics from './StepCoinBasics';
import StepTokenomics from './StepTokenomics';
import StepSocials from './StepSocials';
import StepRoadmap from './StepRoadmap';
import StepNftGallery from './StepNftGallery';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedId: string | null;
  data: CoinData;
  onChange: (patch: Partial<CoinData>) => void;
  // Hero-specific extras (slug + domain) since StepCoinBasics owns them.
  slug: string;
  onSlugChange: (v: string) => void;
  siteId: string | null;
  domainPaymentStatus: string;
  onPaymentStatusChange: (v: string) => void;
  slugError: string | null;
}

const TITLES: Record<string, string> = {
  'section:hero': 'Hero — basics & branding',
  'section:tokenomics': 'Tokenomics',
  'section:socials': 'Socials',
  'section:roadmap': 'Roadmap',
  'section:gallery': 'NFT Gallery',
};

const BlockConfigSheet = (props: Props) => {
  const {
    open, onClose, selectedId, data, onChange,
    slug, onSlugChange, siteId, domainPaymentStatus, onPaymentStatusChange, slugError,
  } = props;

  const title = selectedId ? (TITLES[selectedId] ?? 'Configure block') : 'Configure block';

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Changes apply live to the preview.
          </SheetDescription>
        </SheetHeader>

        {selectedId === 'section:hero' && (
          <StepCoinBasics
            data={data}
            onChange={onChange}
            slug={slug}
            onSlugChange={onSlugChange}
            siteId={siteId}
            domainPaymentStatus={domainPaymentStatus}
            onPaymentStatusChange={onPaymentStatusChange}
            slugError={slugError}
          />
        )}
        {selectedId === 'section:tokenomics' && (
          <StepTokenomics data={data} onChange={onChange} />
        )}
        {selectedId === 'section:socials' && (
          <StepSocials data={data} onChange={onChange} />
        )}
        {selectedId === 'section:roadmap' && (
          <StepRoadmap data={data} onChange={onChange} />
        )}
        {selectedId === 'section:gallery' && (
          <StepNftGallery data={data} onChange={onChange} />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BlockConfigSheet;