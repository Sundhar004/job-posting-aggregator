// End-to-end test: Login → Extract → Save Job → Fetch Dashboard → Export CSV

const BASE = 'http://localhost:3000';

async function getCsrfToken() {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const data = await res.json();
  return data.csrfToken;
}

async function login(csrfToken) {
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      csrfToken,
      email: 'testuser@example.com',
      password: 'Test1234!',
      json: 'true',
    }),
    redirect: 'manual',
  });
  // Grab the Set-Cookie header for the session
  const cookies = res.headers.getSetCookie?.() || [];
  return cookies.join('; ');
}

async function testExtract(cookie) {
  console.log('\n--- Test: Gemini Extraction ---');
  const res = await fetch(`${BASE}/api/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      text: 'Senior Frontend Developer at Google, Bangalore India (Hybrid). Salary: 30-50 LPA. Required: React, TypeScript, Next.js, GraphQL, 5+ years experience. Apply by July 30 2026. Build beautiful UIs for Google Cloud products.',
    }),
  });
  const data = await res.json();
  console.log('Status:', res.status);
  if (res.ok) {
    console.log('✅ Extraction succeeded!');
    console.log('Job Title:', data.data?.jobTitle);
    console.log('Company:', data.data?.companyName);
    console.log('Skills:', data.data?.requiredSkills);
    console.log('Match %:', data.matchPercent);
  } else {
    console.log('❌ Extraction failed:', data);
  }
  return data;
}

async function testSaveJob(cookie, extractData) {
  console.log('\n--- Test: Save Job ---');
  const jobPayload = {
    ...extractData.data,
    sourceUrl: '',
    rawText: 'Senior Frontend Developer at Google...',
    status: 'Saved',
    matchPercent: extractData.matchPercent || 0,
  };
  const res = await fetch(`${BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(jobPayload),
  });
  const data = await res.json();
  console.log('Status:', res.status);
  if (res.ok) {
    console.log('✅ Job saved! ID:', data.job?._id);
  } else {
    console.log('❌ Save failed:', data);
  }
  return data;
}

async function testFetchJobs(cookie) {
  console.log('\n--- Test: Fetch Jobs (Dashboard) ---');
  const res = await fetch(`${BASE}/api/jobs`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  console.log('Status:', res.status);
  if (res.ok) {
    console.log(`✅ Found ${data.jobs?.length || 0} job(s)`);
    data.jobs?.forEach((j, i) => console.log(`  ${i + 1}. ${j.jobTitle} @ ${j.companyName} [${j.status}]`));
  } else {
    console.log('❌ Fetch failed:', data);
  }
  return data;
}

async function testStatusUpdate(cookie, jobId) {
  console.log('\n--- Test: Status Update (Saved → Applied) ---');
  const res = await fetch(`${BASE}/api/jobs/${jobId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({ status: 'Applied' }),
  });
  const data = await res.json();
  console.log('Status:', res.status);
  if (res.ok) {
    console.log('✅ Status updated to:', data.job?.status);
  } else {
    console.log('❌ Update failed:', data);
  }
}

async function testExport(cookie) {
  console.log('\n--- Test: CSV Export ---');
  const res = await fetch(`${BASE}/api/export`, {
    headers: { Cookie: cookie },
  });
  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
  if (res.ok) {
    const csv = await res.text();
    console.log('✅ CSV export succeeded! First 200 chars:');
    console.log(csv.substring(0, 200));
  } else {
    console.log('❌ Export failed');
  }
}

async function run() {
  console.log('=== E2E Test Suite ===\n');

  // Step 1: Auth
  console.log('--- Test: Authentication ---');
  const csrf = await getCsrfToken();
  console.log('CSRF Token:', csrf ? '✅ obtained' : '❌ missing');

  const cookie = await login(csrf);
  console.log('Session Cookie:', cookie ? '✅ obtained' : '❌ missing');

  if (!cookie) {
    console.error('Cannot proceed without authentication');
    process.exit(1);
  }

  // Step 2: Gemini Extraction
  const extractResult = await testExtract(cookie);

  // Step 3: Save Job
  let savedJob;
  if (extractResult?.data) {
    savedJob = await testSaveJob(cookie, extractResult);
  }

  // Step 4: Fetch Dashboard
  await testFetchJobs(cookie);

  // Step 5: Status Update
  if (savedJob?.job?._id) {
    await testStatusUpdate(cookie, savedJob.job._id);
  }

  // Step 6: CSV Export
  await testExport(cookie);

  console.log('\n=== E2E Test Suite Complete ===');
  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
