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
