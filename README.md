# Home Assistant Dashboard

There's a lot that Home Assistant's Lovelace dashboards are capable of, especially when paired with HACS, but, at the end of the day, it's not easy to force it do exactly what you want. This is my attempt at a completely custom-built dashboard instead, leveraging the official WebSocket library [home-assistant/home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket) and official [REST/websocket APIs](https://developers.home-assistant.io/docs/api/rest) for additional functionality (like historical data).

Features include:
- switch controls, including brightness for dimmer switches
- HLS camera streams, including a toggle switch for saving recordings
- sensor tiles, optionally with a history graph or a speedometer-style needle
- graph to track historical data for multiple sensors
- thermostat control, including presets

![Screenshot of dashboard](/public/screenshot.png)

See [azhu2/home-assistant-setup](https://github.com/azhu2/home-assistant-setup) for my HA setup.

Icons by [icons8](https://icons8.com/)

# Usage
- Development
    - `npm run start`
    - Defaults to http://localhost:3000/
- Production
    - Github Actions push a Docker image to the [Github Docker respository](https://github.com/azhu2/home-assistant-dashboard/pkgs/container/home-assistant-dashboard)
    - `docker pull ghcr.io/azhu2/home-assistant-dashboard:latest`
    - `docker run -p 80:80 ghcr.io/azhu2/home-assistant-dashboard`

You may need to set up CORS ([example](https://github.com/azhu2/home-assistant-setup/blob/00dfafb00ff0ff56e0008cac0fef6654ded1f396/configuration.yaml#L17-L20)) on your Home Assistant instance.
