# mc-beta-server [![CodeFactor](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/badge/typescript)](https://www.codefactor.io/repository/github/tgpholly/mc-beta-server/overview/typescript) [![Node.js CI](https://github.com/tgpholly/mc-beta-server/actions/workflows/node.js.yml/badge.svg?branch=typescript)](https://github.com/tgpholly/mc-beta-server/actions/workflows/node.js.yml)
me trying to understand minecraft beta's protocol

 - [Running the server](#running-the-server)
   - ~~[Running from a release](#running-from-a-release)~~
   - [Building yourself](#building-yourself)
 - [Setting up for development](#setting-up-for-development)

<hr>

<img src="https://eusv.net/images/mc-beta-server-readme-1-overworld.webp" alt="Minecraft landscape with trees, caves, flowers, shrubs and an ocean.">
<img src="https://eusv.net/images/mc-beta-server-readme-1-nether.webp" alt="WIP Minecraft Nether with very simple terrain.">

**Implemented:**
 - Basic flat terrain generation
 - Basic (top to bottom, no spread) Lighting
 - "Decent" terrain generation using OpenSimplex Noise
 - Multi-World support
 - Chunk management (loading / unloading)
 - Cross chunk structure generation (trees, buildings, etc...)
 - World/Chunk saving to disk
 - Block breaking

**WIP:**
 - Entities:
   - Players
 - Dimensions:
   - Nether

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

<hr>

## Running the server
**Heads Up!**
This server is under pretty heavy development with most likley breaking changes, I will try my best to keep compatibility in the save formats (or provide migration paths) with updates but cannot guarentee it.


To use the server either grab a [release](https://github.com/tgpholly/mc-beta-server/releases/latest) or build it yourself.

### Running from a release
~~When using a release all you need to do is run the executable you get from the download.~~

### Building yourself
To build the server yourself clone the repo and run
```
npm i
npm run build
```
This will automatically build the server and pack it into a single js file, you'll find your resulting js file in the `./build` folder.

## Setting up for development
To run the server simply clone the repo, and run:
```
npm i
```
Copy the [`config.example.json`](https://github.com/tgpholly/mc-beta-server/blob/typescript/config.example.json) to `config.json` and edit how you want it, then run:
```
npm run dev:run
```
You are now running a server locally!
When running the server with `npm run dev:run` it is running with nodemon, this means that the server will auto restart as you edit.
