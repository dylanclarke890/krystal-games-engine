import { Entity } from "../../modules/core/entity.js";
import { Register } from "../../modules/core/register.js";

export class A extends Entity {}
export class B extends Entity {}
export class C extends Entity {}

Register.entityTypes(A, B, C);
