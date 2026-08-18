import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flxjaaiqhaswecvrmeop.supabase.co';
const supabaseAnonKey = 'sb_publishable_zs3ZKP86BDAphQbECOzwKw_WvL7L1Zk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);