import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:8080' },
  webServer: { command: 'APP_ENV=test APP_DEBUG=0 php backend/bin/console cache:clear && APP_ENV=test APP_DEBUG=0 php -S 127.0.0.1:8080 -t public router.php', url: 'http://127.0.0.1:8080', reuseExistingServer: false },
  projects: [
    { name: 'phone', use: { viewport:{width:360,height:800}, isMobile:true, hasTouch:true } },
    { name: 'tablet', use: { viewport:{width:800,height:1024}, isMobile:true, hasTouch:true } },
    { name: 'landscape', use: { viewport:{width:800,height:360}, isMobile:true, hasTouch:true } },
    { name: 'desktop', use: { viewport:{width:1680,height:800} } },
  ],
});
