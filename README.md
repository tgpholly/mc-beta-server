# mc-beta-server [![CodeFactor](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/badge/typescript)](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/overview/typescript)
me trying to understand minecraft beta's protocol

**Implemented:**
 - Basic flat terrain generation
 - "Decent" terrain generation using OpenSimplex Noise
 - Concept of worlds
 - Chunk management (loading / unloading)
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
 - Cross chunk structure generation (trees, buildings, etc...)
 - Inventories (player inventory, containers, etc...)
 - Sleeping in beds
 - Tile entities
 - Probably a bunch more things that i'm forgetting
 
**Long Term:**
 - Make this as fast as possible on a single thread.
 - Only use thread pools if absolutely neccesary.
