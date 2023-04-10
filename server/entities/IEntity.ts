export interface IEntity {
	entityId:number,
	x:number,
	y:number,
	z:number,
	lastX:number,
	lastY:number,
	lastZ:number,
	crouching:boolean,
	updateMetadata:() => void,
	distanceTo:(entity:IEntity) => number,
	onTick:() => void
}