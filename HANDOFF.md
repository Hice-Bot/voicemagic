# VoiceMagic Handoff

This app is deployed from `/home/voicemagic/app`.

The `voicemagic` user is intentionally restricted and does not have general Docker access.

Use these commands for routine operations:

```bash
cd /home/voicemagic/app
sudo /usr/local/bin/voicemagicctl status
sudo /usr/local/bin/voicemagicctl logs
sudo /usr/local/bin/voicemagicctl deploy
sudo /usr/local/bin/voicemagicctl restart
```

Operational notes:

- The live Docker Compose file is `/home/voicemagic/app/docker-compose.yml`.
- The app is exposed on host port `3100`.
- Do not add the `voicemagic` user to the `docker` group.
- Do not move the project directory without updating `/usr/local/bin/voicemagicctl`.
- Environment variables are stored in `.env` in this directory.
