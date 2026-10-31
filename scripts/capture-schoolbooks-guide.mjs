/** Capture actual Schoolbooks production UI. No authored UI markup or CSS.
 * API fixtures adapted from the product's own e2e/agent-findings.pw.ts;
 * only fictional demo values and the successful action response are selected.
 * Start the existing product build first (no source edits):
 * PORT=3214 HOST=127.0.0.1 node <schoolbooks-repo>/apps/frontend/.output/server/index.mjs
 * Set SCHOOLBOOKS_REPO when its checkout lives elsewhere. Capture provenance
 * identifies the actual build; refresh an outdated product build before filming.
 */
import fs from 'node:fs/promises';
import {resolveRepository} from './local-config.mjs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const repo=resolveRepository('$SCHOOLBOOKS_REPO');
const out='projects/schoolbooks-feature-guide/assets/native-ui';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true});
const requests=[],errors=[],shots=[],assetPaths=new Set();
const context=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1,locale:'en-KE',timezoneId:'Africa/Nairobi',serviceWorkers:'block',colorScheme:'dark'});
const page=await context.newPage(),width=1600;
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{const u=new URL(response.url());if(u.origin==='http://127.0.0.1:3214'&&u.pathname.startsWith('/_nuxt/'))assetPaths.add(u.pathname);});
await page.clock.setFixedTime('2026-10-31T09:00:00Z');
await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin==='http://127.0.0.1:3214')await route.continue();
  else await route.abort('blockedbyclient');
});
try{
    const user = {
      id: 'view-user',
      displayName: 'Demo user',
      email: 'view@example.test',
      emailVerified: true,
    }
    await page.addInitScript(
      ({ user, theme }) => {
        localStorage.setItem(
          'schoolbooks.presentation-preferences',
          JSON.stringify({ theme }),
        )
        localStorage.setItem(
          'schoolbooks.auth.tokens',
          JSON.stringify({
            user,
            accessToken: 'view-fixture-access',
            refreshToken: 'view-fixture-refresh',
            accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            refreshTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            tokenType: 'Bearer',
            authenticationContext: {
              type: 'workspace',
              accountId: 'view-account',
              workspaceId: 'view-workspace',
            },
          }),
        )
      },
      { user, theme: 'light' },
    )

    const profile = {
      id: 'accounting-agent',
      revision: 1,
      status: 'active',
      name: 'Accounting specialist',
      description: 'Review current accounting evidence.',
      instructions: 'Read evidence.',
      definitionId: 'schoolbooks-accounting',
      definitionVersion: 1,
      capabilityIds: ['schoolbooks.receivables.reports.outstanding'],
      visibility: 'workspace',
      autonomy: 'read-only',
      scope: { kind: 'workspace' },
      managerUserIds: [],
      triggerUserIds: [],
      maxTurns: 8,
      dailyRunLimit: 20,
      ownerUserId: user.id,
      systemKey: 'accounting',
      avatarUrl: null,
      avatarState: 'failed',
      canManage: true,
      canTrigger: true,
      createdAt: '2026-10-03T00:00:00Z',
      updatedAt: '2026-10-03T00:00:00Z',
    }
    let finding = {
      id: 'finding-1',
      agentId: profile.id,
      agentRevision: 1,
      revision: 1,
      state: 'open',
      invoiceId: 'invoice-1',
      invoiceNumber: 'DEMO-1042',
      currency: 'KES',
      outstandingAmount: '24000.000000',
      dueDate: '2026-10-01',
      fingerprint: 'a'.repeat(64),
      checkedAt: '2026-10-03T00:00:00Z',
      snoozedUntil: null,
      taskId: null,
    }
    let policy = {
      id: 'policy-1',
      agentId: profile.id,
      revision: 1,
      enabled: false,
      available: true,
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      quietStart: 20,
      quietEnd: 8,
      notify: true,
      dailyCheckLimit: 24,
      lastOutcome: null,
      lastCheckedAt: null,
      nextSweepAt: null,
      checksToday: 0,
      unread: false,
      automaticModelSpend: 0,
    }
    let attempts = 1
    await page.route('**/api/v1/**', async (route) => {
      const apiPath = new URL(route.request().url()).pathname
      requests.push({method:route.request().method(),path:apiPath,intercepted:true})
      if (apiPath.endsWith('/avatar')) {
        await route.fulfill({
          status: 200,
          contentType: 'image/webp',
          path: path.join(repo,'apps/frontend/e2e/fixtures',`super-agent-${apiPath.includes('project-agent') ? 'project' : 'accounting'}.webp`),
        })
        return
      }
      let response
      if (apiPath.endsWith('/users/me/settings')) response = {
        version:1, theme:'light',locale:'en-KE',timeZone:'Africa/Nairobi',dateFormat:'dd/MM/yyyy',numberFormat:'en-KE',denseTables:false,defaultLandingPage:'/',twoFactorEnabled:false,updatedAt:'2026-10-03T00:00:00Z',presentationPreferences:{aiAssistantOpen:false,aiAssistantWidth:420,sidebarOpen:false,navigationTourSeenVersion:99,navigationWorkspaceTourSeenVersion:99}
      }
      else if (apiPath.endsWith('/event-reviews/settings')) {
        policy = {
          ...policy,
          ...route.request().postDataJSON(),
          revision: policy.revision + 1,
        }
        response = policy
      } else if (apiPath.endsWith('/event-reviews')) response = policy
      else if (apiPath.endsWith('/event-reviews/inbox'))
        response = { items: [{ ...policy, name: profile.name }] }
      else if (apiPath.endsWith('/findings/preview'))
        response = {
          finding,
          action: 'create-follow-up-task',
          title: 'Review overdue invoice DEMO-1042',
          description:
            `Review recorded outstanding ${finding.outstandingAmount} ${finding.currency} on invoice ${finding.invoiceNumber}, due ${finding.dueDate}. Verify current settlement evidence before taking financial action.\nSource: /modules/receivables?invoiceId=${finding.invoiceId}\nFinding: ${finding.id}`,
        }
      else if (apiPath.endsWith('/findings/action')) {
        attempts++
        if (attempts === 1)
          return route.fulfill({
            status: 409,
            json: {
              type: 'about:blank',
              title: 'Conflict',
              status: 409,
              detail: 'The evidence changed. Run a fresh review.',
              requestId: 'finding-fixture',
            },
          })
        finding = { ...finding, revision:finding.revision+1, state: 'actioned', taskId: 'follow-up-task' }
        response = { finding, taskId: finding.taskId }
      } else if (apiPath.endsWith('/findings/decision')) {
        const decision = route.request().postDataJSON().decision
        finding = {
          ...finding,
          revision: finding.revision + 1,
          state:
            decision === 'restore'
              ? 'open'
              : decision === 'snooze'
                ? 'snoozed'
                : 'dismissed',
        }
        response = finding
      } else if (
        apiPath.endsWith('/findings') ||
        apiPath.endsWith('/findings/review')
      )
        response = {
          items: [finding],
          coverage:
            'KES review. Private findings; other currencies require a separate review.',
        }
      else if (apiPath.endsWith('/ai/agents/accounting-agent')) response = profile
      else if (apiPath.endsWith('/ai/agents'))
        response = {
          agents: [
            {
              ...profile,
              avatarState: 'ready',
              avatarUrl: '/ai/agents/accounting-agent/avatar',
            },
            {
              ...profile,
              id: 'project-agent',
              name: 'Project coordination',
              avatarState: 'ready',
              avatarUrl: '/ai/agents/project-agent/avatar',
            },
          ],
          members: [],
          templates: [],
          definitions: [
            {
              id: 'schoolbooks-custom',
              version: 1,
              name: 'Custom agent',
              instructions: 'Work only through permitted tools.',
              capabilityIds: [],
              defaultCapabilityIds: [],
            },
          ],
          capabilities: [],
        }
      else if (apiPath.endsWith('/activity'))
        response = {
          avatarGenerations: { completed: 0, unknown: 0 },
          assignments: [],
          runs: 0,
          inputTokens: 0,
          outputTokens: 0,
        }
      else if (apiPath.endsWith('/responsibilities')) response = []
      else if (apiPath.endsWith('/revision')) response = { revision: '1' }
      else
        response = apiPath.endsWith('/auth/me')
          ? user
          : apiPath.endsWith('/me/access')
            ? {
                accounts: [
                  {
                    id: 'view-account',
                    name: 'Demo School',
                    slug: 'view-school',
                    membershipId: 'view-member',
                    defaultWorkspaceId: 'view-workspace',
                    preferredWorkspaceId: null,
                    status: 'active',
                    memberCount: 1,
                    workspaces: [
                      {
                        id: 'view-workspace',
                        name: 'Main',
                        membershipId: 'view-workspace-member',
                        memberCount: 1,
                        permissionCodes: [
                          'receivables.read',
                          'projects.manage',
                          'students.read',
                          'students.manage',
                          'education.read',
                          'roles.assign.workspace',
                        ],
                        roleKeys: [],
                      },
                    ],
                  },
                ],
              }
            : apiPath.endsWith('/modules')
              ? ['projects', 'education-core', 'student-lifecycle'].map(
                  (key) => ({
                    key,
                    name: key === 'projects' ? 'Projects' : 'Students',
                    kind: 'business',
                    accessMode: 'active',
                    entitled: true,
                    installed: true,
                    mandatory: true,
                    maturity: 'operational',
                    requiredModules: [],
                    status: 'active',
                    workspaceEnabled: true,
                  }),
                )
              : apiPath.endsWith('/me/desktop-layout')
                ? {
                    schemaVersion: 1,
                    version: 1,
                    customized: false,
                    updatedAt: null,
                    items: [{ key: 'projects', visible: true }],
                  }
                : apiPath.endsWith('/saved-views')
                  ? { items: [] }
                  : apiPath.endsWith('/education/learners')
                    ? []
                    : apiPath.endsWith('/notifications')
                      ? { notifications: [] }
                      : { items: [], hasMore: false, totalCount: 0 }
      await route.fulfill({ status: 200, json: response })
    })

    await page.goto('http://127.0.0.1:3214/agents/accounting-agent');
    const panel=page.getByRole('region',{name:'Accounting findings',exact:true});
    await panel.waitFor({state:'visible'});
    await documentReady();
    async function documentReady(){
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForFunction(()=>[...document.images].filter(i=>!i.complete).length===0);
    }
    async function shot(name,targets={}){
      await documentReady();
      await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getTiming().iterations===Infinity));
      const bounds={};for(const [key,locator] of Object.entries(targets)){
        assert(await locator.isVisible(),`Missing actual UI target: ${key}`);
        bounds[key]=key==='open'?await locator.evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);const b=r.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};}):await locator.boundingBox();
        assert(bounds[key]&&bounds[key].x>=0&&bounds[key].y>=0&&bounds[key].x+bounds[key].width<=1600&&bounds[key].y+bounds[key].height<=900,`Target outside capture: ${key}`);
      }
      const filename=`${name}.png`;
      await page.mouse.move(2,2);
      await page.screenshot({path:path.join(out,filename),animations:'disabled',caret:'hide'});
      const pixels=await fs.readFile(path.join(out,filename));
      const entry={name,file:filename,sha256:createHash('sha256').update(pixels).digest('hex'),url:new URL(page.url()).pathname,targets:bounds};shots.push(entry);return entry;
    }
    await shot('overview');
    await panel.scrollIntoViewIfNeeded();
    const review=panel.getByRole('button',{name:'Review action',exact:true});
    await shot('finding',{review,history:panel.getByRole('tab',{name:'History',exact:true}),panel});
    await review.click();
    const dialog=page.getByRole('dialog');await dialog.waitFor({state:'visible'});
    await page.getByRole('heading',{name:'Review follow-up task',exact:true}).waitFor();
    await shot('review',{confirm:dialog.getByRole('button',{name:'Create follow-up task',exact:true}),dialog});
    await dialog.getByRole('button',{name:'Create follow-up task',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    await page.getByText('Follow-up task created and verified.',{exact:true}).waitFor();
    await shot('created',{history:panel.getByRole('tab',{name:'History',exact:true}),panel});
    assert.equal(await panel.getByRole('link',{name:'Open follow-up task',exact:true}).count(),0,'Actioned finding must leave Needs attention');
    await panel.getByRole('tab',{name:'History',exact:true}).click();
    const open=panel.getByRole('link',{name:'Open follow-up task',exact:true});await open.waitFor({state:'visible'});
    assert.equal(await open.getAttribute('href'),'/tasks/follow-up-task');
    assert((await panel.textContent()).includes('24,000.00'));
    // Toast is a real transient native state; the stable History shot excludes it.
    await page.getByText('Follow-up task created and verified.',{exact:true}).waitFor({state:'hidden',timeout:15000});
    await shot('history',{open,history:panel.getByRole('tab',{name:'History',exact:true}),panel});
    assert.deepEqual(errors,[]);
    const sourceFiles=['apps/frontend/app/components/agents/AgentAccountingFindings.vue','apps/frontend/app/pages/agents/[id].vue','apps/frontend/app/assets/css/main.css','apps/frontend/e2e/agent-findings.pw.ts','apps/api/src/modules/ai-assistant/application/agents/agent-finding.service.ts','.output/nitro.json'];
    sourceFiles[sourceFiles.length-1]='apps/frontend/.output/nitro.json';
    const sourceHashes={};for(const file of sourceFiles)sourceHashes[file]=createHash('sha256').update(await fs.readFile(path.join(repo,file))).digest('hex');
    const nitro=JSON.parse(await fs.readFile(path.join(repo,'apps/frontend/.output/nitro.json'),'utf8'));
    const compiledAssetHashes={};for(const file of [...assetPaths].sort()){try{compiledAssetHashes[file]=createHash('sha256').update(await fs.readFile(path.join(repo,'apps/frontend/.output/public',file))).digest('hex');}catch{}}
    assert(Object.keys(compiledAssetHashes).length>10,'Actual compiled app assets must be recorded');
    const manifest={method:'Screenshots of the actual unmodified Schoolbooks production frontend, with browser-intercepted deterministic demo API fixtures based on its own E2E test. No UI markup, CSS, typography, layout or controls are recreated.',repository:repo,route:'/agents/accounting-agent',build:nitro,viewport:{width:1600,height:900,deviceScaleFactor:1},demoData:'Fictional invoice DEMO-1042 and KES 24,000; no live API or financial writes. Original product components execute their actual button/tab/modal handlers against isolated fixtures.',sourceHashes,compiledAssetHashes,requests,errors,shots};
    await fs.writeFile(path.join(out,'PROVENANCE.json'),JSON.stringify(manifest,null,2)+'\n');
    await fs.writeFile('projects/schoolbooks-feature-guide/src/native-ui.json',JSON.stringify({viewport:manifest.viewport,shots:shots.map(({name,file,targets})=>({name,file,targets}))},null,2)+'\n');
    await fs.mkdir('public/schoolbooks-feature-guide/native-ui',{recursive:true});
    for(const entry of shots)await fs.copyFile(path.join(out,entry.file),path.join('public/schoolbooks-feature-guide/native-ui',entry.file));
    console.log(`Captured ${shots.length} actual product UI states; all API traffic intercepted; ${errors.length} browser errors.`);
}finally{await browser.close();}
