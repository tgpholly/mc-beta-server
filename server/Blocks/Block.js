class Block {
    static blocksList = [];
    static blockOpaqueList = [];
    static blockOpacity = [];
    static blockGrassable = [];
    static blockContainer = [];
    
    constructor(blockID = 0) {
        this.blockID = blockID;

        this.blockHardness = 0;
        this.blockResistance = 0;
        this.blockName = "";

        if (Block.blocksList[blockID] != null) {
            throw `[Block] Slot ${blockID} is already occupied by ${Block.blocksList[blockID]} when adding ID:${blockID}`;
        } else {
            Block.blocksList[blockID] = this;
            Block.blockOpaqueList[blockID] = false; // TODO: Block opaque
            Block.blockOpacity[blockID] = 0; // TODO: Opacity
            Block.blockGrassable[blockID] = false; // TODO: Get if block can be grass'd
            Block.blockContainer[blockID] = false; // TODO: Containers
        }
    }

    setHardness(hardness = 0) {
        this.blockHardness = hardness;
        return this;
    }

    setBlockUnbreakable() {
        this.blockHardness = -1;
        return this;
    }

    setResistance(resistance = 0) {
        this.blockHardness = resistance;
        return this;
    }

    setName(name = "") {
        this.blockName = name;
        return this;
    }

    static stone = new Block(1).setHardness(1.5).setResistance(10).setName("Stone");
    static grass = new Block(2).setHardness(0.6).setName("Grass");
    static dirt = new Block(3).setHardness(0.5).setName("Dirt");
    static cobblestone = new Block(4).setHardness(2.0).setResistance(10).setName("Cobblestone");
    static planks = new Block(5).setHardness(2).setResistance(5).setName("Planks");
    static sapling = new Block(6).setName("Sapling");
    static bedrock = new Block(7).setBlockUnbreakable().setResistance(6000000).setName("Bedrock");
    static waterFlowing = new Block(8).setHardness(100).setName("Flowing Water");
    static waterStill = new Block(9).setHardness(100).setName("Still Water");
    static lavaMoving = new Block(10).setHardness(1.5).setResistance(10).setName("Flowing Lava");
    static lavaStill = new Block(11).setHardness(1.5).setResistance(10).setName("Still Lava");
    static sand = new Block(12).setHardness(1.5).setResistance(10).setName("Sand");
    static gravel = new Block(13).setHardness(1.5).setResistance(10).setName("Gravel");
    static goldOre = new Block(14).setHardness(1.5).setResistance(10).setName("Gold Ore");
    static ironOre = new Block(15).setHardness(1.5).setResistance(10).setName("Iron Ore");
    static coalOre = new Block(16).setHardness(1.5).setResistance(10).setName("Coal Ore");
    static wood = new Block(17).setHardness(1.5).setResistance(10).setName("Wood");
    static leaves = new Block(18).setHardness(1.5).setResistance(10).setName("Leaves");
    static sponge = new Block(19).setHardness(1.5).setResistance(10).setName("Sponge");
    static glass = new Block(20).setHardness(1.5).setResistance(10).setName("Glass");
    static lapisOre = new Block(21).setHardness(1.5).setResistance(10).setName("Lapis Ore");
    static lapisBlock = new Block(22).setHardness(1.5).setResistance(10).setName("Lapis Block");
    static dispenser = new Block(23).setHardness(1.5).setResistance(10).setName("Dispenser");
    static sandStone = new Block(24).setHardness(1.5).setResistance(10).setName("Sandstone");
    static noteBlock = new Block(25).setHardness(1.5).setResistance(10).setName("Noteblock");
    static blockBed = new Block(26).setHardness(1.5).setResistance(10).setName("Bed");
    static poweredRail = new Block(27).setHardness(1.5).setResistance(10).setName("Powered Rail");
    static detectorRail = new Block(28).setHardness(1.5).setResistance(10).setName("Detector Rail");
    static stickyPisonBase = new Block(29).setHardness(1.5).setResistance(10).setName("Sticky Piston Base");
    static cobweb = new Block(30).setHardness(4).setName("Cobweb");
    static tallGrass = new Block(31).setName("Tall Grass");
    static deadBush = new Block(32).setName("Dead Bush");
    static pistonBase = new Block(33).setName("Piston Base");
    static pistonExtension = new Block(34).setName("Piston Extension");
    static wool = new Block(35).setHardness(0.8).setName("Wool");
    static pistonMoving = new Block(36).setName("Piston Moving")
    static dandilion = new Block(37).setName("Dandilion");
    static rose = new Block(38).setName("Rose");
}

module.exports = Block;