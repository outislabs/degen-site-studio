import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoinData, defaultCoinData } from '@/types/coin';

const KNOWN_HOSTS = [
  'localhost',
  'degentools.co',
  'www.degentools.co',
  'degen-site-studio.lovable.app',
];

const SUBDOMAIN_BASE = 'degentools.co';

  }, []);

  return state;
};
