const axios = require('axios');
axios.get('http://localhost:3000/api/items?limit=5')
  .then(res => console.log(JSON.stringify(res.data.payload.records.map(i => ({ label: i.label, unit: i.unit })), null, 2)))
  .catch(err => console.error(err.message));
