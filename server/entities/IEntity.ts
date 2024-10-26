import AABB from "../AABB"
import Vec3 from "../Vec3"

export default interface IEntity {
	entityId:number,
	position:Vec3,
	motion:Vec3,
	lastPosition:Vec3,
	crouching:boolean,
	isDead:boolean,
	markedForDisposal:boolean,
	entityAABB:AABB,
	updateMetadata:() => void,
	distanceTo:(entity:IEntity) => number,
	onTick:() => void
}