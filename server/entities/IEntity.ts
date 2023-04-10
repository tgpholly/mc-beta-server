export interface IEntity {
	entityId:number,
	x:number,
	y:number,
	z:number,
	lastX:number,
	lastY:number,
	lastZ:number,
	distanceTo:(entity:IEntity) => number,
	onTick:() => void
}