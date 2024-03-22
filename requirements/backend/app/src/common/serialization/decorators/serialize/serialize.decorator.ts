import { UseInterceptors } from "@nestjs/common";
import { SerializeInterceptor } from "../../interceptors/serialize/serialize.interceptor";

export function Serialize() {
    return (UseInterceptors(SerializeInterceptor));
}