# VoiceMagic Operations

## Scope

This document is the operator runbook for the `voicemagic.dev` app on this VPS.

- Live app directory: `/home/voicemagic/app`
- Service user: `voicemagic`
- Compose project: `voicemagic`
- Compose file: `/home/voicemagic/app/docker-compose.yml`
- Host port: `3100`

The app is intentionally operated through a narrow wrapper instead of raw Docker access.

## Access Model

The `voicemagic` account is intentionally restricted.

- SSH access is public-key only for `voicemagic`
- Password login is disabled for `voicemagic`
- SSH forwarding features are disabled for `voicemagic`
- The `voicemagic` user must not be added to the `docker` group

Allowed operational commands for `voicemagic`:

```bash
sudo /usr/local/bin/voicemagicctl deploy
sudo /usr/local/bin/voicemagicctl restart
sudo /usr/local/bin/voicemagicctl status
sudo /usr/local/bin/voicemagicctl logs
```

Do not use raw `docker compose` commands as the standard workflow for this app.

## Day-To-Day Commands

Run all commands from the app directory unless you have a specific reason not to:

```bash
cd /home/voicemagic/app
```

Check container status:

```bash
sudo /usr/local/bin/voicemagicctl status
```

View recent app logs:

```bash
sudo /usr/local/bin/voicemagicctl logs
```

Deploy the current app state:

```bash
sudo /usr/local/bin/voicemagicctl deploy
```

Restart the current container without rebuilding:

```bash
sudo /usr/local/bin/voicemagicctl restart
```

## Deployment Workflow

Standard deployment flow:

1. Review the repo state.
2. Confirm `.env` is correct for the environment.
3. Run `sudo /usr/local/bin/voicemagicctl deploy`.
4. Confirm the container is up with `status`.
5. Verify the HTTP endpoint responds.
6. Check logs for startup errors.

Example:

```bash
cd /home/voicemagic/app
git status --short
sudo /usr/local/bin/voicemagicctl deploy
sudo /usr/local/bin/voicemagicctl status
curl -I --max-time 10 http://127.0.0.1:3100
sudo /usr/local/bin/voicemagicctl logs
```

Expected health check result:

- `curl -I http://127.0.0.1:3100` should return an HTTP response such as `200 OK`

## Configuration

Environment variables are stored in:

```bash
/home/voicemagic/app/.env
```

Important notes:

- The container is built from the local source tree
- The running service uses Docker Compose from the app directory
- Changes to `.env`, `Dockerfile`, dependency manifests, or app code may require a rebuild via `deploy`

## Secret Rotation

When rotating application secrets, treat `.env` as the source of truth for runtime configuration.

Recommended procedure:

1. Review which values need to change and whether they also need to be rotated in external providers.
2. Make a backup copy of the current `.env` contents in a secure admin-controlled location before editing.
3. Edit `/home/voicemagic/app/.env`.
4. Re-run the app deployment with `sudo /usr/local/bin/voicemagicctl deploy`.
5. Verify the app responds and inspect logs for authentication or integration failures.

Example:

```bash
cd /home/voicemagic/app
cp .env .env.pre-rotation-$(date +%F-%H%M%S)
vi .env
sudo /usr/local/bin/voicemagicctl deploy
curl -I --max-time 10 http://127.0.0.1:3100
sudo /usr/local/bin/voicemagicctl logs
```

Notes:

- Avoid printing secrets into shared shells, tickets, or chat logs.
- If a provider rotates both an access key and secret, update both sides in one maintenance window.
- If a secret is suspected to be compromised, rotate it at the provider first, then update `.env`, then redeploy immediately.
- Remove stale backup copies of `.env` when they are no longer needed.

## SSH Key Onboarding

The `voicemagic` account is SSH key-only. To grant access, add the operator's public key to:

```bash
/home/voicemagic/.ssh/authorized_keys
```

Permissions must remain:

- `/home/voicemagic/.ssh` as `0700`
- `/home/voicemagic/.ssh/authorized_keys` as `0600`

Add a new key:

```bash
install -d -m 0700 -o voicemagic -g voicemagic /home/voicemagic/.ssh
vi /home/voicemagic/.ssh/authorized_keys
chown voicemagic:voicemagic /home/voicemagic/.ssh/authorized_keys
chmod 0600 /home/voicemagic/.ssh/authorized_keys
```

Replace or remove a key:

1. Edit `/home/voicemagic/.ssh/authorized_keys`.
2. Remove the old public key line or replace it with the new one.
3. Re-check file ownership and permissions.
4. Test SSH access with a second session before closing the current one.

Verification:

```bash
ls -ld /home/voicemagic/.ssh /home/voicemagic/.ssh/authorized_keys
```

Operational notes:

- Keep one verified admin session open while changing SSH keys.
- Prefer one key per person so access can be revoked cleanly.
- Label keys with a trailing comment such as an email address or owner name.
- Do not enable password login for convenience; keep the account key-only.

## Backups And Rollback

Current root-owned archive path:

```bash
/root/archives/voicemagic-app-2026-04-22.tar.gz
```

This archive is intended as an administrative backup. The `voicemagic` user should not rely on root-only backup paths for normal workflow.

Rollback posture:

- There is no dedicated self-service rollback command today
- The normal recovery path is to restore known-good code into `/home/voicemagic/app` and run `sudo /usr/local/bin/voicemagicctl deploy`
- If a deployment fails, inspect `status` and `logs` first before making more changes

## Troubleshooting

If deploy fails during build:

- Check `package.json`, lockfiles, and `Dockerfile` changes
- Review app logs and build output carefully
- Confirm required environment variables still exist in `.env`

If the container is running but the app is unhealthy:

- Run `sudo /usr/local/bin/voicemagicctl logs`
- Check `curl -I --max-time 10 http://127.0.0.1:3100`
- Review recent code or config changes

If permissions look wrong:

- The app directory should be owned by `voicemagic:voicemagic`
- The SSH directory should remain `0700`
- `authorized_keys` should remain `0600`

## Guardrails

Do not do the following without an explicit administrative reason:

- Do not add `voicemagic` to the `docker` group
- Do not move `/home/voicemagic/app` without updating `/usr/local/bin/voicemagicctl`
- Do not edit `/etc/sudoers.d/voicemagic` casually
- Do not weaken the SSH `Match User voicemagic` restrictions casually
- Do not treat the old `/home/mcuser/voicemagic` path as active; it was removed during handoff cleanup

## Files To Know

- App runbook: `/home/voicemagic/app/OPERATIONS.md`
- Handoff note: `/home/voicemagic/app/HANDOFF.md`
- Deploy wrapper: `/usr/local/bin/voicemagicctl`
- Sudo rule: `/etc/sudoers.d/voicemagic`
- SSH restriction: `/etc/ssh/sshd_config.d/99-voicemagic-hardening.conf`
