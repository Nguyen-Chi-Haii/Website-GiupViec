const axios = require('axios');

const API_URL = 'http://localhost:5217/api';
const PASSWORD = 'Admin@123';

// --- CONFIGURATION ---
const COUNTS = {
  SERVICES: 5,
  CUSTOMERS: 10,
  HELPERS: 5,
  EMPLOYEES: 3,
  BOOKINGS: 30
};

// --- DATA ---
const SERVICES_DATA = [
  { name: 'Dọn Dẹp Nhà Cửa', price: 50000, isActive: true },
  { name: 'Nấu Ăn Gia Đình', price: 60000, isActive: true },
  { name: 'Chăm Sóc Người Già', price: 70000, isActive: true },
  { name: 'Vệ Sinh Máy Lạnh', price: 150000, isActive: true },
  { name: 'Giặt Ủi Đồ', price: 40000, isActive: true }
];

const LOCATIONS = [
  'Quận 1, TP.HCM', 'Quận 3, TP.HCM', 'Quận 5, TP.HCM', 
  'Quận 7, TP.HCM', 'Bình Thạnh, TP.HCM', 'Tân Bình, TP.HCM'
];

// --- HELPERS ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randArr = (arr) => arr[randInt(0, arr.length - 1)];
const randDate = (daysForward) => {
  const d = new Date();
  d.setDate(d.getDate() + randInt(1, daysForward)); // Future dates only
  d.setHours(randInt(8, 17), 0, 0, 0); // 8h to 17h (Business hours)
  return d;
};

// --- STATE ---
let tokens = {
  admin: null,
  employee: null, // Just one
  helpers: [], // [{id, token}]
  customers: [] // [{id, token}]
};
let createdServices = []; // [{id, name}]

// --- MAIN ---
async function main() {
  console.log('🚀 Starting COMPLEX Seeding...');

  // 1. Create & Login Admin
  const adminUser = { fullName: 'Super Admin', email: 'admin@admin.com', phone: '0901000000', password: PASSWORD, role: 1, status: 1 };
  await registerOrLogin(adminUser, 'admin');

  // 2. Create Services
  console.log('\n🛠️ Creating Services...');
  for (const s of SERVICES_DATA) {
    try {
      const res = await axios.post(`${API_URL}/services`, s, auth(tokens.admin));
      createdServices.push({ id: res.data.id, name: res.data.name });
      console.log(`  + Service: ${s.name} (ID: ${res.data.id})`);
    } catch (e) { console.log(`  = Service exists: ${s.name}`); }
  }
  // Ensure we have IDs even if exists (fetch all if push failed)
  if (createdServices.length === 0) {
    const res = await axios.get(`${API_URL}/services`);
    createdServices = res.data.map(s => ({ id: s.id, name: s.name }));
  }

  // 3. Create Employees
  console.log('\n👔 Creating Employees...');
  for (let i = 1; i <= COUNTS.EMPLOYEES; i++) {
    const u = { fullName: `Employee ${i}`, email: `employee${i}@test.com`, phone: `090200000${i}`, password: PASSWORD, role: 2, status: 1 };
    await registerOrLogin(u, 'employee'); // Store last one
  }

  // 4. Create Helpers & Profiles
  console.log('\n👷 Creating Helpers...');
  for (let i = 1; i <= COUNTS.HELPERS; i++) {
    const u = { fullName: `Helper ${i}`, email: `helper${i}@test.com`, phone: `090300000${i}`, password: PASSWORD, role: 3, status: 1 };
    const data = await registerOrLogin(u, 'helper');
    if (data) {
      // Create Profile
      try {
        await axios.post(`${API_URL}/helperprofiles`, {
          userId: data.userId,
          bio: `Chuyên nghiệp, ${randInt(1, 10)} năm kinh nghiệm.`,
          activeArea: randArr(LOCATIONS),
          hourlyRate: randInt(4, 10) * 10000,
          experienceYears: randInt(1, 10)
        }, auth(data.token));
        console.log(`  + Profile created for ${u.email}`);
      } catch (e) { /* Ignore if exists */ }
      tokens.helpers.push(data);
    }
  }

  // 5. Create Customers
  console.log('\n👤 Creating Customers...');
  for (let i = 1; i <= COUNTS.CUSTOMERS; i++) {
    const u = { fullName: `Customer ${i}`, email: `customer${i}@test.com`, phone: `090400000${i}`, password: PASSWORD, role: 4, status: 1 };
    const data = await registerOrLogin(u, 'customer');
    if (data) tokens.customers.push(data);
  }

  // 6. Generate Bookings
  console.log(`\n📅 Generating ${COUNTS.BOOKINGS} Bookings (next 90 days)...`);
  for (let i = 0; i < COUNTS.BOOKINGS; i++) {
    const customer = randArr(tokens.customers);
    const service = randArr(createdServices);
    const startDate = randDate(90);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + randInt(2, 4));

    try {
      // Create
      // Calculate WorkShift (HH:mm)
      const pad = (n) => n.toString().padStart(2, '0');
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      
      const createPayload = {
        serviceId: service.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        workShiftStart: `${pad(startHour)}:00:00`,
        workShiftEnd: `${pad(endHour)}:00:00`,
        address: randArr(LOCATIONS),
        notes: `Random Booking ${i+1}`
      };
      const res = await axios.post(`${API_URL}/bookings`, createPayload, auth(customer.token));
      const bookingId = res.data.id;
      
      // Decide Flow
      const rand = Math.random();
      let targetStatus = 1; // Pending
      if (rand > 0.8) targetStatus = 5; // Cancelled (20%)
      else if (rand > 0.7) targetStatus = 3; // Rejected (10%)
      else if (rand > 0.4) targetStatus = 2; // Confirmed (30%)
      else targetStatus = 4; // Completed (40%)

      console.log(`  > Booking #${bookingId} [${service.name}] -> Target: ${getStatusName(targetStatus)}`);

      // Process Flow
      if (targetStatus === 5) { // Cancelled
         await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 5 }, auth(customer.token)); 
      } else if (targetStatus === 3) { // Rejected
         await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 3 }, auth(tokens.admin));
      } else if (targetStatus === 2 || targetStatus === 4) {
         // Need Helper
         const helper = randArr(tokens.helpers);
         // Assign
         await axios.put(`${API_URL}/bookings/assign-helper`, { bookingId, helperId: helper.userId }, auth(tokens.admin));
         // Confirm
         await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 2 }, auth(tokens.admin));

         if (targetStatus === 4) {
           // Complete
           await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 4 }, auth(helper.token));
           // Payment
           await axios.put(`${API_URL}/bookings/${bookingId}/payment-confirm`, {}, auth(tokens.admin));
           // Rating (80% chance)
           if (Math.random() > 0.2) {
             await axios.post(`${API_URL}/ratings`, {
               bookingId,
               score: randInt(3, 5),
               comment: randArr(['Tuyệt vời', 'Rất tốt', 'Tạm ổn', 'Làm sạch sẽ', 'Đúng giờ'])
             }, auth(customer.token));
             console.log(`    ⭐ Rated`);
           }
         }
      }

    } catch (err) {
      console.error(`  ❌ Error processing booking:`);
      // console.log('Parsed Payload:', JSON.stringify(createPayload)); // Uncomment if needed
      if (err.response) {
        console.error('    Status:', err.response.status);
        console.error('    Data:', JSON.stringify(err.response.data));
      } else {
        console.error('    Message:', err.message);
      }
    }
  }

  console.log('\n✨ All Done! Database populated with rich data. ✨');
}

// --- UTILS ---
function auth(token) { return { headers: { Authorization: `Bearer ${token}` } }; }

async function registerOrLogin(user, tokenKey) {
  try {
    await axios.post(`${API_URL}/auth/register`, user);
  } catch(e) {} // Exists

  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email: user.email, password: user.password });
    const data = { token: res.data.token, userId: res.data.userId };
    if (tokenKey === 'admin') tokens.admin = data.token;
    if (tokenKey === 'employee') tokens.employee = data.token;
    return data;
  } catch (e) {
    console.error(`  ❌ Login failed for ${user.email}`);
    return null;
  }
}

function getStatusName(s) {
  return { 1: 'Pending', 2: 'Confirmed', 3: 'Rejected', 4: 'Completed', 5: 'Cancelled' }[s];
}

main();
