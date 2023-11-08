import Vec3 from "../Vec3"

export interface IEntity {
	entityId:number,
	position:Vec3,
	lastPosition:Vec3,
	velocity:Vec3,
	crouching:boolean,
	updateMetadata:() => void,
	distanceTo:(entity:IEntity) => number,
	onTick:() => void
}