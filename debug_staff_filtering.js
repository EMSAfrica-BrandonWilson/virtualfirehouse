import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhrecxzygcapozirquzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log('Supabase URL:', supabaseUrl);

    const { data: stations, error: stationsErr } = await supabase.from('fire_stations_vfh').select('*');
    if (stationsErr) throw stationsErr;
    console.log('fire_stations_vfh count:', stations?.length || 0);
    console.log('fire_stations_vfh sample (first 20):');
    console.log(JSON.stringify((stations || []).slice(0, 20), null, 2));

    const medicStation = (stations || []).find(st => {
      const vals = [st.name, st.station_name, st.fire_station_name, st.allocation_name, st.display_name].map(v => (v || '').toLowerCase());
      return vals.some(v => v.includes('medic tango'));
    });
    console.log('Medic Tango station record:');
    console.log(JSON.stringify(medicStation || null, null, 2));

    const { data: shifts, error: shiftsErr } = await supabase.from('operational_shifts').select('*');
    if (shiftsErr) throw shiftsErr;
    console.log('operational_shifts count:', shifts?.length || 0);
    console.log('operational_shifts sample (first 20):');
    console.log(JSON.stringify((shifts || []).slice(0, 20), null, 2));

    const blueShift = (shifts || []).find(sh => {
      const vals = [sh.name, sh.shift_name, sh.operational_shift_name, sh.display_name].map(v => (v || '').toLowerCase());
      return vals.some(v => v.includes('blue'));
    });
    console.log('Blue Shift record:');
    console.log(JSON.stringify(blueShift || null, null, 2));

    const { data: staff, error: staffErr } = await supabase.from('staff_basic_info').select('*');
    if (staffErr) throw staffErr;
    console.log('staff_basic_info count:', staff?.length || 0);
    console.log('staff_basic_info sample (first 20):');
    console.log(JSON.stringify((staff || []).slice(0, 20), null, 2));

    const staffMedic = (staff || []).filter(p => {
      const byId = medicStation && p.fire_station_id === medicStation.id;
      const byName = ['fire_station_name', 'station_name', 'home_station'].some(k => ((p[k] || '').toLowerCase().includes('medic tango')));
      return byId || byName;
    });
    console.log('staff at Medic Tango count:', staffMedic.length);
    console.log(JSON.stringify(staffMedic, null, 2));

    const staffMedicBlue = staffMedic.filter(p => {
      return ['operational_shift_name', 'shift_name', 'shift'].some(k => ((p[k] || '').toLowerCase().includes('blue')));
    });
    console.log('staff at Medic Tango AND Blue Shift count:', staffMedicBlue.length);
    console.log(JSON.stringify(staffMedicBlue, null, 2));
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  }
}

run();
