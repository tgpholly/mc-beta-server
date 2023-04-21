# mc-beta-server [![CodeFactor](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/badge/typescript)](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/overview/typescript) [![Node.js CI](https://github.com/tgpholly/mc-beta-server/actions/workflows/node.js.yml/badge.svg?branch=typescript)](https://github.com/tgpholly/mc-beta-server/actions/workflows/node.js.yml)
me trying to understand minecraft beta's protocol

<img src="https://eusv.net/images/mc-beta-server-readme-0.webp">

**Implemented:**
 - Basic flat terrain generation
 - "Decent" terrain generation using OpenSimplex Noise
 - Concept of worlds
 - Chunk management (loading / unloading)
 - Cross chunk structure generation (trees, buildings, etc...)
 - World/Chunk saving to disk
 - Block breaking

**WIP:**
 - Entities:
   - Players

**To Implement:**
 - Block placement
 - Entities:
   - Items
   - Mobs
 - Inventories (player inventory, containers, etc...)
 - Sleeping in beds
 - Tile entities
 - Probably a bunch more things that i'm forgetting
 
**Long Term:**
 - Make this as fast as possible on a single thread.
 - Only use thread pools if absolutely neccesary.
