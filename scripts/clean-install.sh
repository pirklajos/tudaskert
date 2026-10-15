#!/usr/bin/env bash
set -euo pipefail
# Only copies public source and lockfiles. No live DB or credentials are touched.
workspace=$(cd "$(dirname "$0")/.." && pwd)
scratch=$(mktemp -d /tmp/zorka-clean-install.XXXXXX)
mkdir -p "$scratch/backend"
cp "$workspace/package.json" "$workspace/package-lock.json" "$scratch/"
cp -R "$workspace/public" "$workspace/scripts" "$workspace/tests" "$scratch/"
cp "$workspace/backend/composer.json" "$workspace/backend/composer.lock" "$workspace/backend/symfony.lock" "$scratch/backend/"
cp -R "$workspace/backend/config" "$workspace/backend/src" "$workspace/backend/bin" "$workspace/backend/public" "$workspace/backend/tests" "$scratch/backend/"
cp "$workspace/backend/.env" "$scratch/backend/.env"
cd "$scratch"
npm ci --no-audit
npm test
npm run check:generated
cd backend
"${ZORKA_COMPOSER:-composer}" install --no-interaction --no-progress --no-scripts
php bin/console lint:container
php bin/console doctrine:schema:validate --skip-sync
php tests/domain.php
php tests/smoke.php
echo "Clean source install passed: $scratch (no credentials copied; temporary files retained)."
