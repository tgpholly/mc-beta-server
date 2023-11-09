import Vec3 from "../Vec3"

export interface IEntity {
	entityId:number,
	position:Vec3,
	motion:Vec3,
	lastPosition:Vec3,
	crouching:boolean,
	isDead:boolean,
	updateMetadata:() => void,
	distanceTo:(entity:IEntity) => number,
	onTick:() => void
}