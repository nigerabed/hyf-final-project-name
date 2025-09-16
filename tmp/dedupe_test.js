(async () => {
  try {
    const url = 'http://localhost:3001/api/tours?limit=12&page=1';
    console.log('Fetching', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error('HTTP error', res.status);
      process.exit(1);
    }
    const data = await res.json();
    const list = Array.isArray(data.tours) ? data.tours : Array.isArray(data) ? data : (data.travel_plans || []);
    console.log('Incoming ids:', list.map((t) => t && t.id));
    const deduped = Array.isArray(list) ? list.filter((v, i, a) => a.findIndex((t) => String(t?.id) === String(v?.id)) === i) : list;
    console.log('Deduped ids:', deduped.map((t) => t && t.id));
    console.log('Counts => incoming:', list.length, 'deduped:', deduped.length);
  } catch (e) {
    console.error('Error', e);
    process.exit(1);
  }
})();
