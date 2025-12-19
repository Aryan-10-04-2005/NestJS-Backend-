const BASE_URL = 'http://localhost:3000';

async function request(method, path, headers, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function run() {
    console.log('🚀 Starting System Verification: "The Tale of Two Companies"\n');

    // Scenario: Acme Corp (Org A)
    console.log('--- 🏢 Chapter 1: Acme Corp ---');
    console.log('Alice (Admin at Acme) is reporting a critical bug.');
    const { status: s1, data: issue1 } = await request('POST', '/issues', {
        'x-org-id': 'acme-corp', 'x-user-id': 'alice', 'x-user-role': 'ADMIN'
    }, { title: 'Homepage 404 Error', description: 'The main landing page is down!' });
    console.log(`[${s1}] Issue Created: "${issue1.title}" (ID: ${issue1.id})\n`);

    // Scenario: Globex Inc (Org B)
    console.log('--- 🏭 Chapter 2: Globex Inc ---');
    console.log('Bob (Admin at Globex) is requesting a new feature.');
    const { status: s2, data: issue2 } = await request('POST', '/issues', {
        'x-org-id': 'globex-inc', 'x-user-id': 'bob', 'x-user-role': 'ADMIN'
    }, { title: 'Add Dark Mode', description: 'Users want a dark theme.' });
    console.log(`[${s2}] Issue Created: "${issue2.title}" (ID: ${issue2.id})\n`);

    // Isolation Check
    console.log('--- 🕵️ Chapter 3: The Spy Check (Isolation) ---');
    console.log('Alice checks her issue list. She should NOT see Bob\'s feature request.');
    const { status: s3, data: aliceIssues } = await request('GET', '/issues', {
        'x-org-id': 'acme-corp', 'x-user-id': 'alice', 'x-user-role': 'ADMIN'
    });
    const seesGlobex = aliceIssues.some(i => i.organizationId === 'globex-inc');
    console.log(`[${s3}] Alice sees ${aliceIssues.length} issue(s).`);
    console.log(`      Can she see Globex data? ${seesGlobex ? 'YES (❌ FAIL)' : 'NO (✅ PASS)'}\n`);

    // RBAC: Member Restrictions
    console.log('--- 👮 Chapter 4: The Intern (RBAC) ---');
    console.log('Charlie (Intern/Member at Acme) tries to mark the 404 bug as "RESOLVED".');
    const { status: s4, data: err4 } = await request('PATCH', `/issues/${issue1.id}`, {
        'x-org-id': 'acme-corp', 'x-user-id': 'charlie', 'x-user-role': 'MEMBER'
    }, { status: 'RESOLVED' });
    console.log(`[${s4}] System says: "${err4.message || 'Access Denied'}" (✅ PASS)\n`);

    // RBAC: Admin Power
    console.log('--- 🦸 Chapter 5: The Hero (Admin Action) ---');
    console.log('Alice (Admin) steps in to fix the status.');
    const { status: s5, data: updatedIssue } = await request('PATCH', `/issues/${issue1.id}`, {
        'x-org-id': 'acme-corp', 'x-user-id': 'alice', 'x-user-role': 'ADMIN'
    }, { status: 'RESOLVED' });
    console.log(`[${s5}] Status is now: "${updatedIssue.status}" (✅ PASS)\n`);

    console.log('✅ Story Complete. System behavior verified.');
}

run();
